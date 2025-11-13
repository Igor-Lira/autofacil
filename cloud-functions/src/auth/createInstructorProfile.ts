/**
 * Cloud Function: createInstructorProfile
 *
 * Creates an instructor profile with status "pendente".
 * Validates CNH (with EAR), certificate, age (≥21), experience (≥2 years), and vehicle data.
 * Triggers OCR extraction and async CNH validation with Detran.
 *
 * Dependencies:
 * - Firebase Auth, Firestore
 * - Cloud Vision API (OCR)
 * - Denatran API (vehicle plate validation)
 * - Detran API (CNH validation with timeout 10s)
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { validateCPF, validateAge } from '../utils/validators';
import { FunctionError, ErrorCodes } from '../utils/errors';
import { InstructorRegistrationData } from '../types/auth.types';

export const createInstructorProfile = functions.https.onCall(
  async (data: InstructorRegistrationData, context) => {
    if (!context.auth) {
      throw new FunctionError(
        ErrorCodes.UNAUTHORIZED,
        'User must be authenticated',
        401
      );
    }

    const userId = context.auth.uid;
    const db = admin.firestore();

    try {
      // 1. Validate CPF
      if (!validateCPF(data.cpf)) {
        throw new FunctionError(
          ErrorCodes.INVALID_CPF,
          'Invalid CPF format',
          400
        );
      }

      // 2. Validate age (≥21 years)
      if (!validateAge(data.birthDate, 21)) {
        throw new FunctionError(
          ErrorCodes.UNDERAGE,
          'Instructor must be at least 21 years old',
          400
        );
      }

      // 3. Validate experience (≥2 years)
      if (data.experienceYears < 2) {
        throw new FunctionError(
          ErrorCodes.VALIDATION_ERROR,
          'Minimum 2 years of experience required',
          400,
          { experienceYears: data.experienceYears }
        );
      }

      // 4. Validate required documents
      if (!data.cnh || !data.detranCertificate) {
        throw new FunctionError(
          ErrorCodes.MISSING_DOCUMENTS,
          'CNH and Detran certificate are required',
          400
        );
      }

      // 5. Validate categories
      const validCategories = ['A', 'B', 'C', 'D', 'E', 'ACC'];
      if (!data.categories.every(cat => validCategories.includes(cat))) {
        throw new FunctionError(
          ErrorCodes.VALIDATION_ERROR,
          'Invalid category specified',
          400,
          { categories: data.categories }
        );
      }

      // 6. Validate vehicle
      if (!data.vehicle.model || !data.vehicle.plate || !data.vehicle.year) {
        throw new FunctionError(
          ErrorCodes.VALIDATION_ERROR,
          'Complete vehicle information required',
          400
        );
      }

      // 7. Validate vehicle year (≤12 years old)
      const currentYear = new Date().getFullYear();
      if (currentYear - data.vehicle.year > 12) {
        throw new FunctionError(
          ErrorCodes.VALIDATION_ERROR,
          'Vehicle must not be older than 12 years',
          400,
          { vehicleYear: data.vehicle.year }
        );
      }

      // 8. Check if CPF already exists
      const existingUser = await db
        .collection('users')
        .where('cpf', '==', data.cpf)
        .limit(1)
        .get();

      if (!existingUser.empty) {
        throw new FunctionError(
          ErrorCodes.ALREADY_EXISTS,
          'CPF already registered',
          409
        );
      }

      // 9. Perform OCR on CNH to extract data
      const cnhData = await extractCNHData(data.cnh);

      // 10. Validate vehicle plate with Denatran API
      const vehicleValidation = await validateVehiclePlate(data.vehicle.plate);

      // 11. Create user document
      const userRef = db.collection('users').doc(userId);
      await userRef.set({
        type: 'instructor',
        cpf: data.cpf,
        email: data.email,
        emailVerified: false,
        phoneVerified: false,
        status: 'pendente', // Pending admin approval
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      // 12. Create instructor profile
      const instructorRef = db.collection('instructors').doc(userId);
      await instructorRef.set({
        name: data.name,
        birthDate: data.birthDate,
        phone: data.phone,
        cpf: data.cpf,
        email: data.email,
        status: 'pendente',
        documents: {
          cnh: data.cnh,
          cnhData: cnhData,
          detranCertificate: data.detranCertificate,
          criminalRecord: data.criminalRecord || null
        },
        vehicle: {
          ...data.vehicle,
          validated: vehicleValidation.valid,
          validatedAt: new Date().toISOString()
        },
        experienceYears: data.experienceYears,
        categories: data.categories,
        pricePerHour: data.pricePerHour || 80,
        rating: 0,
        totalReviews: 0,
        badges: [],
        detranValidated: false,
        requiresManualReview: false,
        lgpdConsent: {
          acceptedAt: admin.firestore.FieldValue.serverTimestamp(),
          locationTracking: false,
          dataSharing: false,
          marketing: false,
          thirdPartySharing: false
        },
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });

      // 13. Trigger async CNH validation with Detran
      await triggerCNHValidation(userId, {
        cnhNumber: cnhData.cnhNumber || '',
        cpf: data.cpf,
        state: 'SP', // TODO: Extract from user location
        expiryDate: cnhData.expiryDate || ''
      });

      // 14. Log registration
      console.log(`Instructor profile created: ${userId}`, {
        cpf: data.cpf,
        categories: data.categories
      });

      return {
        profileId: userId,
        status: 'pendente',
        message: 'Profile pending approval'
      };

    } catch (error) {
      console.error('Error creating instructor profile:', error);

      if (error instanceof FunctionError) {
        throw new functions.https.HttpsError(
          'invalid-argument',
          error.message,
          error.toJSON()
        );
      }

      throw new functions.https.HttpsError(
        'internal',
        'Failed to create instructor profile',
        { originalError: error.message }
      );
    }
  }
);

/**
 * Helper: Extract CNH data using OCR
 */
