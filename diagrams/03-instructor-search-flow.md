# Instructor Search & Discovery Flow

```mermaid
sequenceDiagram
    participant Client as Mobile App
    participant CF as searchInstructors
    participant Cache as Redis Cache
    participant DB as Firestore
    participant Geo as GeoHash Library
    participant Maps as Google Maps API

    Client->>CF: GET /instructors?<br/>location=lat,lng&radius=10&<br/>category=B&priceMax=100&<br/>minRating=4.0&page=1&limit=10
    
    CF->>Cache: Check cache key: "search:{params_hash}"
    
    alt Cache Hit
        Cache-->>CF: Cached results (TTL: 5min)
        CF-->>Client: HTTP 200 {data, cached: true}
    else Cache Miss
        CF->>Geo: Calculate GeoHash bounds<br/>(Haversine formula)
        Geo-->>CF: {minHash, maxHash}
        
        CF->>DB: Query /instructors<br/>WHERE status = "aprovado"<br/>AND categories CONTAINS "B"<br/>AND pricePerHour <= 100<br/>AND rating >= 4.0<br/>AND geoHash BETWEEN bounds
        
        DB-->>CF: Raw results (50 instructors)
        
        loop For each instructor
            CF->>CF: calculateDistance(userLat, instructorLat)
            CF->>CF: calculateScore:<br/>proximity(40%) + rating(30%) +<br/>price(20%) + availability(10%)
        end
        
        CF->>CF: Sort by score DESC<br/>Filter radius <= 10km<br/>Limit to 10 results
        
        CF->>Cache: Store results (TTL: 5min)
        
        CF-->>Client: HTTP 200<br/>{data: InstructorSummary[],<br/>page: 1, total: 23, hasMore: true}
    end
```

## Ranking Algorithm

```javascript
function calculateScore(instructor, userLocation, filters) {
  const proximity = 1 - (distance / maxRadius); // 40%
  const rating = instructor.rating / 5.0;        // 30%
  const price = 1 - (instructor.price / 150);    // 20%
  const availability = instructor.hasSlots ? 1 : 0.5; // 10%
  
  return (proximity * 0.4) + 
         (rating * 0.3) + 
         (price * 0.2) + 
         (availability * 0.1);
}
```

## Firestore Composite Indexes Required

```javascript
// Index 1: Search optimization
instructors: {
  status: ASC,
  categories: ARRAY,
  rating: DESC,
  pricePerHour: ASC,
  geoHash: ASC
}

// Index 2: Availability lookup
instructors/{id}/calendar: {
  date: ASC,
  available: ASC
}
```

## Instructor Profile View Flow

```mermaid
sequenceDiagram
    participant Client
    participant CF1 as getInstructorDetails
    participant CF2 as getInstructorAvailability
    participant DB as Firestore
    participant Storage as Cloud Storage

    Client->>CF1: GET /instructors/{id}
    
    CF1->>DB: Get /instructors/{id}
    DB-->>CF1: Full profile data
    
    CF1->>DB: Get /instructors/{id}/reviews<br/>(limit: 5, orderBy: date DESC)
    DB-->>CF1: Recent reviews
    
    CF1->>Storage: Get signed URLs for photos
    Storage-->>CF1: Temporary URLs (1h expiry)
    
    CF1-->>Client: HTTP 200<br/>{profile, reviews, badges, stats}
    
    Client->>CF2: GET /instructors/{id}/availability?<br/>startDate=2025-05-18&endDate=2025-06-18
    
    CF2->>DB: Get /instructors/{id}/calendar<br/>WHERE date BETWEEN range
    DB-->>CF2: Calendar slots
    
    CF2->>DB: Get /bookings<br/>WHERE instructorId = {id}<br/>AND date BETWEEN range<br/>AND status IN ["confirmada", "pendente"]
    DB-->>CF2: Booked slots
    
    CF2->>CF2: Merge and mark availability
    
    CF2-->>Client: HTTP 200<br/>{availability: [<br/>  {date: "2025-05-18", slots: [...]},<br/>  {date: "2025-05-19", slots: [...]}<br/>]}
```

## Performance Optimizations

1. **Redis Caching**: 5-minute TTL for popular searches
2. **GeoHash Indexing**: O(log n) proximity queries
3. **Pagination**: Max 50 results per query
4. **CDN**: Static instructor photos via Firebase Hosting

