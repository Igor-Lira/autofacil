# GPS Tracking & SOS Emergency Flow

```mermaid
sequenceDiagram
    participant Instructor as Instructor App
    participant Student as Student App
    participant CF1 as startTracking
    participant CF2 as updateLocation
    participant CF3 as sendSOSAlert
    participant CF4 as stopTracking
    participant DB as Firestore
    participant Maps as Google Maps API
    participant PubSub as Pub/Sub Stream
    participant Analytics as BigQuery
    participant Emergency as Emergency Contacts

    Note over Student,Instructor: Lesson starts
    
    Instructor->>CF1: POST /tracking/start<br/>{bookingId}
    
    CF1->>DB: Get booking & verify status = "confirmada"
    
    CF1->>DB: Check LGPD consent<br/>(locationTracking: true)
    
    alt Consent Given
        CF1->>DB: Create /trackingSessions/{trackingId}<br/>{bookingId, startedAt, consentVerified: true}
        
        CF1->>PubSub: Create location stream topic
        
        CF1-->>Instructor: HTTP 200<br/>{trackingId, startedAt, websocketUrl}
        
        CF1-->>Student: Real-time tracking URL
        
        loop Every 30 seconds during lesson
            Instructor->>CF2: POST /tracking/{trackingId}/location<br/>{lat, lng, speed, accuracy, timestamp}
            
            CF2->>DB: Append to /trackingSessions/{id}/route<br/>subcollection
            
            CF2->>CF2: Calculate distance increment<br/>(Haversine formula)
            
            CF2->>CF2: Detect erratic driving<br/>(speed change > 40km/h in 30s)
            
            alt Erratic Driving Detected
                CF2->>DB: Flag incident in session
                CF2->>Analytics: Log for review
            end
            
            CF2->>PubSub: Publish location update
            PubSub-->>Student: WebSocket push (real-time map)
            
            CF2-->>Instructor: HTTP 200 (acknowledge)
        end
        
    else No Consent
        CF1-->>Instructor: HTTP 403<br/>{error: "LGPD consent required",<br/>message: "Student must enable tracking"}
    end
    
    Note over Student,CF3: EMERGENCY SCENARIO
    
    alt SOS Triggered
        Student->>CF3: POST /tracking/sos<br/>{trackingId, location: {lat, lng},<br/>message: "Acidente"}
        
        CF3->>DB: Create /sosAlerts/{alertId}<br/>{userId, location, timestamp, priority: "high"}
        
        CF3->>DB: Get student emergency contacts
        
        par Notify All Emergency Services
            CF3->>Emergency: SMS to emergency contacts<br/>"ALERTA: Maria precisa de ajuda<br/>Localização: [Google Maps Link]"
        and
            CF3->>Instructor: Push notification + SMS
        and
            CF3->>DB: Alert admin dashboard (high priority)
        and
            CF3->>Maps: Reverse geocode location
            Maps-->>CF3: {address, landmarks}
        end
        
        CF3->>DB: Add to admin incident queue
        
        CF3-->>Student: HTTP 200<br/>{alertId, notifiedContacts: ["+55...", "João"],<br/>message: "Socorro enviado"}
        
        Note over CF3: Admin receives real-time alert
    end
    
    Note over Instructor,CF4: Lesson ends
    
    Instructor->>CF4: POST /tracking/{trackingId}/stop
    
    CF4->>DB: Get full route data
    
    CF4->>CF4: Calculate metrics:<br/>- Total distance (sum of increments)<br/>- Duration (endTime - startTime)<br/>- Average speed<br/>- Max speed
    
    CF4->>DB: Update session<br/>{endedAt, duration, distance,<br/>avgSpeed, status: "completed"}
    
    CF4->>PubSub: Close location stream
    
    CF4->>Analytics: Export aggregated data<br/>(route deleted, metrics kept)
    
    CF4->>PubSub: Schedule anonymization job (7 days)
    
    CF4-->>Instructor: HTTP 200<br/>{duration: 7200s, distance: 25.3km,<br/>avgSpeed: 45km/h}
```

## Real-Time Location Streaming

```mermaid
graph LR
    A[Instructor App] -->|GPS Update every 30s| B[Cloud Function]
    B -->|Publish| C[Pub/Sub Topic]
    C -->|Subscribe| D[Student WebSocket]
    D -->|Render| E[Google Maps View]
    
    B -->|Store| F[Firestore Route Subcollection]
    F -->|Archive after 7 days| G[BigQuery Analytics]
    
    B -->|Anomaly Detection| H{Speed Change > 40km/h?}
    H -->|Yes| I[Flag Incident]
    H -->|No| J[Continue Normal]
```

## LGPD Compliance - Data Anonymization

