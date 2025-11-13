# Payment Processing & Wallet Management Flow

```mermaid
sequenceDiagram
    participant Student
    participant CF1 as processPayment
    participant CF2 as handlePaymentWebhook
    participant CF3 as releasePaymentToInstructor
    participant CF4 as requestWithdrawal
    participant MP as Mercado Pago API
    participant DB as Firestore
    participant PubSub as Pub/Sub Queue
    participant Instructor
    participant Bank as Banking System

    Note over Student,CF1: Initial Payment (20% deposit)
    
    Student->>CF1: POST /payments<br/>{bookingId, method: "pix", amount: 28}
    
    CF1->>DB: Get booking details
    DB-->>CF1: {studentId, instructorId, totalAmount: 140}
    
    CF1->>MP: POST /v1/payments<br/>{transaction_amount: 28,<br/>payment_method_id: "pix"}
    
    MP-->>CF1: {id: "pay_123", qr_code, qr_code_base64,<br/>expires_at: +10min}
    
    CF1->>DB: Create /payments/{paymentId}<br/>{bookingId, amount: 140,<br/>deposit: 28, remaining: 112,<br/>status: "pendente"}
    
    CF1-->>Student: HTTP 201<br/>{paymentId, qrCode, qrCodeUrl,<br/>expiresAt}
    
    Note over Student,MP: Student scans & pays via bank app
    
    MP->>CF2: Webhook POST /webhooks/mercadopago<br/>{type: "payment", action: "payment.updated",<br/>data: {id: "pay_123"}}
    
    CF2->>MP: GET /v1/payments/pay_123<br/>(verify webhook authenticity)
    
    MP-->>CF2: {status: "approved", amount: 28}
    
    CF2->>DB: Update payment status: "pago_parcial"
    CF2->>DB: Update booking paymentStatus: "pago"
    
    CF2->>Student: Push notification: "Pagamento confirmado!"
    CF2->>Instructor: Push: "Depósito recebido - confirme a aula"
    
    CF2-->>MP: HTTP 200 (acknowledge webhook)
    
    Note over Instructor,Student: Lesson completed
    
    Note over CF1: Charge remaining 80%
    
    CF1->>MP: POST /v1/payments<br/>{amount: 112, payer_id: studentId}
    
    MP-->>CF1: {status: "approved"}
    
    CF1->>DB: Update payment<br/>{totalPaid: 140, status: "pago"}
    
    CF1->>PubSub: Schedule payment release (24h hold)
    
    Note over PubSub,CF3: 24h later - Release to instructor
    
    PubSub->>CF3: Trigger scheduled task
    
    CF3->>DB: Get payment details
    DB-->>CF3: {amount: 140, platformFee: 21 (15%),<br/>instructorAmount: 119 (85%)}
    
    CF3->>DB: Transaction BEGIN
    
    CF3->>DB: Update /instructors/{id}/wallet<br/>{available: +119, total: +119}
    
    CF3->>DB: Create /walletTransactions/{txId}<br/>{type: "credit", amount: 119,<br/>description: "Aula - Maria Santos"}
    
    CF3->>DB: Update payment<br/>{status: "concluido", releasedAt: timestamp}
    
    CF3->>DB: Transaction COMMIT
    
    CF3->>Instructor: Push: "R$ 119 disponível na carteira"
    
    Note over Instructor,CF4: Instructor withdraws funds
    
    Instructor->>CF4: POST /wallet<br/>{amount: 500, method: "pix",<br/>pixKey: "+5511999999999"}
    
    CF4->>DB: Get wallet balance
    
    alt Sufficient Balance (available >= 500)
        CF4->>DB: Update wallet<br/>{available: -500, blocked: +500}
        
        CF4->>MP: POST /v1/payouts<br/>{amount: 498, destination: pixKey,<br/>fee: 2}
        
        alt PIX Success (Instant)
            MP-->>CF4: {status: "approved", transfer_id}
            
            CF4->>DB: Update wallet<br/>{blocked: -500}
            
            CF4->>DB: Create withdrawal record<br/>{status: "concluido", processedAt}
            
            CF4->>Instructor: Push: "Saque processado: R$ 498"
            
            CF4-->>Instructor: HTTP 200<br/>{withdrawalId, status: "concluido",<br/>netAmount: 498, fee: 2}
            
        else PIX Failure
            MP-->>CF4: {status: "rejected", error: "Invalid key"}
            
            CF4->>DB: Rollback: {available: +500, blocked: -500}
            
            CF4-->>Instructor: HTTP 400<br/>{error: "Chave PIX inválida"}
        end
        
    else Insufficient Balance
        CF4-->>Instructor: HTTP 400<br/>{error: "Saldo insuficiente",<br/>available: 320, requested: 500}
    end
```

