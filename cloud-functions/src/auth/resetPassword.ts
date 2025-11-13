/**
 * Cloud Function: resetPassword
 *
 * Sends password reset email via Firebase Auth.
 * Logs request for security audit.
 *
 * Dependencies:
 * - Firebase Auth (sendPasswordResetEmail)
 * - Cloud Logging
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { FunctionError, ErrorCodes } from '../utils/errors';

export const resetPassword = functions.https.onCall(
  async (data: { email: string }, context) => {
    const db = admin.firestore();

    try {
      // 1. Validate email format
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(data.email)) {
        throw new FunctionError(
          ErrorCodes.VALIDATION_ERROR,
          'Invalid email format',
          400
        );
      }

      // 2. Check rate limiting (max 3 reset requests per hour per email)
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      const recentResets = await db
        .collection('passwordResets')
        .where('email', '==', data.email)
        .where('createdAt', '>', oneHourAgo)
        .get();

      if (recentResets.size >= 3) {
        throw new FunctionError(
          ErrorCodes.RATE_LIMIT_EXCEEDED,
          'Too many password reset requests. Try again later.',
          429
        );
      }

      // 3. Generate password reset link
      const actionCodeSettings = {
        url: 'https://autofacil.com/reset-password',
        handleCodeInApp: true
      };

      const resetLink = await admin.auth().generatePasswordResetLink(
        data.email,
        actionCodeSettings
      );

      // 4. Log reset request for security audit
      await db.collection('passwordResets').add({
        email: data.email,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        ipAddress: context.rawRequest?.ip || 'unknown',
        userAgent: context.rawRequest?.headers['user-agent'] || 'unknown'
      });

      // 5. Send reset email
      await sendPasswordResetEmail(data.email, resetLink);

      console.log(`Password reset requested for ${data.email}`);

      // Always return success to prevent email enumeration
      return {
        message: 'If an account exists with this email, a password reset link has been sent.'
      };

    } catch (error) {
      console.error('Error processing password reset:', error);

      // Always return 200 to prevent email enumeration
      return {
        message: 'If an account exists with this email, a password reset link has been sent.'
      };
    }
  }
);

/**
 * Helper: Send password reset email
 */
async function sendPasswordResetEmail(email: string, link: string): Promise<void> {
  try {
    // TODO: Implement SendGrid integration
    console.log(`Password reset email would be sent to ${email} with link: ${link}`);
  } catch (error) {
    console.error('Failed to send password reset email:', error);
  }
}

