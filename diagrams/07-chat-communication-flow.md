# Chat & Communication Flow

```mermaid
sequenceDiagram
    participant Student
    participant Instructor
    participant CF1 as sendChatMessage
    participant CF2 as reportMessage
    participant DB as Firestore
    participant Moderation as Perspective API
    participant Storage as Cloud Storage
    participant FCM as Push Notifications
    participant Admin as Admin Dashboard

    Note over Student,Instructor: After booking confirmed
    
    Student->>CF1: POST /chat/{bookingId}<br/>{content: "Podemos adiantar 30min?",<br/>type: "text"}
    
    CF1->>DB: Verify booking participants<br/>(student or instructor only)
    
    alt Text Message
        CF1->>Moderation: Analyze content for profanity
        
        Moderation-->>CF1: {score: 0.1, toxic: false}
        
        alt Clean Content
            CF1->>DB: Create /chats/{bookingId}/messages/{msgId}<br/>{senderId, content, type: "text",<br/>timestamp, status: "sent"}
            
            CF1->>FCM: Send push to recipient
            FCM-->>Instructor: "Nova mensagem de Maria"
            
            CF1-->>Student: HTTP 201<br/>{messageId, timestamp, status: "sent"}
            
        else Flagged Content (score > 0.7)
            CF1-->>Student: HTTP 400<br/>{error: "Message contains inappropriate content"}
        end
        
    else Audio Message
        Student->>Storage: Upload audio (max 1min, 5MB)
        Storage-->>Student: Storage URL
        
        Student->>CF1: POST /chat/{bookingId}<br/>{content: audioUrl, type: "audio"}
        
        CF1->>Storage: Validate file:<br/>- Duration <= 60s<br/>- Size <= 5MB<br/>- Format: mp3/m4a/ogg
        
        alt Valid Audio
            CF1->>DB: Create message with mediaUrl
            CF1->>FCM: Push with audio icon
            CF1-->>Student: HTTP 201
        else Invalid
            CF1-->>Student: HTTP 400<br/>{error: "Audio exceeds 1 minute"}
        end
        
    else Image Message
        Student->>Storage: Upload image (max 5MB)
        Storage-->>Student: {url, thumbnailUrl}
        
        CF1->>Moderation: Analyze image for inappropriate content
        
        alt Safe Image
            CF1->>DB: Create message {mediaUrl, thumbnailUrl}
            CF1-->>Student: HTTP 201
        else Unsafe
            CF1->>Storage: Delete uploaded image
            CF1-->>Student: HTTP 400<br/>{error: "Image flagged as inappropriate"}
        end
    end
    
    Note over Instructor: Reads message
    
    Instructor->>DB: Update message status: "read"<br/>readAt: timestamp
    
    DB-->>Student: WebSocket update (read receipt)
    
    Note over Instructor,CF2: Reports Harassment
    
    Instructor->>CF2: POST /chat/{bookingId}/report<br/>{messageId, reason: "harassment",<br/>details: "Linguagem inapropriada"}
    
    CF2->>DB: Create /reports/{reportId}<br/>{reportedBy, messageId, reason, status: "pending"}
    
    CF2->>DB: Increment user report counter
    
    CF2->>DB: Check total reports for sender
    
    alt >= 3 Reports
        CF2->>DB: Auto-flag user for review
        CF2->>Admin: High-priority moderation alert
        
        CF2->>DB: Update user status: "under_review"
        
        Note over Admin: Manual review
        
        alt Confirmed Violation
            Admin->>DB: Suspend user (7-30 days)
            Admin->>FCM: Notify user of suspension
        else False Report
            Admin->>DB: Dismiss report
            Admin->>DB: Penalize false reporter
        end
        
    else < 3 Reports
        CF2->>Admin: Add to moderation queue
    end
    
    CF2-->>Instructor: HTTP 200<br/>{reportId, status: "under_review"}
```

## Quick Reply Templates

```mermaid
graph LR
    A[User Opens Chat] --> B{Select Template}
    
    B -->|Student| C[Student Templates]
    B -->|Instructor| D[Instructor Templates]
    
    C --> E["Confirma aula amanhã?"]
    C --> F["Pode adiantar 30min?"]
    C --> G["Qual o ponto de encontro?"]
    
    D --> H["Confirmado!"]
    D --> I["Preciso remarcar"]
    D --> J["Envie foto do veículo"]
    
    E --> K[Send with 1 tap]
    F --> K
    G --> K
    H --> K
    I --> K
    J --> K
```

## Message Status Lifecycle

```mermaid
stateDiagram-v2
    [*] --> Sent: Message created
    Sent --> Delivered: Recipient online
    Sent --> Queued: Recipient offline
    Queued --> Delivered: Recipient comes online
    Delivered --> Read: Recipient opens chat
    Read --> [*]
    
    note right of Sent
        timestamp: creation time
        stored in Firestore
    end note
    
    note right of Delivered
        deliveredAt: timestamp
        FCM confirms delivery
    end note
    
    note right of Read
        readAt: timestamp
        UI interaction tracked
    end note
```

## Profanity Filter Integration

