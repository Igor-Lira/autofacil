# Booking Creation & Confirmation Flow

```mermaid
sequenceDiagram
    participant Client as Mobile App
    participant CF1 as createBooking
    participant CF2 as processPayment
    participant CF3 as confirmBooking
    participant DB as Firestore
    participant Lock as Firestore Transaction
    participant MP as Mercado Pago API
    participant PubSub as Pub/Sub Queue
    participant FCM as Push Notifications
    participant Instructor as Instructor App

    Client->>CF1: POST /scheduling<br/>{instructorId, date: "2025-05-18T10:00",<br/>duration: 2, location, category: "B",<br/>focus: "manobras"}
    
    CF1->>Lock: BEGIN TRANSACTION
    
    Lock->>DB: Lock /instructors/{id}/calendar/{slot}
    
    Lock->>DB: Check existing bookings<br/>WHERE instructorId AND date<br/>AND status IN ["confirmada", "pendente"]
    
    alt Slot Available
        Lock->>DB: Create /bookings/{bookingId}<br/>{studentId, instructorId, date,<br/>status: "pendente"}
        
        Lock->>DB: Update calendar slot: reserved
        
        Lock->>Lock: COMMIT TRANSACTION
        
        CF1->>CF2: Process deposit (20%)
        
        CF2->>MP: Create PIX payment<br/>{amount: 28, expiresIn: 600}
        MP-->>CF2: {paymentId, qrCode, qrCodeUrl}
        
        CF2->>DB: Create /payments/{paymentId}<br/>{bookingId, amount: 140,<br/>deposit: 28, status: "pendente"}
        
        CF2-->>CF1: Payment initiated
        
        CF1->>PubSub: Schedule timeout job (2h)<br/>Topic: "booking-acceptance-timeout"
        
        CF1->>FCM: Notify instructor
        FCM-->>Instructor: "Nova aula solicitada!"
        
        CF1-->>Client: HTTP 201<br/>{bookingId, status: "pendente",<br/>paymentQRCode, expiresAt: +10min}
        
    else Slot Conflict
        Lock->>Lock: ROLLBACK TRANSACTION
        CF1-->>Client: HTTP 409<br/>{error: "Slot unavailable"}
    end
    
    Note over Client,MP: Student pays deposit via PIX
    
    MP->>CF2: Webhook: payment.approved
    CF2->>DB: Update payment status: "pago"
    CF2->>FCM: Notify student: "Pagamento confirmado"
    
    Note over Instructor,CF3: Instructor confirms within 2h
    
    Instructor->>CF3: PATCH /scheduling/{id}<br/>{status: "confirmada"}
    
    CF3->>DB: Get booking details
    
    alt Within 2h window
        CF3->>DB: Update status: "confirmada"<br/>confirmedAt: timestamp
        
        CF3->>PubSub: Cancel timeout job
        
        CF3->>MP: Update payment intent<br/>(charge remaining 80% post-lesson)
        
        CF3->>FCM: Notify student
        FCM-->>Client: "Aula confirmada com João!"
        
        CF3-->>Instructor: HTTP 200 {status: "confirmada"}
        
    else Timeout (>2h)
        CF3-->>Instructor: HTTP 403<br/>{error: "Acceptance window expired"}
        
        Note over PubSub: Timeout job executes
        PubSub->>CF1: Auto-cancel booking
        CF1->>MP: Refund deposit
        CF1->>FCM: Notify student: "Auto-cancelada"
    end
```

## Payment Flow Details

```mermaid
sequenceDiagram
    participant Student
    participant CF as processPayment
    participant MP as Mercado Pago
    participant DB as Firestore
    participant Webhook as handlePaymentWebhook

    Student->>CF: Initiate payment (20% deposit)
    
    CF->>MP: POST /payments<br/>{amount: 28, method: "pix"}
    
    alt PIX Payment
        MP-->>CF: {qrCode, qrCodeUrl, expiresIn: 600}
        CF->>DB: Create payment record
        CF-->>Student: Show QR Code (10min expiry)
        
        Student->>MP: Scan & pay with bank app
        MP->>Webhook: POST /webhooks/mercadopago<br/>{type: "payment", action: "updated"}
        
        Webhook->>MP: GET /payments/{id}
        MP-->>Webhook: {status: "approved"}
        
        Webhook->>DB: Update payment: "pago"
        Webhook->>DB: Update booking: paymentStatus "pago"
        Webhook-->>MP: HTTP 200 (acknowledge)
        
    else Credit Card
        MP-->>CF: {status: "approved", cardBrand: "visa"}
        CF->>DB: Update immediately
        CF-->>Student: Payment confirmed
    end
```

