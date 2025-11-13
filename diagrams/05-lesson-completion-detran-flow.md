# Lesson Completion & Detran Validation Flow

```mermaid
sequenceDiagram
    participant Instructor as Instructor App
    participant CF1 as markLessonCompleted
    participant CF2 as validateLessonWithDetran
    participant CF3 as releasePaymentToInstructor
    participant DB as Firestore
    participant Detran as Detran State API
    participant PubSub as Pub/Sub Queue
    participant MP as Mercado Pago
    participant FCM as Push Notifications
    participant Student as Student App

    Instructor->>CF1: PATCH /scheduling/{bookingId}<br/>{status: "concluida",<br/>actualDuration: 2, notes: "Ótimo progresso"}
    
    CF1->>DB: Get booking details
    DB-->>CF1: {studentId, instructorId, category, date}
    
    CF1->>DB: Update status: "concluida"<br/>completedAt: timestamp
    
    CF1->>CF2: Trigger Detran validation (async)
    
    CF1->>PubSub: Schedule payment release (24h delay)
    
    CF1->>FCM: Prompt student for rating
    FCM-->>Student: "Avalie sua aula com João"
    
    CF1-->>Instructor: HTTP 200<br/>{status: "concluida",<br/>paymentReleaseAt: +24h}
    
    Note over CF2,Detran: Async Detran Validation
    
    CF2->>DB: Get student CPF & instructor CNH
    CF2->>DB: Get vehicle plate from instructor profile
    
    CF2->>Detran: POST /validar-aula<br/>{cpf_aluno, cpf_instrutor,<br/>data_aula, duracao_horas: 2,<br/>categoria: "B", tipo: "pratica",<br/>veiculo_placa}
    
    alt Detran Success (State: SP)
        Detran-->>CF2: HTTP 200<br/>{protocolo: "DETRAN-SP-2025-001234",<br/>hash: "8f4b...", status: "validada"}
        
        CF2->>DB: Update booking<br/>{detranProtocol, detranHash,<br/>detranValidated: true}
        
        CF2->>DB: Update student progress<br/>{practicalHours: +2}
        
        CF2->>CF2: Check exam eligibility<br/>(20h theoretical + 20h practical)
        
        alt Eligible for Exam
            CF2->>FCM: Notify student
            FCM-->>Student: "Parabéns! Você atingiu 20h práticas.<br/>Você está elegível para o exame!"
        end
        
    else Detran Timeout (>10s)
        Note over CF2,Detran: Timeout after 10 seconds
        
        CF2->>PubSub: Queue for manual validation<br/>Topic: "detran-fallback-queue"
        
        CF2->>DB: Update booking<br/>{detranValidated: false,<br/>requiresManualUpload: true}
        
        CF2->>FCM: Notify instructor
        FCM-->>Instructor: "Validação Detran pendente.<br/>Faça upload manual do protocolo."
        
    else Detran API Error
        Detran-->>CF2: HTTP 503 or 400<br/>{error: "Dados inválidos"}
        
        CF2->>PubSub: Retry with exponential backoff<br/>(max 3 retries)
        
        CF2->>DB: Log error for admin review
    end
    
    Note over PubSub,CF3: 24h later - Payment Release
    
    PubSub->>CF3: Execute scheduled task<br/>{bookingId, paymentId}
    
    CF3->>DB: Get payment details
    DB-->>CF3: {amount: 140, platformFee: 21,<br/>instructorAmount: 119}
    
    CF3->>DB: Update instructor wallet<br/>{available: +119}
    
    CF3->>DB: Create wallet transaction<br/>{type: "credit", amount: 119,<br/>description: "Aula com Maria"}
    
    CF3->>MP: Record platform fee revenue
    
    CF3->>FCM: Notify instructor
    FCM-->>Instructor: "Pagamento liberado: R$ 119,00"
    
    CF3->>DB: Update payment status: "concluido"
```

## State-Specific Detran Integration

```mermaid
graph TD
    A[validateLessonWithDetran] --> B{Determine State}
    B -->|SP| C[Detran-SP API]
    B -->|RJ| D[Detran-RJ API]
    B -->|MG| E[Detran-MG API]
    B -->|Others| F[Generic Detran API]
    
    C --> G{Response}
    D --> G
    E --> G
    F --> G
    
    G -->|200 OK| H[Update Student Progress]
    G -->|Timeout >10s| I[Fallback Queue]
    G -->|4xx/5xx| J[Retry Logic]
    
    H --> K[Check Exam Eligibility]
    I --> L[Manual Upload Required]
    J --> M{Retry Count}
    
    M -->|< 3| N[Exponential Backoff]
    M -->|>= 3| L
    
    N --> A
```

## Student Progress Calculation

