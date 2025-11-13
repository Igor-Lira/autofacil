# Instructor Registration & Approval Flow

```mermaid
sequenceDiagram
    participant Client as Mobile App
    participant Auth as Firebase Auth
    participant CF1 as createInstructorProfile
    participant CF2 as validateCNHWithDetran
    participant Vision as Google Vision API
    participant Detran as Detran State API
    participant Denatran as Denatran API
    participant Store as Cloud Storage
    participant DB as Firestore
    participant Admin as Admin Panel
    participant CF3 as approveInstructor
    participant Notify as FCM + SendGrid

    Client->>Auth: createUserWithEmailAndPassword(email, password)
    Auth-->>Client: Firebase UID + ID Token
    
    Client->>Store: Upload CNH, Certificate, Criminal Record
    Store-->>Client: Storage URLs
    
    Client->>CF1: POST /users/profile<br/>{userId, cpf, name, birthDate,<br/>cnh, detranCertificate, vehicle,<br/>experienceYears, categories}
    
    CF1->>CF1: Validate age >= 21
    CF1->>CF1: Validate experienceYears >= 2
    
    CF1->>Vision: OCR - Extract CNH data
    Vision-->>CF1: {cnhNumber, expiryDate, categories}
    
    CF1->>Denatran: validateVehiclePlate(plate)
    Denatran-->>CF1: {valid: true, model, year}
    
    CF1->>DB: Create /instructors/{userId}<br/>{status: "pendente", profile, vehicle}
    
    CF1->>CF2: Trigger async validation
    
    CF1-->>Client: HTTP 201<br/>{profileId, status: "pendente",<br/>message: "Pending approval"}
    
    Note over CF2,Detran: Async CNH Validation (10s timeout)
    
    CF2->>Detran: POST /validar-cnh<br/>{cnhNumber, cpf, state}
    
    alt Detran Success
        Detran-->>CF2: {valid: true, hasEAR: true,<br/>categories: ["B"], expiryDate}
        CF2->>DB: Update instructor<br/>{detranValidated: true, autoApprove: true}
        CF2->>CF3: Auto-approve if all valid
    else Detran Timeout/Failure
        Detran-->>CF2: Timeout (>10s) or 503
        CF2->>DB: Update {detranValidated: false,<br/>requiresManualReview: true}
        CF2->>Notify: Alert admin queue
    end
    
    Note over Admin,CF3: Manual Review (if needed)
    
    Admin->>CF3: POST /admin/instructors/{id}/approve<br/>{notes: "Documents verified"}
    
    CF3->>DB: Update /instructors/{id}<br/>{status: "aprovado", approvalDate}
    
    CF3->>Notify: Send approval email + push
    Notify-->>Client: "Parabéns! Seu perfil foi aprovado"
    
    CF3-->>Admin: HTTP 200 {status: "aprovado"}
```

## Auto-Approval Criteria
1. ✅ CNH valid with EAR
2. ✅ Age >= 21 years
3. ✅ Experience >= 2 years
4. ✅ Vehicle plate valid (Denatran)
5. ✅ All documents pass OCR validation

## Rejection Scenarios
```mermaid
sequenceDiagram
    participant Admin
    participant CF as rejectInstructor
    participant DB as Firestore
    participant Email as SendGrid
    participant Client

    Admin->>CF: POST /admin/instructors/{id}/reject<br/>{reason: "CNH expirada"}
    
    CF->>DB: Update status: "rejeitado"
    CF->>Email: Send detailed rejection email
    Email-->>Client: Email with resubmission instructions
    
    CF-->>Admin: HTTP 200 {status: "rejeitado"}
```

## State-Specific APIs
- **SP**: https://api.detran.sp.gov.br
- **RJ**: https://api.detran.rj.gov.br
- **MG**: https://api.detran.mg.gov.br
- Fallback: Manual upload queue