## Atomic Lock Implementation

```typescript
// Firestore Transaction to prevent double-booking
async function createBookingWithLock(data) {
  const db = admin.firestore();
  
  return db.runTransaction(async (transaction) => {
    const slotRef = db
      .collection('instructors')
      .doc(data.instructorId)
      .collection('calendar')
      .doc(data.date);
    
    const slotDoc = await transaction.get(slotRef);
    
    if (!slotDoc.exists || slotDoc.data().reserved) {
      throw new Error('Slot unavailable');
    }
    
    // Check concurrent bookings
    const existingBookings = await transaction.get(
      db.collection('bookings')
        .where('instructorId', '==', data.instructorId)
        .where('date', '==', data.date)
        .where('status', 'in', ['pendente', 'confirmada'])
    );
    
    if (!existingBookings.empty) {
      throw new Error('Time conflict');
    }
    
    // Atomic writes
    const bookingRef = db.collection('bookings').doc();
    transaction.set(bookingRef, {
      ...data,
      status: 'pendente',
      createdAt: FieldValue.serverTimestamp()
    });
    
    transaction.update(slotRef, { reserved: true });
    
    return bookingRef.id;
  });
}
```

## Timeout Handling (Pub/Sub)

```mermaid
sequenceDiagram
    participant CF1 as createBooking
    participant PubSub as Cloud Scheduler
    participant CF2 as handleBookingTimeout
    participant DB as Firestore
    participant MP as Mercado Pago
    participant FCM

    CF1->>PubSub: Schedule task (delay: 2h)<br/>{bookingId, expiresAt}
    
    Note over PubSub: Wait 2 hours
    
    PubSub->>CF2: Execute timeout job
    
    CF2->>DB: Get booking status
    
    alt Still "pendente"
        CF2->>DB: Update status: "cancelada"<br/>cancellationReason: "timeout"
        
        CF2->>MP: POST /refunds<br/>{paymentId, amount: 28}
        MP-->>CF2: {refundId, status: "processing"}
        
        CF2->>DB: Update calendar slot: available
        
        CF2->>FCM: Notify both parties
        FCM-->>Student: "Aula cancelada (não confirmada)"
        FCM-->>Instructor: "Oportunidade expirada"
        
    else Already "confirmada"
        CF2->>PubSub: Job no-op (already handled)
    end
```

## Reminder Notifications

```mermaid
sequenceDiagram
    participant Scheduler as Cloud Scheduler
    participant CF as scheduleReminderNotifications
    participant DB as Firestore
    participant FCM

    Note over Scheduler: Runs every hour
    
    Scheduler->>CF: Trigger cron job
    
    CF->>DB: Query /bookings<br/>WHERE date BETWEEN now+23h AND now+25h<br/>AND status = "confirmada"
    
    DB-->>CF: Bookings in 24h window
    
    loop For each booking
        CF->>FCM: Send push notification<br/>"Lembrete: aula amanhã às 10h"
    end
    
    CF->>DB: Query /bookings<br/>WHERE date BETWEEN now+59min AND now+61min
    
    loop For each booking
        CF->>FCM: Send push notification<br/>"Sua aula começa em 1 hora!"
    end
```

## Error Scenarios & Retries

| Error | Code | Retry Strategy | Fallback |
|-------|------|----------------|----------|
| Slot conflict | 409 | None (immediate feedback) | Show alternative slots |
| Payment timeout | 408 | Manual retry (new QR Code) | Try different payment method |
| Instructor no-show (2h) | Auto-cancel | Pub/Sub queue | Full refund + penalty to instructor |
| Firestore lock timeout | 503 | Exponential backoff (3 retries) | Queue for manual resolution |