## Refund Processing

```mermaid
sequenceDiagram
    participant Student
    participant CF as processRefund
    participant DB as Firestore
    participant MP as Mercado Pago
    participant Instructor

    Student->>CF: POST /payments/refund<br/>{bookingId, reason: "Cancelamento >24h"}
    
    CF->>DB: Get booking & payment
    DB-->>CF: {status: "cancelada",<br/>cancelledAt, payment: {amount: 140}}
    
    CF->>CF: Calculate refund policy:<br/>- Student <24h: 100% refund<br/>- Student >24h: 50% refund<br/>- Instructor <12h: 0% refund (penalty)
    
    alt Student Cancellation >24h
        CF->>CF: refundAmount = 70 (50%)<br/>penalty = 70 (to instructor as compensation)
        
        CF->>MP: POST /v1/refunds<br/>{payment_id, amount: 70}
        
        MP-->>CF: {status: "approved", refund_id}
        
        CF->>DB: Create refund record<br/>{amount: 70, status: "aprovado"}
        
        CF->>DB: Credit instructor wallet: +70
        
        CF->>Student: Push: "Reembolso de R$ 70 processado"
        CF->>Instructor: Push: "Compensação de R$ 70 por cancelamento"
        
        CF-->>Student: HTTP 200<br/>{refundId, amount: 70,<br/>processingTime: "2-5 dias úteis"}
        
    else Student Cancellation <24h (Free)
        CF->>MP: POST /v1/refunds<br/>{payment_id, amount: 140}
        
        CF->>DB: Update refund: "aprovado"
        
        CF-->>Student: HTTP 200<br/>{refundId, amount: 140}
        
    else Instructor Cancellation <12h (Penalty)
        CF->>MP: Refund to student: 140
        
        CF->>DB: Deduct from instructor wallet: -140<br/>(or block future earnings)
        
        CF->>DB: Create penalty record
        
        CF-->>Student: HTTP 200 {refundId, amount: 140}
    end
```

## Commission Calculation

```typescript
interface PaymentSplit {
  total: number;
  platformFee: number;
  instructorAmount: number;
  feePercentage: number;
}

function calculatePaymentSplit(
  lessonAmount: number,
  packageHours?: number
): PaymentSplit {
  let feePercentage = 0.15; // 15% default
  
  // Discounts
  if (packageHours >= 20) {
    feePercentage = 0.10; // 10% for packages ≥20h
  }
  
  const platformFee = Math.round(lessonAmount * feePercentage * 100) / 100;
  const instructorAmount = lessonAmount - platformFee;
  
  return {
    total: lessonAmount,
    platformFee,
    instructorAmount,
    feePercentage
  };
}

// Example: R$ 140 lesson
// Result: { total: 140, platformFee: 21, instructorAmount: 119, feePercentage: 0.15 }
```

## Wallet Transaction History

```mermaid
graph TD
    A[Wallet] --> B[Available Balance]
    A --> C[Blocked Balance]
    A --> D[Total Balance]
    
    B --> E[Lesson Earnings]
    B --> F[Refund Credits]
    B --> G[Bonuses]
    
    C --> H[Pending Lessons 24h hold]
    C --> I[Withdrawal Processing]
    C --> J[Dispute Hold]
    
    E --> K[Transaction History]
    F --> K
    G --> K
    H --> K
    I --> K
    J --> K
    
    K --> L[Export PDF/CSV]
```

## Firestore Wallet Structure

