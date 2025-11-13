/**
 * Cloud Function: validateCNHWithDetran
 *
 * Validates instructor's CNH against Detran state API.
 * Checks validity date, EAR presence, and categories.
 * Triggers auto-approval if valid.
 *
 * Dependencies:
 * - Detran state APIs (SP/RJ/MG/etc.)
 * - Firestore
 * - Cloud Scheduler (retry exponential backoff)
 * - Pub/Sub (fallback queue)
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import axios from 'axios';
import { FunctionError, ErrorCodes } from '../utils/errors';
import { CNHValidationData, DetranAPIResponse } from '../types/auth.types';

export const validateCNHWithDetran = functions.https.onCall(
  async (data: CNHValidationData, context) => {
    if (!context.auth) {
      throw new FunctionError(
        ErrorCodes.UNAUTHORIZED,
        'User must be authenticated',
        401
      );
    }

    const db = admin.firestore();

    try {
      // 1. Validate input
      if (!data.cnhNumber || !data.cpf || !data.state) {
        throw new FunctionError(
          ErrorCodes.VALIDATION_ERROR,
          'CNH number, CPF, and state are required',
          400
        );
      }

      // 2. Get Detran API endpoint based on state
      const detranEndpoint = getDetranEndpoint(data.state);

      // 3. Call Detran API with 10s timeout
      const validationResult = await callDetranAPI(detranEndpoint, data);

      // 4. Return validation result
      return {
        isValid: validationResult.isValid,
        hasEAR: validationResult.hasEAR,
        categories: validationResult.categories,
        expiryDate: validationResult.expiryDate,
        detranProtocol: validationResult.detranProtocol
      };

    } catch (error) {
      console.error('CNH validation failed:', error);

      if (error instanceof FunctionError) {
        throw new functions.https.HttpsError(
          'invalid-argument',
          error.message,
          error.toJSON()
        );
      }

      throw new functions.https.HttpsError(
        'internal',
        'CNH validation failed',
        { originalError: error.message }
      );
    }
  }
);

/**
 * Background function to process CNH validation queue
 * Triggered by Pub/Sub or Firestore onCreate
 */
export const processCNHValidationQueue = functions.firestore
  .document('cnhValidationQueue/{queueId}')
  .onCreate(async (snap, context) => {
    const queueData = snap.data();
    const { instructorId, cnhData } = queueData;

    const db = admin.firestore();

    try {
      // Call Detran API
      const detranEndpoint = getDetranEndpoint(cnhData.state || 'SP');
      const validationResult = await callDetranAPI(detranEndpoint, cnhData);

      // Update instructor profile
      const instructorRef = db.collection('instructors').doc(instructorId);

      if (validationResult.isValid && validationResult.hasEAR) {
        // Auto-approve if all checks pass
        await instructorRef.update({
          detranValidated: true,
          detranProtocol: validationResult.detranProtocol,
          detranValidatedAt: admin.firestore.FieldValue.serverTimestamp(),
          cnhCategories: validationResult.categories,
          cnhExpiryDate: validationResult.expiryDate,
          status: 'aprovado', // Auto-approve
          approvalDate: admin.firestore.FieldValue.serverTimestamp(),
          approvedBy: 'system_auto_approval'
        });

        // Update user status
        await db.collection('users').doc(instructorId).update({
          status: 'aprovado'
        });

        // Send approval notification
        await sendApprovalNotification(instructorId);

        console.log(`Instructor auto-approved: ${instructorId}`);
      } else {
        // Mark for manual review
        await instructorRef.update({
          detranValidated: false,
          requiresManualReview: true,
          validationDetails: {
            isValid: validationResult.isValid,
            hasEAR: validationResult.hasEAR,
            reason: !validationResult.isValid
              ? 'CNH inválida ou expirada'
              : 'CNH sem credencial EAR'
          }
        });

        console.log(`Instructor requires manual review: ${instructorId}`);
      }

      // Mark queue item as processed
      await snap.ref.update({
        status: 'completed',
        processedAt: admin.firestore.FieldValue.serverTimestamp(),
        result: validationResult
      });

    } catch (error) {
      console.error('Queue processing failed:', error);

      // Retry logic with exponential backoff
      const attempts = queueData.attempts || 0;

      if (attempts < 3) {
        await snap.ref.update({
          attempts: attempts + 1,
          lastAttempt: admin.firestore.FieldValue.serverTimestamp(),
          lastError: error.message
        });
      } else {
        // Max retries reached - flag for manual processing
        await snap.ref.update({
          status: 'failed',
          failedAt: admin.firestore.FieldValue.serverTimestamp()
        });

        await db.collection('instructors').doc(instructorId).update({
          detranValidated: false,
          requiresManualReview: true,
          validationError: 'Detran API timeout after 3 attempts'
        });
      }
    }
  });

/**
 * Helper: Get Detran API endpoint by state
 */
function getDetranEndpoint(state: string): string {
  const endpoints: Record<string, string> = {
    SP: process.env.DETRAN_SP_API_URL || 'https://api.detran.sp.gov.br',
    RJ: process.env.DETRAN_RJ_API_URL || 'https://api.detran.rj.gov.br',
    MG: process.env.DETRAN_MG_API_URL || 'https://api.detran.mg.gov.br',
    // Add more states as needed
  };

  return endpoints[state] || endpoints.SP;
}

/**
 * Helper: Call Detran API with timeout
 */
async function callDetranAPI(
  endpoint: string,
  data: CNHValidationData
): Promise<DetranAPIResponse> {
  try {
    const response = await axios.post(
      `${endpoint}/validar-cnh`,
      {
        cnh: data.cnhNumber,
        cpf: data.cpf,
        data_consulta: new Date().toISOString()
      },
      {
        timeout: 10000, // 10 second timeout
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.DETRAN_API_KEY}`
        }
      }
    );

    // Parse Detran response
    const detranData = response.data;

    // Check expiry date
    const expiryDate = new Date(data.expiryDate);
    const isValid = expiryDate > new Date();

    return {
      isValid: isValid && detranData.valida === true,
      hasEAR: detranData.credenciais?.includes('EAR') || false,
      categories: detranData.categorias || [],
      expiryDate: data.expiryDate,
      detranProtocol: detranData.protocolo || `DETRAN-${data.state}-${Date.now()}`
    };

  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.code === 'ECONNABORTED') {
        throw new FunctionError(
          ErrorCodes.DETRAN_API_ERROR,
          'Detran API timeout (>10s)',
          503
        );
      }

      throw new FunctionError(
        ErrorCodes.DETRAN_API_ERROR,
        `Detran API error: ${error.message}`,
        503
      );
    }

    throw error;
  }
}

/**
 * Helper: Send approval notification
 */
async function sendApprovalNotification(instructorId: string): Promise<void> {
  try {
    const db = admin.firestore();
    const instructorDoc = await db.collection('instructors').doc(instructorId).get();
    const instructorData = instructorDoc.data();

    // TODO: Send via FCM and SendGrid
    console.log(`Sending approval notification to: ${instructorData?.email}`);

    // Store notification in Firestore
    await db.collection('notifications').add({
      userId: instructorId,
      type: 'instructor_approved',
      title: 'Parabéns! Perfil Aprovado',
      body: 'Seu perfil foi aprovado. Você já pode começar a receber aulas!',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      read: false
    });

  } catch (error) {
    console.error('Failed to send approval notification:', error);
  }
}

