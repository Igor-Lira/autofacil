# AutoFacil - User Flow Diagrams Index

This directory contains comprehensive flow diagrams showing all user interactions, API requests, and Cloud Functions for the AutoFacil platform.

## 📋 Diagram Files

### 1. **Student Registration Flow** (`01-student-registration-flow.md`)
- Firebase Auth integration (`createUserWithEmailAndPassword`)
- Document upload to Cloud Storage
- `createStudentProfile` Cloud Function
- CPF validation and age verification (≥18 years)
- OCR document extraction via Google Vision API
- Email verification workflow

**Key Cloud Functions:**
- `createStudentProfile`
- `sendEmailVerification`

---

### 2. **Instructor Registration & Approval** (`02-instructor-registration-flow.md`)
- Instructor profile creation with stricter validation
- `createInstructorProfile` and `validateCNHWithDetran` Cloud Functions
- Async CNH validation with Detran state APIs (10s timeout)
- Auto-approval logic vs. manual admin review
- Vehicle plate validation via Denatran API
- Admin approval/rejection workflows

**Key Cloud Functions:**
- `createInstructorProfile`
- `validateCNHWithDetran`
- `approveInstructor`
- `rejectInstructor`

---

### 3. **Instructor Search & Discovery** (`03-instructor-search-flow.md`)
- `searchInstructors` with geolocation (Haversine formula)
- Redis caching strategy (5-minute TTL)
- Ranking algorithm: Proximity (40%) + Rating (30%) + Price (20%) + Availability (10%)
- `getInstructorAvailability` for calendar slots
- Firestore composite indexes optimization
- Pagination and filtering

**Key Cloud Functions:**
- `searchInstructors`
- `getInstructorAvailability`

---

### 4. **Booking Creation & Confirmation** (`04-booking-creation-flow.md`)
- `createBooking` with atomic Firestore transaction locks
- 20% deposit payment via PIX (Mercado Pago integration)
- 2-hour instructor acceptance window with Pub/Sub timeout
- `confirmBooking` workflow
- Payment processing with `processPayment` and webhook handling
- Cancellation and timeout scenarios

**Key Cloud Functions:**
- `createBooking`
- `processPayment`
- `handlePaymentWebhook`
- `confirmBooking`
- Auto-timeout handler (Pub/Sub scheduled task)

---

### 5. **Lesson Completion & Detran Validation** (`05-lesson-completion-detran-flow.md`)
- `markLessonCompleted` by instructor
- Async `validateLessonWithDetran` with state-specific APIs
- Student progress tracking (theoretical/practical hours)
- Exam eligibility calculation (20h + 20h requirement)
- 24-hour payment hold period
- `releasePaymentToInstructor` (85% split)
- Manual validation fallback for Detran API failures

**Key Cloud Functions:**
- `markLessonCompleted`
- `validateLessonWithDetran`
- `releasePaymentToInstructor`
- `checkExamEligibility`
- `uploadDetranProtocol` (manual fallback)

---

### 6. **GPS Tracking & SOS Emergency** (`06-gps-tracking-sos-flow.md`)
- `startTracking` with LGPD consent verification
- Real-time location updates every 30 seconds (`updateLocation`)
- WebSocket streaming via Pub/Sub
- Erratic driving detection (speed changes >40km/h)
- `sendSOSAlert` with emergency contact notifications
- `stopTracking` with route aggregation
- Automatic data anonymization after 7 days (LGPD compliance)

**Key Cloud Functions:**
- `startTracking`
- `updateLocation`
- `sendSOSAlert`
- `stopTracking`
- `anonymizeOldTrackingData` (Cloud Scheduler daily job)

---

### 7. **Chat & Communication** (`07-chat-communication-flow.md`)
- `sendChatMessage` with content moderation
- Google Perspective API for profanity filtering
- Support for text, audio (≤1min), and images (≤5MB)
- `reportMessage` with auto-ban logic (3 strikes)
- Real-time message sync via Firestore listeners
- Message status lifecycle (sent → delivered → read)

**Key Cloud Functions:**
- `sendChatMessage`
- `reportMessage`
- Moderation middleware with Perspective API

---

### 8. **Payment Processing & Wallet** (`08-payment-wallet-flow.md`)
- `processPayment` for PIX, credit card, and boleto
- Mercado Pago SDK integration
- `handlePaymentWebhook` for payment confirmations
- `releasePaymentToInstructor` with 15% platform commission
- `requestWithdrawal` (PIX instant or TED 1-2 days)
- `processRefund` with cancellation policy logic
- Monthly fiscal report generation