```typescript
// Cloud Function: Update student progress after Detran validation
async function updateStudentProgress(
  studentId: string, 
  category: string, 
  duracao_horas: number, 
  tipo: 'teorica' | 'pratica'
) {
  const db = admin.firestore();
  const progressRef = db
    .collection('students')
    .doc(studentId)
    .collection('progress')
    .doc(category);
  
  await progressRef.set({
    [`${tipo}Hours`]: FieldValue.increment(duracao_horas),
    lastUpdated: FieldValue.serverTimestamp()
  }, { merge: true });
  
  // Check eligibility
  const progress = await progressRef.get();
  const data = progress.data();
  
  const eligible = 
    (data.teoricaHours >= 20) && 
    (data.praticaHours >= 20);
  
  if (eligible) {
    await progressRef.update({ examEligible: true });
    
    // Notify student
    await sendPushNotification(studentId, {
      title: 'Você está pronto!',
      body: 'Você completou as 20h teóricas e práticas. Agende seu exame!',
      data: { type: 'exam_eligible', category }
    });
  }
  
  return eligible;
}
```

## Payment Split & Commission

```mermaid
pie title Payment Distribution (R$ 140 lesson)
    "Instructor (85%)" : 119
    "Platform Fee (15%)" : 21
```

### Commission Breakdown
- **Base Rate**: 15% on all transactions
- **Pacote Discount**: 10% for packages ≥20h
- **First Lesson Promo**: 0% (platform absorbs cost)

### Payment Timeline
```
Lesson Completed (T=0)
    ↓
24h Hold Period (fraud/dispute window)
    ↓
Release to Instructor Wallet (T+24h)
    ↓
Instructor Requests Withdrawal
    ↓
PIX: Instant (R$2 fee) or TED: 1-2 business days
```

## Rating & Review Flow

```mermaid
sequenceDiagram
    participant Student
    participant CF as submitReview
    participant DB as Firestore
    participant Analytics as BigQuery
    participant Instructor

    Note over Student: 1h after lesson completion
    
    Student->>CF: POST /reviews<br/>{bookingId, rating: 5,<br/>tags: ["Pontual", "Paciente"],<br/>comment: "Excelente instrutor!"}
    
    CF->>DB: Get booking to verify completion
    
    CF->>DB: Create /reviews/{reviewId}<br/>{studentId, instructorId, rating, tags, comment}
    
    CF->>DB: Update instructor aggregate rating<br/>newRating = (oldRating * totalReviews + newRating) / (totalReviews + 1)
    
    CF->>DB: Increment totalReviews counter
    
    CF->>Analytics: Export review data for ML
    
    alt Rating < 3.0 (Poor)
        CF->>DB: Flag for admin review
        CF->>DB: Check instructor average
        
        alt Average < 3.0 after 5+ reviews
            CF->>DB: Auto-suspend instructor
            CF->>Instructor: Send notification + appeal process
        end
    end
    
    alt Rating >= 4.5 (Excellent)
        CF->>CF: Check for badge eligibility
        
        alt 10+ reviews with avg >= 4.8
            CF->>DB: Award "Top Rated" badge
            CF->>Instructor: "Parabéns! Badge desbloqueado"
        end
    end
    
    CF-->>Student: HTTP 201 {reviewId, message: "Obrigado!"}
```

## Manual Detran Validation (Fallback)

```mermaid
sequenceDiagram
    participant Instructor
    participant Upload as Cloud Storage
    participant CF as uploadDetranProtocol
    participant Admin as Admin Panel
    participant CF2 as approveManualValidation
    participant DB as Firestore
    participant Student

    Note over Instructor: When auto-validation fails
    
    Instructor->>Upload: Upload protocol PDF/image
    Upload-->>Instructor: Storage URL
    
    Instructor->>CF: POST /detran/manual-upload<br/>{bookingId, protocolUrl, protocolNumber}
    
    CF->>DB: Update booking<br/>{manualProtocolUrl, pendingAdminReview: true}
    
    CF->>Admin: Add to validation queue
    
    Admin->>CF2: POST /admin/detran/approve<br/>{bookingId, verified: true}
    
    CF2->>DB: Update booking<br/>{detranValidated: true, validatedBy: "admin"}
    
    CF2->>DB: Update student progress (same as auto)
    
    CF2->>Student: Notify progress update
```

## Error Handling & Retries

| Scenario | HTTP Code | Retry Strategy | User Impact |
|----------|-----------|----------------|-------------|
| Detran timeout (>10s) | 503 | Exponential backoff (3x) then manual queue | Instructor notified to upload manually |
| Invalid CPF format | 400 | No retry | Immediate error to instructor |
| Network failure | 503 | Retry with jitter | Transparent to user |
| Student progress conflict | 409 | Transaction retry (atomic) | None (resolved automatically) |
| Payment release failure | 500 | Dead letter queue | Admin intervention required |

