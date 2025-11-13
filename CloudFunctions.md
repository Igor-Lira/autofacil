# 🚀 Cloud Functions Documentation - AutoFacil

This document outlines all necessary Google Cloud Functions (GCF) for the AutoFacil platform, based on the specified requirements and API design.

---

## 1. Authentication & User Management

| Function | Purpose/Description | Input Example | Dependencies |
| :--- | :--- | :--- | :--- |
| **`createStudentProfile`** | Creates a **student profile** in Firestore after Firebase Auth registration. Validates CPF, age ($\geq 18$), and documents using **OCR**. | `{ userId, cpf, name, birthDate, phone, email, documents: {...}, acceptLGPD: boolean }` | Firebase Auth, Firestore, Google Cloud Vision API (OCR), CPF validation library |
| **`createInstructorProfile`** | Creates an instructor profile with status **"pendente"**. Validates CNH (with **EAR**), certificate, age ($\geq 21$), experience ($\geq 2$ years), and vehicle data. Triggers OCR extraction. | `{ userId, cpf, name, ..., cnh (URL), vehicle: {...}, experienceYears: number }` | Firebase Auth, Firestore, Cloud Vision API, Denatran API, Detran API |
| **`validateCNHWithDetran`** | Validates instructor's CNH against Detran state API (expiry, **EAR**, categories). Triggers auto-approval if valid. | `{ cnhNumber, cpf, state: 'SP', expiryDate }` | Detran state APIs, Firestore, Cloud Scheduler (retry), Pub/Sub (fallback) |
| **`sendEmailVerification`** | Sends email verification link using Firebase Auth. | `{ userId, email }` | Firebase Auth, SendGrid API |
| **`sendSMSVerification`** | Sends 6-digit SMS verification code. Stores code hash in Firestore with 5-minute expiry. | `{ userId, phone }` | Twilio API/Firebase Phone Auth, Firestore, bcrypt |
| **`verifySMSCode`** | Validates SMS code against stored hash. Updates `phoneVerified: true`. Implements rate limiting (**max 3 attempts**). | `{ userId, code }` | Firestore, bcrypt |
| **`resetPassword`** | Sends password reset email via Firebase Auth. Logs request for security audit. | `{ email }` | Firebase Auth, Cloud Logging |
| **`refreshAuthToken`** | Exchanges refresh token for new access token. | `{ refreshToken }` (Header) | Firebase Auth, JWT library, Firestore |

---

## 2. Search & Matching

| Function | Purpose/Description | Output/Return Example | Dependencies |
| :--- | :--- | :--- | :--- |
| **`searchInstructors`** | Searches instructors using **geolocation (Haversine)** and filters. Returns paginated results. | `HTTP 200` with `PaginatedInstructorsResponse` | Firestore (composite indexes), **Redis cache (5 min)**, GeoHash library |
| **`getInstructorAvailability`** | Returns available time slots for an instructor (next 30 days). Excludes booked slots and rest periods. | `HTTP 200` with `{ availability: [{ date: '...', slots: [...] }] }` | Firestore (`/calendar`, `/bookings`), moment-timezone |

---

## 3. Scheduling & Bookings

| Function | Purpose/Description | Key Mechanism | Payment/Conflict Handling |
| :--- | :--- | :--- | :--- |
| **`createBooking`** | Creates a booking with an **atomic lock**. Validates availability and payment deposit (**20%**). | Firestore transaction (lock) | Mercado Pago (PIX QR Code), Pub/Sub (2h acceptance window timeout) |
| **`confirmBooking`** | Instructor confirms booking within **2h**. Updates status to "confirmada". Schedules remaining **80%** payment. | Updates status to "confirmada" | FCM, Mercado Pago API |
| **`cancelBooking`** | Cancels booking with **refund logic**: Student penalty **50%** ($>24\text{h}$), Instructor penalty **100%** ($<12\text{h}$). | Updates status to "cancelada" | Mercado Pago (refund), Pub/Sub (delayed refund) |
| **`rescheduleBooking`** | Student reschedules **once for free**. Subsequent reschedules trigger a **10% fee**. | Transaction on calendar/booking | Mercado Pago API (fee collection) |
| **`markLessonCompleted`** | Instructor marks lesson completed. Triggers **Detran validation** and payment release (**85%** after 24h hold). | Triggers `validateLessonWithDetran` | Pub/Sub (24h payment queue), FCM (rating prompt) |

