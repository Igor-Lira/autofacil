/**
 * Main index file for AutoFacil Cloud Functions
 * Exports all authentication and user management functions
 */

import * as admin from 'firebase-admin';

// Initialize Firebase Admin SDK
admin.initializeApp();

// Authentication & User Management Functions
export { createStudentProfile } from './auth/createStudentProfile';
export { createInstructorProfile } from './auth/createInstructorProfile';
export {
  validateCNHWithDetran,
  processCNHValidationQueue
} from './auth/validateCNHWithDetran';
export {
  sendSMSVerification,
  verifySMSCode
} from './auth/smsVerification';
export { sendEmailVerification } from './auth/emailVerification';
export { resetPassword } from './auth/resetPassword';

// Search & Matching Functions
export { searchInstructors } from './search/searchInstructors';
export {
  getInstructorAvailability,
  syncInstructorCalendar
} from './search/getInstructorAvailability';
