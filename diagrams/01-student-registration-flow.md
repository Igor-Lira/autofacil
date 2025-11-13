# Student Registration Flow

```mermaid
sequenceDiagram
    participant Client as Mobile App
    participant Auth as Firebase Auth
    participant CF1 as createStudentProfile
    participant Vision as Google Vision API
    participant CPF as CPF Validator
    participant Store as Cloud Storage
    participant DB as Firestore
    participant Email as SendGrid

    Client->>Auth: createUserWithEmailAndPassword(email, password)
    Auth-->>Client: Firebase UID + ID Token
    
    Client->>Store: Upload documents (RG, CNH, Proof of Address)
    Store-->>Client: Storage URLs
    
    Client->>CF1: POST /users/profile<br/>{userId, cpf, name, birthDate,<br/>phone, documents, acceptLGPD}
    
    CF1->>CPF: validateCPF(cpf)
    CPF-->>CF1: {valid: true, formatted}
    
    CF1->>CF1: validateAge(birthDate >= 18)
    
    CF1->>Vision: OCR - Extract RG data
    Vision-->>CF1: {documentNumber, issueDate}
    
    CF1->>DB: Create /users/{userId}<br/>{type: "student", status: "active"}
    
    CF1->>DB: Create /students/{userId}<br/>{profile, documents, preferences}
    
    CF1->>Email: sendEmailVerification(userId, email)
    Email-->>Client: Verification email sent
    
    CF1-->>Client: HTTP 201<br/>{profileId, status: "active",<br/>message: "Profile created"}
    
    Note over Client,Email: User clicks verification link
    
    Client->>Auth: verifyEmail(token)
    Auth->>DB: Update emailVerified: true
    Auth-->>Client: Email verified
```

## Key Validations
1. **CPF**: Format validation + verification digits
2. **Age**: birthDate ≥ 18 years
3. **Documents**: OCR validation via Google Vision API
4. **LGPD**: Explicit consent required (acceptLGPD: true)

## Error Scenarios
- **400**: Invalid CPF, underage, missing documents
- **409**: CPF already registered
- **500**: OCR service failure, Firestore timeout

