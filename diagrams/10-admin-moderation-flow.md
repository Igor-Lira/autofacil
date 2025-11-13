# Admin Panel & Moderation Flow

```mermaid
sequenceDiagram
    participant Admin as Admin Dashboard
    participant CF1 as getInstructorsPendingApproval
    participant CF2 as approveInstructor
    participant CF3 as rejectInstructor
    participant CF4 as getModerationReports
    participant CF5 as suspendUser
    participant DB as Firestore
    participant Storage as Cloud Storage
    participant Email as SendGrid
    participant FCM as Push Notifications
    participant Instructor
    participant Student

    Note over Admin,CF1: Instructor Approval Queue
    
    Admin->>CF1: GET /admin/instructors/pending?<br/>page=1&limit=20
    
    CF1->>DB: Query /instructors<br/>WHERE status = "pendente"<br/>ORDER BY createdAt ASC
    
    DB-->>CF1: Pending instructors (oldest first)
    
    CF1->>Storage: Generate signed URLs for documents<br/>(CNH, certificate, criminal record)
    
    CF1-->>Admin: HTTP 200<br/>{data: [InstructorProfile],<br/>total: 45, page: 1, hasMore: true}
    
    Note over Admin: Reviews documents
    
    alt Approve Instructor
        Admin->>CF2: POST /admin/instructors/{id}/approve<br/>{notes: "Documentação OK"}
        
        CF2->>DB: Update /instructors/{id}<br/>{status: "aprovado",<br/>approvalDate: timestamp,<br/>approvedBy: adminId}
        
        CF2->>DB: Create approval audit log
        
        CF2->>Email: Send approval email with onboarding
        Email-->>Instructor: "Parabéns! Perfil aprovado"
        
        CF2->>FCM: Push notification
        FCM-->>Instructor: "Você já pode receber aulas!"
        
        CF2-->>Admin: HTTP 200<br/>{status: "aprovado", approvalDate}
        
    else Reject Instructor
        Admin->>CF3: POST /admin/instructors/{id}/reject<br/>{reason: "CNH vencida. Renove e cadastre novamente."}
        
        CF3->>DB: Update /instructors/{id}<br/>{status: "rejeitado",<br/>rejectionReason,<br/>rejectedBy: adminId,<br/>canReapplyAfter: +30 days}
        
        CF3->>DB: Create rejection audit log
        
        CF3->>Email: Send detailed rejection email
        Email-->>Instructor: Reason + resubmission instructions
        
        CF3-->>Admin: HTTP 200<br/>{status: "rejeitado"}
    end
    
    Note over Admin,CF4: Moderation Queue
    
    Admin->>CF4: GET /admin/reports?<br/>status=pending&type=harassment&page=1
    
    CF4->>DB: Query /reports<br/>WHERE status = "pending"<br/>ORDER BY priority DESC, createdAt ASC
    
    DB-->>CF4: Prioritized reports:<br/>1. SOS alerts (high)<br/>2. Harassment (medium)<br/>3. Spam (low)
    
    CF4->>DB: Get related entities (users, messages, bookings)
    
    CF4-->>Admin: HTTP 200<br/>{data: [Report], total: 12, hasMore: false}
    
    Note over Admin: Reviews report details
    
    alt Suspend User (Violation Confirmed)
        Admin->>CF5: POST /admin/users/{userId}/suspend<br/>{reason: "Linguagem ofensiva repetida",<br/>duration: 7}
        
        CF5->>DB: Get user's active bookings
        
        loop Cancel all active bookings
            CF5->>DB: Update booking status: "cancelada"
            CF5->>DB: Trigger refund process
        end
        
        CF5->>DB: Update /users/{userId}<br/>{status: "suspenso",<br/>suspendedUntil: +7 days,<br/>suspensionReason}
        
        CF5->>DB: Revoke active sessions
        
        CF5->>Email: Send suspension notice
        Email-->>Student: "Sua conta foi suspensa até DD/MM/AAAA"
        
        CF5->>FCM: Force logout notification
        
        CF5->>DB: Update report status: "resolved"
        
        CF5-->>Admin: HTTP 200<br/>{status: "suspended", expiresAt}
        
    else Dismiss Report (False Positive)
        Admin->>DB: Update report status: "dismissed"
        Admin->>DB: Increment false reporter counter
        
        alt False Reporter >= 3
            Admin->>DB: Flag reporter for review
            Admin->>Email: Warning to false reporter
        end
    end
```

## Admin Dashboard Metrics

```mermaid
graph TD
    A[Admin Dashboard] --> B[KPIs Widget]
    A --> C[Charts Widget]
    A --> D[Moderation Queue]
    A --> E[User Management]
    A --> F[Financial Reports]
    
    B --> B1[MAU: 1.2M]
    B --> B2[Monthly Revenue: R$ 450K]
    B --> B3[Avg Commission: R$ 21]
    B --> B4[Conversion Rate: 12%]
    
    C --> C1[Lessons per Day Graph]
    C --> C2[Categories Distribution Pie]
    C --> C3[State Heat Map]
    
    D --> D1[45 Pending Instructors]
    D --> D2[12 Reports to Review]
    D --> D3[3 SOS Alerts Active]
    
    E --> E1[Search Users by CPF]
    E --> E2[View Transaction History]
    E --> E3[Suspend/Ban Actions]
    
    F --> F1[Monthly Revenue Export]
    F --> F2[Tax Reports CSV]
    F --> F3[Instructor Payouts Summary]
```

## Priority Queue Algorithm

```typescript
interface Report {
  id: string;
  type: 'chat' | 'profile' | 'behavior' | 'sos';
  severity: 'high' | 'medium' | 'low';
  createdAt: Date;
  status: 'pending' | 'reviewed' | 'resolved';
}

function prioritizeReports(reports: Report[]): Report[] {
  const priorityMap = {
    sos: 1000,
    harassment: 500,
    fraud: 400,
    spam: 100
  };
  
  const severityMultiplier = {
    high: 3,
    medium: 2,
    low: 1
  };
  
  return reports.sort((a, b) => {
    const scoreA = 
      (priorityMap[a.type] || 0) * 
      severityMultiplier[a.severity] -
      (Date.now() - a.createdAt.getTime()) / 1000;
    
    const scoreB = 
      (priorityMap[b.type] || 0) * 
      severityMultiplier[b.severity] -
      (Date.now() - b.createdAt.getTime()) / 1000;
    
    return scoreB - scoreA; // Higher score = higher priority
  });
}
```

## Performance Metrics

| Metric | Target | Current | Alert Threshold |
|--------|--------|---------|-----------------|
| Instructor Approval Time | < 24h | 18h avg | > 48h |
| Report Resolution Time | < 2h (high priority) | 1.5h avg | > 4h |
| SOS Response Time | < 5min | 3min avg | > 10min |
| False Report Rate | < 5% | 3.2% | > 10% |
| Admin Active Users | 5-10 | 7 | < 3 |
| Dashboard Load Time | < 2s | 1.8s | > 3s |