```typescript
/instructors/{instructorId}/wallet
  - available: number        // Can withdraw
  - blocked: number          // Pending/processing
  - total: number            // Sum of both
  - lastUpdated: timestamp
  
/walletTransactions (collection)
  /{transactionId}
    - userId: string
    - type: "credit" | "debit" | "withdrawal"
    - amount: number
    - description: string
    - relatedBookingId?: string
    - relatedPaymentId?: string
    - status: "pendente" | "concluido" | "cancelado"
    - createdAt: timestamp
    - processedAt?: timestamp
```

## Payment Security

### 1. Webhook Validation
```typescript
async function validateMercadoPagoWebhook(
  signature: string,
  payload: any
): Promise<boolean> {
  const secret = process.env.MERCADO_PAGO_WEBHOOK_SECRET;
  const hmac = crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(payload))
    .digest('hex');
  
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(hmac)
  );
}
```

### 2. Card Data Encryption (PCI DSS)
```typescript
// Never store raw card data - use MP tokenization
async function processCardPayment(cardData: {
  cardNumber: string,
  cvv: string,
  expiryDate: string
}) {
  // Client-side tokenization via Mercado Pago SDK
  const token = await MercadoPago.createCardToken(cardData);
  
  // Send only token to backend
  return fetch('/api/payments', {
    method: 'POST',
    body: JSON.stringify({
      cardToken: token,
      amount: 140
    })
  });
}
```

### 3. Fraud Detection
```typescript
async function detectFraudulentPayment(
  paymentData: PaymentRequest
): Promise<{ fraudScore: number, block: boolean }> {
  const indicators = {
    multipleFailedAttempts: await checkFailedAttempts(paymentData.userId),
    unusualAmount: paymentData.amount > 1000,
    newUserHighValue: await isNewUser(paymentData.userId) && paymentData.amount > 500,
    velocityCheck: await checkPaymentVelocity(paymentData.userId)
  };
  
  let fraudScore = 0;
  if (indicators.multipleFailedAttempts > 3) fraudScore += 30;
  if (indicators.unusualAmount) fraudScore += 20;
  if (indicators.newUserHighValue) fraudScore += 25;
  if (indicators.velocityCheck > 5) fraudScore += 25;
  
  return {
    fraudScore,
    block: fraudScore >= 70
  };
}
```

## Withdrawal Methods Comparison

| Method | Processing Time | Fee | Min Amount | Max Amount |
|--------|----------------|-----|------------|------------|
| PIX | Instant | R$ 2.00 | R$ 100 | R$ 5,000 |
| TED | 1-2 business days | R$ 0.00 | R$ 100 | R$ 10,000 |
| DOC | 2-3 business days | R$ 0.00 | R$ 100 | R$ 4,999 |

## Monthly Fiscal Reports

```mermaid
sequenceDiagram
    participant Scheduler as Cloud Scheduler
    participant CF as generateMonthlyReports
    participant DB as Firestore
    participant BigQuery
    participant Storage as Cloud Storage
    participant Email as SendGrid
    participant Finance

    Note over Scheduler: 1st of every month at 2am
    
    Scheduler->>CF: Trigger cron job
    
    CF->>DB: Query all payments/withdrawals<br/>WHERE createdAt >= lastMonth
    
    CF->>CF: Aggregate data:<br/>- Total revenue<br/>- Total commissions<br/>- Total payouts<br/>- Active users
    
    CF->>BigQuery: Export detailed transactions
    
    CF->>Storage: Generate CSV/PDF report
    
    CF->>Email: Send to finance team<br/>Subject: "Relatório Fiscal - May 2025"
    
    Email-->>Finance: Email with attachment
    
    CF->>DB: Store report metadata<br/>{period, totalRevenue, generated: timestamp}
```

## Error Handling

| Error | Code | Retry | Fallback |
|-------|------|-------|----------|
| Payment timeout | 408 | User retries | Generate new QR Code |
| Insufficient funds | 400 | None | Display balance |
| Invalid PIX key | 400 | None | Validate before submit |
| Webhook replay attack | 403 | None | Idempotency check |
| Withdrawal limit exceeded | 400 | None | Show daily limit |
| Mercado Pago API down | 503 | 3 retries with backoff | Queue for later |