---

## 4. Payments

| Function | Purpose/Description | Method Support | Dependencies |
| :--- | :--- | :--- | :--- |
| **`processPayment`** | Processes payment via PIX, credit card, or boleto. Generates payment ID. Implements webhook listener. | PIX, CC, Boleto | Mercado Pago SDK, Firestore, Pub/Sub, Cloud KMS |
| **`handlePaymentWebhook`** | Listens to Mercado Pago webhooks for payment status updates. Triggers payment release flow on success. | Webhook Listener | Mercado Pago API, Firestore, Pub/Sub (retry queue) |
| **`releasePaymentToInstructor`** | Releases **85%** of payment to instructor's wallet after **24h hold**. Deducts **15% platform fee**. | Platform Fee: 15% | Firestore, FCM |
| **`requestWithdrawal`** | Instructor requests withdrawal ($\text{min R\$}100$). PIX is instant (R\$2 fee). TED is queued. | PIX (Instant), TED (1-2 days) | Firestore, Mercado Pago API (payout), Pub/Sub (TED batch queue) |
| **`processRefund`** | Processes refund for cancelled booking based on policy. | Refund via original method | Mercado Pago API, Firestore, Pub/Sub |

---

## 5. Tracking & GPS

| Function | Purpose/Description | Data Storage/Validation | Security |
| :--- | :--- | :--- | :--- |
| **`startTracking`** | Initiates GPS tracking. Validates booking and **LGPD consent**. | Firestore (`/trackingSessions`) | Pub/Sub (location update stream) |
| **`updateLocation`** | Stores coordinates every **30s**. Calculates distance. **Flags erratic driving patterns**. | Route subcollection | Google Maps API (route validation) |
| **`stopTracking`** | Ends session. Calculates metrics. **Anonymizes data after 7 days** (scheduled deletion). | Calculates Distance/Speed | Cloud Scheduler (anonymization), BigQuery |
| **`sendSOSAlert`** | Sends emergency SOS alert with location to contacts, instructor, and admin. | Creates high-priority incident | Twilio API (SMS), FCM (push to admin) |

---

## 6. Chat & Communication

| Function | Purpose/Description | Limitations | Moderation |
| :--- | :--- | :--- | :--- |
| **`sendChatMessage`** | Sends message in booking-specific chat. Supports text, audio ($\max 1\text{min}$), images ($\max 5\text{MB}$). | Media size limits | **Perspective API (profanity filter)** |
| **`reportMessage`** | Reports inappropriate content. Creates moderation ticket. **Auto-flags user after 3 reports**. | Report types | Cloud Tasks (auto-ban), Pub/Sub (admin notification) |

---

## 7. Detran Integration

| Function | Purpose/Description | Output/Return Example | Student Progress |
| :--- | :--- | :--- | :--- |
| **`validateLessonWithDetran`** | Validates completed lesson with **Detran state API**. Sends lesson data (CPF, date, duration, category, plate). | `{ protocolo, hash, status: "validada" }` | Updates theoretical/practical hours |
| **`checkExamEligibility`** | Checks if student meets minimum requirements ($\geq 20\text{h}$ theoretical + $\geq 20\text{h}$ practical). | `{ eligible: boolean, theoreticalHours, practicalHours }` | Queries student progress |

---

## 8. Admin & Moderation

| Function | Purpose/Description | Status Change | Notification/Cascade |
| :--- | :--- | :--- | :--- |
| **`getInstructorsPendingApproval`** | Returns paginated list of instructors with status "pendente". | Query `status == "pendente"` | Cloud Storage (signed URLs for documents) |
| **`approveInstructor`** | Admin approves registration. | Updates status to **"aprovado"** | SendGrid (approval email), FCM (push) |
| **`rejectInstructor`** | Admin rejects registration. | Updates status to **"rejeitado"** | SendGrid (rejection email template) |
| **`suspendUser`** | Admin suspends account. | Updates status to **"suspended"** | Cascades to `cancelBooking`, Firebase Auth (disable account) |
| **`getModerationReports`** | Returns paginated moderation queue. Sorted by **priority** (SOS > harassment > spam). | Filtering by status/type | BigQuery (analytics on trends) |

