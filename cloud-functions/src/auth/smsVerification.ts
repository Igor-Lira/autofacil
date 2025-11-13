/**
 * Cloud Function: sendSMSVerification
 *
 * Sends 6-digit SMS verification code.
 * Stores code hash in Firestore with 5-minute expiry.
 *
 * Dependencies:
 * - Twilio API / Firebase Phone Auth
 * - Firestore
 * - bcrypt (code hashing)
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as bcrypt from 'bcrypt';
import { FunctionError, ErrorCodes } from '../utils/errors';
import { SMSVerificationData } from '../types/auth.types';

export const sendSMSVerification = functions.https.onCall(
  async (data: SMSVerificationData, context) => {
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
      // 1. Validate phone format (Brazilian: +55XXXXXXXXXXX)
      const phonePattern = /^\+55\d{10,11}$/;
      if (!phonePattern.test(data.phone)) {
        throw new FunctionError(
          ErrorCodes.VALIDATION_ERROR,
          'Invalid Brazilian phone format. Use +55XXXXXXXXXXX',
          400,
          { phone: data.phone }
        );
      }

      // 2. Check rate limiting (max 3 codes per hour)
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      const recentCodes = await db
        .collection('verificationCodes')
        .where('userId', '==', userId)
        .where('type', '==', 'sms')
        .where('createdAt', '>', oneHourAgo)
        .get();

      if (recentCodes.size >= 3) {
        throw new FunctionError(
          ErrorCodes.RATE_LIMIT_EXCEEDED,
          'Too many verification codes requested. Try again later.',
          429
        );
      }

      // 3. Generate 6-digit code
      const code = generateVerificationCode();

      // 4. Hash the code
      const saltRounds = 10;
      const hashedCode = await bcrypt.hash(code, saltRounds);

      // 5. Store in Firestore with 5-minute expiry
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

      await db.collection('verificationCodes').add({
        userId,
        phone: data.phone,
        type: 'sms',
        hash: hashedCode,
        attempts: 0,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        expiresAt: admin.firestore.Timestamp.fromDate(expiresAt),
        verified: false
      });

      // 6. Send SMS via Twilio
      await sendSMS(data.phone, code);

      console.log(`SMS verification sent to ${data.phone} for user ${userId}`);

      return {
        message: 'Verification code sent',
        expiresIn: 300 // seconds
      };

    } catch (error) {
      console.error('Error sending SMS verification:', error);

      if (error instanceof FunctionError) {
        throw new functions.https.HttpsError(
          'invalid-argument',
          error.message,
          error.toJSON()
        );
      }

      throw new functions.https.HttpsError(
        'internal',
        'Failed to send verification code',
        { originalError: error.message }
      );
    }
  }
);

/**
 * Cloud Function: verifySMSCode
 *
 * Validates SMS code against stored hash.
 * Updates phoneVerified: true on success.
 * Implements rate limiting (max 3 attempts).
 */
export const verifySMSCode = functions.https.onCall(
  async (data: { userId: string; code: string }, context) => {
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
      // 1. Validate code format (6 digits)
      if (!/^\d{6}$/.test(data.code)) {
        throw new FunctionError(
          ErrorCodes.VALIDATION_ERROR,
          'Code must be 6 digits',
          400
        );
      }

      // 2. Get most recent unverified code
      const codesSnapshot = await db
        .collection('verificationCodes')
        .where('userId', '==', userId)
        .where('type', '==', 'sms')
        .where('verified', '==', false)
        .orderBy('createdAt', 'desc')
        .limit(1)
        .get();

      if (codesSnapshot.empty) {
        throw new FunctionError(
          ErrorCodes.NOT_FOUND,
          'No pending verification code found',
          404
        );
      }

      const codeDoc = codesSnapshot.docs[0];
      const codeData = codeDoc.data();

      // 3. Check if expired
      const now = new Date();
      const expiresAt = codeData.expiresAt.toDate();

      if (now > expiresAt) {
        throw new FunctionError(
          ErrorCodes.VALIDATION_ERROR,
          'Verification code expired',
          400
        );
      }

      // 4. Check attempts limit
      if (codeData.attempts >= 3) {
        throw new FunctionError(
          ErrorCodes.RATE_LIMIT_EXCEEDED,
          'Maximum verification attempts exceeded',
          429
        );
      }

      // 5. Verify code against hash
      const isValid = await bcrypt.compare(data.code, codeData.hash);

      if (!isValid) {
        // Increment attempts
        await codeDoc.ref.update({
          attempts: admin.firestore.FieldValue.increment(1)
        });

        const attemptsLeft = 3 - (codeData.attempts + 1);

        throw new FunctionError(
          ErrorCodes.VALIDATION_ERROR,
          'Invalid verification code',
          400,
          { attemptsLeft }
        );
      }

      // 6. Mark code as verified
      await codeDoc.ref.update({
        verified: true,
        verifiedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      // 7. Update user phoneVerified status
      await db.collection('users').doc(userId).update({
        phoneVerified: true,
        phone: codeData.phone,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      console.log(`Phone verified for user ${userId}`);

      return {
        verified: true,
        message: 'Phone verified successfully'
      };

    } catch (error) {
      console.error('Error verifying SMS code:', error);

      if (error instanceof FunctionError) {
        throw new functions.https.HttpsError(
          'invalid-argument',
          error.message,
          error.toJSON()
        );
      }

      throw new functions.https.HttpsError(
        'internal',
        'Failed to verify code',
        { originalError: error.message }
      );
    }
  }
);

/**
 * Helper: Generate 6-digit verification code
 */
function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Helper: Send SMS via Twilio
 */
async function sendSMS(phone: string, code: string): Promise<void> {
  try {
    // TODO: Implement Twilio API integration
    // const twilio = require('twilio');
    // const client = twilio(
    //   process.env.TWILIO_ACCOUNT_SID,
    //   process.env.TWILIO_AUTH_TOKEN
    // );

    // await client.messages.create({
    //   body: `Seu código de verificação AutoFacil é: ${code}. Válido por 5 minutos.`,
    //   from: process.env.TWILIO_PHONE_NUMBER,
    //   to: phone
    // });

    console.log(`SMS would be sent to ${phone} with code: ${code}`);

  } catch (error) {
    console.error('Failed to send SMS:', error);
    throw new FunctionError(
      ErrorCodes.VALIDATION_ERROR,
      'Failed to send SMS',
      500
    );
  }
}