```typescript
// Cloud Scheduler job: runs daily
async function anonymizeOldTrackingData() {
  const db = admin.firestore();
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - 7);
  
  const sessionsToAnonymize = await db
    .collection('trackingSessions')
    .where('endedAt', '<', cutoffDate)
    .where('anonymized', '==', false)
    .get();
  
  const batch = db.batch();
  
  for (const doc of sessionsToAnonymize.docs) {
    const sessionRef = doc.ref;
    
    // Delete detailed route points
    const routeSnapshot = await sessionRef
      .collection('route')
      .get();
    
    routeSnapshot.forEach(routeDoc => {
      batch.delete(routeDoc.ref);
    });
    
    // Keep only aggregated metrics
    batch.update(sessionRef, {
      anonymized: true,
      routeDeleted: true,
      anonymizedAt: FieldValue.serverTimestamp()
      // distance, duration, avgSpeed remain
    });
  }
  
  await batch.commit();
  
  console.log(`Anonymized ${sessionsToAnonymize.size} tracking sessions`);
}
```

## SOS Alert Priority Levels

```mermaid
graph TD
    A[SOS Alert Received] --> B{Classify Priority}
    
    B -->|High: Accident/Medical| C[Immediate Response]
    B -->|Medium: Harassment| D[1min Response]
    B -->|Low: Vehicle Issue| E[5min Response]
    
    C --> F[SMS to all emergency contacts]
    C --> G[Push to admin with sound alarm]
    C --> H[SMS to instructor]
    C --> I[Create incident ticket]
    
    D --> G
    D --> H
    D --> I
    
    E --> I
    E --> J[In-app notification only]
    
    I --> K[Admin Dashboard Queue]
```

## WebSocket Real-Time Updates

```typescript
// Client-side (Student App)
const trackingSocket = new WebSocket(
  `wss://api.autofacil.com/tracking/${trackingId}/stream`
);

trackingSocket.onmessage = (event) => {
  const location = JSON.parse(event.data);
  
  // Update map marker
  updateInstructorMarker({
    lat: location.lat,
    lng: location.lng,
    speed: location.speed,
    timestamp: location.timestamp
  });
  
  // Draw route trail (last 10 points)
  addToRoutePolyline(location);
};

// Server-side (Cloud Function via Pub/Sub)
pubsub.topic('tracking-updates').publish({
  trackingId,
  location: { lat, lng, speed },
  timestamp: Date.now()
});
```

## Erratic Driving Detection

```typescript
async function detectErratiDriving(
  trackingId: string, 
  currentSpeed: number, 
  previousSpeed: number
) {
  const speedDelta = Math.abs(currentSpeed - previousSpeed);
  const timeDelta = 30; // seconds between updates
  
  // Flag if acceleration/deceleration > 40km/h in 30s
  if (speedDelta > 40) {
    await db.collection('trackingSessions').doc(trackingId).update({
      incidents: FieldValue.arrayUnion({
        type: 'erratic_driving',
        timestamp: FieldValue.serverTimestamp(),
        speedChange: speedDelta,
        severity: speedDelta > 60 ? 'high' : 'medium'
      })
    });
    
    // Alert student in real-time
    await sendPushNotification(studentId, {
      title: 'Alerta de Segurança',
      body: 'Mudança brusca de velocidade detectada',
      priority: 'high'
    });
    
    // Log for analytics
    await logToAnalytics('safety_incident', {
      trackingId,
      type: 'erratic_driving',
      speedDelta
    });
  }
}
```

## Distance Calculation (Haversine)

```typescript
function calculateDistance(
  lat1: number, lng1: number,
  lat2: number, lng2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}
```

## Storage & Performance

| Data Type | Storage Duration | Storage Location | Access Pattern |
|-----------|------------------|------------------|----------------|
| Route points (detailed) | 7 days | Firestore subcollection | Real-time writes, batch reads |
| Aggregated metrics | Permanent | Firestore main doc | Occasional reads |
| SOS alerts | 90 days | Firestore + Admin DB | Immediate on creation |
| Analytics export | Indefinite | BigQuery | Monthly reports |

### Firestore Structure
```
/trackingSessions/{trackingId}
  - bookingId: string
  - startedAt: timestamp
  - endedAt: timestamp
  - distance: number (km)
  - duration: number (seconds)
  - avgSpeed: number (km/h)
  - anonymized: boolean
  
  /route (subcollection - deleted after 7 days)
    /{pointId}
      - lat: number
      - lng: number
      - speed: number
      - accuracy: number
      - timestamp: timestamp
```

## Error Handling

| Scenario | Response | User Impact |
|----------|----------|-------------|
| GPS signal lost | Queue updates, sync when reconnected | Gaps in route trail |
| WebSocket disconnect | Auto-reconnect with exponential backoff | Brief map freeze |
| SOS SMS failure | Retry 3x, fallback to email | Delayed emergency notification |
| Storage quota exceeded | Compress old routes, archive to Cloud Storage | None (transparent) |