async function extractCNHData(cnhStorageUrl: string): Promise<any> {
  try {
    // TODO: Implement Google Cloud Vision API integration
    const vision = require('@google-cloud/vision');
    const client = new vision.ImageAnnotatorClient();

    const [result] = await client.documentTextDetection(cnhStorageUrl);
    const fullText = result.fullTextAnnotation?.text || '';

    // Extract CNH number pattern
    const cnhPattern = /\d{11}/;
    const cnhMatch = fullText.match(cnhPattern);

    // Extract expiry date pattern (DD/MM/YYYY)
    const datePattern = /(\d{2})\/(\d{2})\/(\d{4})/g;
    const dates = fullText.match(datePattern);

    return {
      cnhNumber: cnhMatch ? cnhMatch[0] : null,
      expiryDate: dates && dates.length > 0 ? dates[dates.length - 1] : null,
      extractedText: fullText.substring(0, 500),
      extractedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error('CNH OCR extraction failed:', error);
    throw new FunctionError(
      ErrorCodes.OCR_FAILED,
      'Failed to extract CNH data',
      500
    );
  }
}

/**
 * Helper: Validate vehicle plate with Denatran API
 */
async function validateVehiclePlate(plate: string): Promise<{ valid: boolean; model?: string; year?: number }> {
  try {
    // TODO: Implement Denatran API integration
    // This is a placeholder implementation

    // Validate plate format (Brazilian: ABC-1234 or ABC1D23)
    const platePattern = /^[A-Z]{3}[\-]?\d{4}$|^[A-Z]{3}\d[A-Z]\d{2}$/;

    if (!platePattern.test(plate)) {
      return { valid: false };
    }

    // Mock API call
    // const response = await axios.post('https://api.denatran.gov.br/validate-plate', { plate });

    return {
      valid: true,
      model: 'Mock Model', // Would come from API
      year: 2020
    };
  } catch (error) {
    console.error('Vehicle plate validation failed:', error);
    return { valid: false };
  }
}

/**
 * Helper: Trigger async CNH validation with Detran
 */
async function triggerCNHValidation(instructorId: string, cnhData: any): Promise<void> {
  try {
    // Queue validation task for async processing
    const db = admin.firestore();

    await db.collection('cnhValidationQueue').add({
      instructorId,
      cnhData,
      status: 'pending',
      attempts: 0,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    console.log(`CNH validation queued for instructor: ${instructorId}`);
  } catch (error) {
    console.error('Failed to queue CNH validation:', error);
    // Don't throw - validation can be retried manually
  }
}

