/**
 * Cloud Function: createStudentProfile
 *
 * Creates a student profile in Firestore after Firebase Auth registration.
 * Validates CPF, age (≥18), and documents using OCR.
 *
 * Dependencies:
 * - Firebase Auth (user verification)
 * - Firestore (/users/{userId}, /students/{userId})
 * - Google Cloud Vision API (OCR document validation)
 * - CPF validation library
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { validateCPF, validateAge } from '../utils/validators';
import { FunctionError, ErrorCodes } from '../utils/errors';
import { StudentRegistrationData } from '../types/auth.types';

/**
 * HTTP Callable function to create student profile
 */
export const createStudentProfile = functions.https.onCall(
  async (data: StudentRegistrationData, context) => {
    // Verify authentication
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
          'Invalid CPF format or verification digits',
          400,
          { cpf: data.cpf }
        );
      }

      // 2. Validate age (≥18 years)
      if (!validateAge(data.birthDate, 18)) {
        throw new FunctionError(
          ErrorCodes.UNDERAGE,
          'Student must be at least 18 years old',
          400,
          { birthDate: data.birthDate }
        );
      }

      // 3. Validate required documents
      if (!data.documents.rg || !data.documents.proofOfAddress) {
        throw new FunctionError(
          ErrorCodes.MISSING_DOCUMENTS,
          'RG and proof of address are required',
          400
        );
      }

      // 4. Validate LGPD acceptance
      if (!data.acceptLGPD) {
        throw new FunctionError(
          ErrorCodes.VALIDATION_ERROR,
          'LGPD consent is required',
          400
        );
      }

      // 5. Check if CPF already exists
      const existingUser = await db
        .collection('users')
        .where('cpf', '==', data.cpf)
        .limit(1)
        .get();

      if (!existingUser.empty) {
        throw new FunctionError(
          ErrorCodes.ALREADY_EXISTS,
          'CPF already registered',
          409,
          { cpf: data.cpf }
        );
      }

      // 6. Perform OCR on RG document (async)
      const ocrData = await extractRGData(data.documents.rg);

      // 7. Create user document in Firestore
      const userRef = db.collection('users').doc(userId);
      await userRef.set({
        type: 'student',
        cpf: data.cpf,
        email: data.email,
        emailVerified: false,
        phoneVerified: false,
        status: 'ativo',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      // 8. Create student profile
      const studentRef = db.collection('students').doc(userId);
      await studentRef.set({
        name: data.name,
        birthDate: data.birthDate,
        phone: data.phone,
        cpf: data.cpf,
        documents: {
          rg: data.documents.rg,
          cnh: data.documents.cnh || null,
          proofOfAddress: data.documents.proofOfAddress,
          rgData: ocrData // Extracted OCR data
        },
        preferences: {
          category: null,
          budget: null,
          schedule: null
        },
        progress: {
          theoreticalHours: 0,
          practicalHours: 0,
          requiredTheoretical: 20,
          requiredPractical: 20,
          examEligible: false
        },
        lgpdConsent: {
          acceptedAt: admin.firestore.FieldValue.serverTimestamp(),
          locationTracking: false,
          dataSharing: false,
          marketing: false,
          thirdPartySharing: false
        },
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });

      // 9. Send email verification
      await sendEmailVerification(userId, data.email);

      // 10. Log successful registration
      console.log(`Student profile created: ${userId}`, {
        cpf: data.cpf,
        email: data.email
      });

      return {
        profileId: userId,
        status: 'active',
        message: 'Profile created successfully'
      };

    } catch (error) {
      // Handle and log errors
      console.error('Error creating student profile:', error);

      if (error instanceof FunctionError) {
        throw new functions.https.HttpsError(
          'invalid-argument',
          error.message,
          error.toJSON()
        );
      }

      throw new functions.https.HttpsError(
        'internal',
        'Failed to create student profile',
        { originalError: error.message }
      );
    }
  }
);

/**
 * Helper: Extract RG data using Google Cloud Vision API
 */
async function extractRGData(rgStorageUrl: string): Promise<any> {
  try {
    // TODO: Implement Google Cloud Vision API integration
    // This is a placeholder for OCR functionality

    const vision = require('@google-cloud/vision');
    const client = new vision.ImageAnnotatorClient();

    const [result] = await client.documentTextDetection(rgStorageUrl);
    const fullText = result.fullTextAnnotation?.text || '';

    // Extract RG number pattern (e.g., "12.345.678-9")
    const rgPattern = /\d{1,2}\.\d{3}\.\d{3}-\d{1}/;
    const rgMatch = fullText.match(rgPattern);

    return {
      documentNumber: rgMatch ? rgMatch[0] : null,
      extractedText: fullText.substring(0, 500), // First 500 chars
      extractedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error('OCR extraction failed:', error);
    throw new FunctionError(
      ErrorCodes.OCR_FAILED,
      'Failed to extract RG data',
      500,
      { error: error.message }
    );
  }
}

/**
 * Helper: Send email verification
 */
async function sendEmailVerification(userId: string, email: string): Promise<void> {
  try {
    // Get Firebase Auth user
    const user = await admin.auth().getUser(userId);

    // Generate verification link
    const actionCodeSettings = {
      url: `https://autofacil.com/verify-email?userId=${userId}`,
      handleCodeInApp: true
    };

    const link = await admin.auth().generateEmailVerificationLink(
      email,
      actionCodeSettings
    );

    // TODO: Send via SendGrid with custom template
    // For now, we'll just log it
    console.log(`Email verification link generated for ${email}:`, link);

    // Store pending verification in Firestore
    await admin.firestore()
      .collection('pendingVerifications')
      .doc(userId)
      .set({
        email,
        type: 'email',
        link,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24h
      });

  } catch (error) {
    console.error('Failed to send email verification:', error);
    // Don't throw - verification can be retried later
  }
}