**Key Cloud Functions:**
- `processPayment`
- `handlePaymentWebhook`
- `releasePaymentToInstructor`
- `requestWithdrawal`
- `processRefund`
- `generateMonthlyReports` (Cloud Scheduler monthly job)

---

### 9. **LGPD Compliance & Data Management** (`09-lgpd-compliance-flow.md`)
- `exportUserData` (right to data portability)
- Async data compilation with 7-day download link
- `deleteUserAccount` with 30-day grace period
- User data anonymization strategy
- `updateConsentPreferences` with audit logging
- Scheduled anonymization jobs (GPS data after 7 days)
- Data retention policies by category

**Key Cloud Functions:**
- `exportUserData`
- `checkExportStatus`
- `deleteUserAccount`
- `cancelAccountDeletion`
- `updateConsentPreferences`
- `anonymizeOldData` (Cloud Scheduler daily job)

---

### 10. **Admin Panel & Moderation** (`10-admin-moderation-flow.md`)
- `getInstructorsPendingApproval` with pagination
- `approveInstructor` and `rejectInstructor` workflows
- `getModerationReports` with priority queue algorithm
- `suspendUser` with cascade booking cancellations
- Fraud detection dashboard
- Bulk approval actions
- Analytics export and fiscal reporting

**Key Cloud Functions:**
- `getInstructorsPendingApproval`
- `approveInstructor`
- `rejectInstructor`
- `getModerationReports`
- `suspendUser`
- `bulkApproveInstructors`
- `generateMonthlyReports`

---

## 🔄 Common Patterns

### Authentication Flow
All API requests (except registration/login) use Firebase Auth ID tokens:
```
Authorization: Bearer <Firebase_ID_Token>
```

### Error Handling
Standardized `ErrorResponse` schema:
```json
{
  "code": "VALIDATION_ERROR",
  "message": "Invalid CPF format",
  "details": { "field": "cpf" },
  "timestamp": "2025-11-13T10:30:00Z"
}
```

### Async Processing
Long-running tasks use Pub/Sub queues:
- Detran validation (10s timeout → fallback queue)
- Payment release (24h scheduled delay)
- Data export (5-10 minute processing)
- Anonymization jobs (daily cron)

### Real-Time Updates
WebSocket/Firestore listeners for:
- Chat messages
- GPS tracking
- Booking status changes
- Payment confirmations

---

## 📊 Performance Metrics

| Operation | Target Latency | Cache Strategy |
|-----------|----------------|----------------|
| Instructor Search | <500ms | Redis (5min TTL) |
| Booking Creation | <1s | Atomic transaction |
| Payment Processing | <3s | Webhook async |
| GPS Update | <200ms | Pub/Sub stream |
| Chat Message | <300ms | Firestore realtime |
| Data Export | 5-10min | Background job |

---

## 🗄️ Firestore Structure

Key collections referenced across diagrams:
```
/users/{userId}
/students/{userId}
/instructors/{userId}
  /calendar (subcollection)
  /wallet (nested document)
/bookings/{bookingId}
/payments/{paymentId}
/chats/{bookingId}
  /messages (subcollection)
/trackingSessions/{trackingId}
  /route (subcollection)
/reports/{reportId}
/walletTransactions/{txId}
```

---

## 🔐 Security Considerations

1. **Firebase Auth** for all authenticated endpoints
2. **Firestore Security Rules** enforce user ownership
3. **Cloud KMS** for sensitive data encryption
4. **Rate Limiting** via Cloud Armor (5-30 req/min)
5. **Webhook Validation** with HMAC signatures
6. **LGPD Consent** checks before tracking/data sharing

---

## 📈 Scalability Notes

- **Serverless**: Auto-scaling Cloud Functions (0 to 1M+ invocations)
- **Caching**: Redis for hot data (search results, availability)
- **Indexing**: Composite indexes on Firestore queries
- **CDN**: Static assets via Firebase Hosting
- **Monitoring**: Cloud Logging + Crashlytics + performance alerts

---

## 🎯 Next Steps

After reviewing these diagrams:
1. Implement Firebase project structure
2. Set up Cloud Functions deployment
3. Configure Firestore indexes
4. Integrate third-party APIs (Mercado Pago, Detran, Google Vision)
5. Build mobile app screens based on flows
6. Set up monitoring and alerts
7. Test error scenarios and edge cases

---

**Total Cloud Functions**: 45+  
**Estimated Monthly Invocations (1M MAU)**: ~50M  
**Firestore Reads/Writes**: ~200M reads, ~50M writes/month