---

## 9. LGPD Compliance

| Function | Purpose/Description | Grace Period/Expiry | Mechanism |
| :--- | :--- | :--- | :--- |
| **`exportUserData`** | Exports all user data (JSON/CSV). Queues job (async). | Download link expires in **7 days** | Cloud Storage, Pub/Sub (async export queue) |
| **`deleteUserAccount`** | Initiates deletion (**right to be forgotten**). Anonymizes data. | **30-day grace period** for permanent deletion | Cloud Scheduler (30-day job), Firebase Auth (disable) |
| **`cancelAccountDeletion`** | Cancels pending deletion within 30-day grace period. | Within 30 days | Firebase Auth (enable account) |
| **`updateConsentPreferences`** | Updates user's LGPD consent preferences. | Logs all changes | Cloud Logging (audit trail) |

---

## 10. Notifications & Background Jobs (Cloud Scheduler/Pub/Sub)

| Function | Trigger Type | Frequency/Condition | Purpose/Action |
| :--- | :--- | :--- | :--- |
| **`sendPushNotification`** | Internal/Event | As required | Generic FCM wrapper, tracks delivery. |
| **`scheduleReminderNotifications`** | Hourly Schedule | Queries bookings in range | Sends reminders (**24h before** and **1h before** lesson). |
| **`anonymizeOldTrackingData`** | Daily Schedule | Data older than 7 days | **Anonymizes** GPS tracking data (LGPD). |
| **`generateMonthlyReports`** | Monthly Schedule | 1st of month | Generates fiscal reports (revenue, commissions). Exports to BigQuery. |

---

## 11. Utilities & Helpers

| Function | Purpose/Description | Key Technique | Dependencies |
| :--- | :--- | :--- | :--- |
| **`validateCPF`** | Validates Brazilian CPF using verification digits algorithm. | Pure Function | None |
| **`validateVehiclePlate`** | Validates Brazilian vehicle plate (old/Mercosul) and queries Denatran API. | External API call | Denatran API, Redis (cache 24h) |
| **`geocodeAddress`** | Converts address string to lat/lng coordinates. | Geocoding API | Google Maps Geocoding API, Redis (cache) |
| **`calculateDistance`** | Calculates distance between two GPS points. | **Haversine formula** | None |

---

## ⚙️ Deployment Configuration & Scalability

### Environment Variables Required

Key secrets and configurations must be set:

| Category | Example Variables |
| :--- | :--- |
| **Firebase** | `FIREBASE_PROJECT_ID`, `FIREBASE_STORAGE_BUCKET` |
| **APIs** | `MERCADO_PAGO_ACCESS_TOKEN`, `Maps_API_KEY`, `TWILIO_AUTH_TOKEN`, `SENDGRID_API_KEY` |
| **Detran** | `DETRAN_SP_API_URL`, `DETRAN_API_KEY_RJ` (State-specific) |
| **Redis** | `REDIS_HOST`, `REDIS_PASSWORD` |
| **Feature Flags** | `ENABLE_AUTO_INSTRUCTOR_APPROVAL` (false), `ENABLE_DETRAN_VALIDATION` (true) |

### Performance & Scalability Notes

* **Rate Limiting:** Implemented via **Cloud Armor** (e.g., Auth: 5 req/min/IP; Search: 30 req/min/user).
* **Caching Strategy:** **Redis** for instructor search results (5-minute TTL).
* **Database Indexes (Firestore):** Crucial Composite Indexes on `instructors (status, categories, rating)` and `bookings (studentId, date, status)`.
* **Monitoring:** Extensive use of **Cloud Logging**, **Firebase Crashlytics**, and **Cloud Monitoring** for KPIs and alerts (e.g., alert on P95 Latency $>500\text{ms}$).

### Summary Statistics

> *Total Functions: **45***
>
> *Estimated Cloud Functions Invocations (1M MAU): **~50M/month***
>
> *Estimated Firestore Reads/Writes: **~200M reads, ~50M writes/month***
