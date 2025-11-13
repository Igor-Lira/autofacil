/**
 * Cloud Function: sendEmailVerification
 *
 * Sends email verification link using Firebase Auth.
 * Triggered on registration or manual resend request.
 *
 * Dependencies:
 * - Firebase Auth (sendEmailVerification)
 * - SendGrid API (template emails)
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { FunctionError, ErrorCodes } from '../utils/errors';

export const sendEmailVerification = functions.https.onCall(
  async (data: { userId: string; email: string }, context) => {
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
      // 1. Check rate limiting (max 3 emails per hour)
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      const recentEmails = await db
        .collection('pendingVerifications')
        .where('userId', '==', userId)
        .where('type', '==', 'email')
        .where('createdAt', '>', oneHourAgo)
        .get();

      if (recentEmails.size >= 3) {
        throw new FunctionError(
          ErrorCodes.RATE_LIMIT_EXCEEDED,
          'Too many verification emails requested. Try again later.',
          429
        );
      }

      // 2. Get user from Firebase Auth
      const user = await admin.auth().getUser(userId);

      // 3. Generate email verification link
      const actionCodeSettings = {
        url: `https://autofacil.com/verify-email?userId=${userId}`,
        handleCodeInApp: true
      };

      const verificationLink = await admin.auth().generateEmailVerificationLink(
        data.email,
        actionCodeSettings
      );

      // 4. Store pending verification
      await db.collection('pendingVerifications').add({
        userId,
        email: data.email,
        type: 'email',
        link: verificationLink,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
      });

      // 5. Send email via SendGrid
      await sendVerificationEmail(data.email, verificationLink);

      console.log(`Email verification sent to ${data.email}`);

      return {
        message: 'Verification email sent',
        expiresIn: 86400 // 24 hours in seconds
      };

    } catch (error) {
      console.error('Error sending email verification:', error);

      if (error instanceof FunctionError) {
        throw new functions.https.HttpsError(
          'invalid-argument',
          error.message,
          error.toJSON()
        );
      }

      throw new functions.https.HttpsError(
        'internal',
        'Failed to send verification email',
        { originalError: error.message }
      );
    }
  }
);

/**
 * Helper: Send verification email via SendGrid
 */
async function sendVerificationEmail(email: string, link: string): Promise<void> {
  try {
    // TODO: Implement SendGrid integration
    // const sgMail = require('@sendgrid/mail');
    // sgMail.setApiKey(process.env.SENDGRID_API_KEY);

    // const msg = {
    //   to: email,
    //   from: 'noreply@autofacil.com',
    //   templateId: 'd-xxxxx', // SendGrid template ID
    //   dynamicTemplateData: {
    //     verification_link: link
    //   }
    // };

    // await sgMail.send(msg);

    console.log(`Email would be sent to ${email} with link: ${link}`);

  } catch (error) {
    console.error('Failed to send email:', error);
    // Don't throw - user can request resend
  }
}