```typescript
// Using Google Perspective API
async function moderateMessage(content: string): Promise<boolean> {
  const perspectiveApi = require('@google-cloud/perspective');
  
  const analyzeRequest = {
    comment: { text: content },
    requestedAttributes: {
      TOXICITY: {},
      SEVERE_TOXICITY: {},
      INSULT: {},
      PROFANITY: {},
      THREAT: {}
    },
    languages: ['pt']
  };
  
  const response = await perspectiveApi.comments.analyze(analyzeRequest);
  
  const scores = {
    toxicity: response.attributeScores.TOXICITY.summaryScore.value,
    severeToxicity: response.attributeScores.SEVERE_TOXICITY.summaryScore.value,
    insult: response.attributeScores.INSULT.summaryScore.value,
    profanity: response.attributeScores.PROFANITY.summaryScore.value,
    threat: response.attributeScores.THREAT.summaryScore.value
  };
  
  // Block if any score exceeds threshold
  const threshold = 0.7;
  const isClean = Object.values(scores).every(score => score < threshold);
  
  if (!isClean) {
    // Log for review
    await logModerationEvent({
      content,
      scores,
      action: 'blocked'
    });
  }
  
  return isClean;
}
```

## Auto-Ban Logic

```mermaid
flowchart TD
    A[Report Received] --> B{Count User Reports}
    
    B -->|1st Report| C[Warning to User]
    B -->|2nd Report| D[24h Chat Restriction]
    B -->|3rd Report| E[Auto-Suspend Account]
    
    E --> F[Admin Review Queue]
    
    F --> G{Admin Decision}
    
    G -->|Confirmed Violation| H[7-30 Day Ban]
    G -->|False Positive| I[Restore Account]
    
    H --> J[Notify User via Email]
    H --> K[Cancel Active Bookings]
    
    I --> L[Penalize False Reporter]
    L --> M[Add to Reporter's Record]
```

## Firestore Chat Structure

```typescript
/chats/{bookingId}
  - participants: [studentId, instructorId]
  - createdAt: timestamp
  - lastMessage: string
  - lastMessageAt: timestamp
  
  /messages (subcollection)
    /{messageId}
      - senderId: string
      - senderName: string
      - content: string
      - type: "text" | "audio" | "image"
      - mediaUrl?: string
      - thumbnailUrl?: string
      - timestamp: timestamp
      - status: "sent" | "delivered" | "read"
      - deliveredAt?: timestamp
      - readAt?: timestamp
      - moderated: boolean
      - moderationScore?: number
```

## Real-Time Message Sync

```typescript
// Client-side listener (React Native)
useEffect(() => {
  const unsubscribe = firestore()
    .collection('chats')
    .doc(bookingId)
    .collection('messages')
    .orderBy('timestamp', 'desc')
    .limit(50)
    .onSnapshot((snapshot) => {
      const messages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setMessages(messages);
      
      // Mark as delivered
      snapshot.docChanges().forEach(change => {
        if (change.type === 'added' && 
            change.doc.data().senderId !== currentUserId) {
          markAsDelivered(change.doc.id);
        }
      });
    });
  
  return () => unsubscribe();
}, [bookingId]);

// Mark as read when chat screen is focused
useEffect(() => {
  const focusListener = navigation.addListener('focus', () => {
    markAllMessagesAsRead(bookingId);
  });
  
  return focusListener;
}, [navigation]);
```

## Media Upload Validation

```typescript
async function validateMediaUpload(
  file: File, 
  type: 'audio' | 'image'
): Promise<ValidationResult> {
  
  const limits = {
    audio: { maxSize: 5 * 1024 * 1024, maxDuration: 60, formats: ['mp3', 'm4a', 'ogg'] },
    image: { maxSize: 5 * 1024 * 1024, formats: ['jpg', 'jpeg', 'png', 'webp'] }
  };
  
  const limit = limits[type];
  
  // Size check
  if (file.size > limit.maxSize) {
    return { valid: false, error: `File exceeds ${limit.maxSize / 1024 / 1024}MB` };
  }
  
  // Format check
  const extension = file.name.split('.').pop()?.toLowerCase();
  if (!limit.formats.includes(extension)) {
    return { valid: false, error: `Invalid format. Allowed: ${limit.formats.join(', ')}` };
  }
  
  // Audio duration check
  if (type === 'audio') {
    const duration = await getAudioDuration(file);
    if (duration > limit.maxDuration) {
      return { valid: false, error: `Audio exceeds ${limit.maxDuration}s` };
    }
  }
  
  return { valid: true };
}
```

## Performance Optimizations

### 1. Message Pagination
```typescript
// Load messages in batches of 50
async function loadMoreMessages(bookingId: string, lastVisible: DocumentSnapshot) {
  return firestore()
    .collection('chats')
    .doc(bookingId)
    .collection('messages')
    .orderBy('timestamp', 'desc')
    .startAfter(lastVisible)
    .limit(50)
    .get();
}
```

### 2. Image Optimization
```typescript
// Generate thumbnail on upload
const thumbnail = await sharp(imageBuffer)
  .resize(200, 200, { fit: 'cover' })
  .jpeg({ quality: 70 })
  .toBuffer();

await bucket.file(`thumbnails/${messageId}.jpg`).save(thumbnail);
```

### 3. FCM Batching
```typescript
// Batch notifications for efficiency
const messages = pendingNotifications.map(notification => ({
  token: notification.fcmToken,
  notification: {
    title: notification.title,
    body: notification.body
  },
  data: {
    bookingId: notification.bookingId,
    type: 'new_message'
  }
}));

await admin.messaging().sendAll(messages);
```

## Moderation Dashboard

| Metric | Threshold | Action |
|--------|-----------|--------|
| Toxic messages blocked | N/A | Log to analytics |
| User reports (1st) | 1 | In-app warning |
| User reports (2nd) | 2 | 24h chat restriction |
| User reports (3rd) | 3 | Auto-suspend + admin review |
| False reports | 3 | Penalize reporter (reduce trust score) |
| Average response time | < 5min | Display "Usually responds quickly" badge |

