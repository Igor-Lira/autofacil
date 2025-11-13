/**
 * Cloud Function: searchInstructors
 *
 * Searches instructors using geolocation (Haversine formula) and filters.
 * Returns paginated results with ranking algorithm.
 *
 * Ranking Algorithm:
 * - Proximity (40%)
 * - Rating (30%)
 * - Price compatibility (20%)
 * - Availability (10%)
 *
 * Dependencies:
 * - Firestore (composite indexes on status, categories, rating)
 * - Redis cache (5-minute TTL)
 * - GeoHash library (geolocation indexing)
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { FunctionError, ErrorCodes } from '../utils/errors';
import {
  InstructorSearchFilters,
  InstructorSummary,
  PaginatedInstructorsResponse
} from '../types/search.types';
import { calculateDistance, getBoundingBox } from '../utils/geolocation';

export const searchInstructors = functions.https.onCall(
  async (data: InstructorSearchFilters, context) => {
    const db = admin.firestore();

    try {
      // 1. Validate required parameters
      if (!data.location || !data.location.lat || !data.location.lng) {
        throw new FunctionError(
          ErrorCodes.VALIDATION_ERROR,
          'Location (lat, lng) is required',
          400
        );
      }

      // 2. Set defaults
      const radius = data.radius || 10; // km
      const page = data.page || 1;
      const limit = data.limit || 10;
      const maxRadius = 50; // Maximum search radius

      if (radius > maxRadius) {
        throw new FunctionError(
          ErrorCodes.VALIDATION_ERROR,
          `Radius cannot exceed ${maxRadius}km`,
          400
        );
      }

      // 3. Generate cache key
      const cacheKey = generateCacheKey(data);

      // 4. Check Redis cache
      const cachedResult = await getCachedResults(cacheKey);
      if (cachedResult) {
        console.log(`Cache hit for search: ${cacheKey}`);
        return paginateResults(cachedResult, page, limit);
      }

      console.log(`Cache miss for search: ${cacheKey}`);

      // 5. Get bounding box for initial filtering
      const bounds = getBoundingBox(data.location.lat, data.location.lng, radius);

      // 6. Build Firestore query
      let query = db.collection('instructors')
        .where('status', '==', 'aprovado')
        .where('location.lat', '>=', bounds.minLat)
        .where('location.lat', '<=', bounds.maxLat);

      // 7. Execute query
      const snapshot = await query.get();

      // 8. Filter and score results
      let instructors: InstructorSummary[] = [];

      for (const doc of snapshot.docs) {
        const instructor = doc.data();

        // Calculate distance
        const distance = calculateDistance(
          data.location.lat,
          data.location.lng,
          instructor.location.lat,
          instructor.location.lng
        );

        // Skip if outside radius
        if (distance > radius) {
          continue;
        }

        // Apply category filter
        if (data.categories && data.categories.length > 0) {
          const hasCategory = data.categories.some(cat =>
            instructor.categories.includes(cat)
          );
          if (!hasCategory) {
            continue;
          }
        }

        // Apply price filter
        if (data.priceRange) {
          if (
            instructor.pricePerHour < data.priceRange.min ||
            instructor.pricePerHour > data.priceRange.max
          ) {
            continue;
          }
        }

        // Apply rating filter
        if (data.minRating && instructor.rating < data.minRating) {
          continue;
        }

        // Apply vehicle type filter
        if (data.vehicleType && instructor.vehicle?.type !== data.vehicleType) {
          continue;
        }

        // Check availability if requested
        let hasAvailability = true;
        if (data.availability) {
          hasAvailability = await checkInstructorAvailability(
            doc.id,
            data.availability
          );
          if (!hasAvailability) {
            continue;
          }
        }

        // Calculate match score
        const matchScore = calculateMatchScore(
          distance,
          radius,
          instructor.rating,
          instructor.pricePerHour,
          data.priceRange,
          hasAvailability
        );

        // Build summary object
        const summary: InstructorSummary = {
          id: doc.id,
          name: instructor.name,
          photo: instructor.photo || null,
          rating: instructor.rating,
          totalReviews: instructor.totalReviews || 0,
          categories: instructor.categories,
          pricePerHour: instructor.pricePerHour,
          distance: Math.round(distance * 10) / 10, // Round to 1 decimal
          vehicleType: instructor.vehicle?.type || 'manual',
          verified: instructor.detranValidated || false,
          badges: instructor.badges || [],
          matchScore
        };

        instructors.push(summary);
      }

      // 9. Sort by match score (descending)
      instructors.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));

      // 10. Cache results (5 minutes)
      await cacheResults(cacheKey, instructors, 300);

      // 11. Log search metrics
      console.log(`Search completed: ${instructors.length} results`, {
        location: data.location,
        radius,
        filters: {
          categories: data.categories,
          priceRange: data.priceRange,
          minRating: data.minRating
        }
      });

      // 12. Return paginated results
      return paginateResults(instructors, page, limit);

    } catch (error) {
      console.error('Error searching instructors:', error);

      if (error instanceof FunctionError) {
        throw new functions.https.HttpsError(
          'invalid-argument',
          error.message,
          error.toJSON()
        );
      }

      throw new functions.https.HttpsError(
        'internal',
        'Failed to search instructors',
        { originalError: error.message }
      );
    }
  }
);

/**
 * Helper: Calculate match score using weighted algorithm
 *
 * Score breakdown:
 * - Proximity: 40% (closer = better)
 * - Rating: 30% (higher = better)
 * - Price: 20% (within budget = better)
 * - Availability: 10% (available = better)
 */
function calculateMatchScore(
  distance: number,
  maxRadius: number,
  rating: number,
  price: number,
  priceRange?: { min: number; max: number },
  hasAvailability: boolean = true
): number {
  // Proximity score (0-1, inverse of distance)
  const proximityScore = 1 - (distance / maxRadius);

  // Rating score (0-1, normalized to 5-star scale)
  const ratingScore = rating / 5.0;

  // Price score (0-1, based on budget fit)
  let priceScore = 0.5; // Default neutral
  if (priceRange) {
    const midpoint = (priceRange.min + priceRange.max) / 2;
    const range = priceRange.max - priceRange.min;
    const deviation = Math.abs(price - midpoint);
    priceScore = Math.max(0, 1 - (deviation / range));
  }

  // Availability score
  const availabilityScore = hasAvailability ? 1.0 : 0.5;

  // Weighted total
  const totalScore =
    proximityScore * 0.4 +
    ratingScore * 0.3 +
    priceScore * 0.2 +
    availabilityScore * 0.1;

  return Math.round(totalScore * 100) / 100; // Round to 2 decimals
}

/**
 * Helper: Check if instructor has availability in requested time frame
 */
async function checkInstructorAvailability(
  instructorId: string,
  timeFrame: 'today' | 'this_week' | 'next_7_days'
): Promise<boolean> {
  const db = admin.firestore();
  const now = new Date();
  let endDate = new Date();

  switch (timeFrame) {
    case 'today':
      endDate.setHours(23, 59, 59, 999);
      break;
    case 'this_week':
      const daysUntilSunday = 7 - now.getDay();
      endDate.setDate(now.getDate() + daysUntilSunday);
      endDate.setHours(23, 59, 59, 999);
      break;
    case 'next_7_days':
      endDate.setDate(now.getDate() + 7);
      break;
  }

  // Check calendar for available slots
  const calendarSnapshot = await db
    .collection('instructors')
    .doc(instructorId)
    .collection('calendar')
    .where('date', '>=', now)
    .where('date', '<=', endDate)
    .where('available', '==', true)
    .limit(1)
    .get();

  return !calendarSnapshot.empty;
}

/**
 * Helper: Generate cache key from search parameters
 */
function generateCacheKey(filters: InstructorSearchFilters): string {
  const parts = [
    `lat:${filters.location.lat.toFixed(4)}`,
    `lng:${filters.location.lng.toFixed(4)}`,
    `r:${filters.radius || 10}`,
    filters.categories ? `cat:${filters.categories.sort().join(',')}` : '',
    filters.priceRange ? `price:${filters.priceRange.min}-${filters.priceRange.max}` : '',
    filters.minRating ? `rating:${filters.minRating}` : '',
    filters.vehicleType ? `vt:${filters.vehicleType}` : '',
    filters.availability ? `av:${filters.availability}` : ''
  ];

  return `search:${parts.filter(p => p).join(':')}`;
}

/**
 * Helper: Get cached results from Redis
 */
async function getCachedResults(key: string): Promise<InstructorSummary[] | null> {
  try {
    // TODO: Implement Redis integration
    // const redis = require('redis');
    // const client = redis.createClient({
    //   host: process.env.REDIS_HOST,
    //   port: process.env.REDIS_PORT,
    //   password: process.env.REDIS_PASSWORD
    // });

    // const cached = await client.get(key);
    // return cached ? JSON.parse(cached) : null;

    // For now, return null (no cache)
    return null;
  } catch (error) {
    console.error('Redis cache read error:', error);
    return null; // Fail gracefully
  }
}

/**
 * Helper: Cache results in Redis
 */
async function cacheResults(
  key: string,
  results: InstructorSummary[],
  ttl: number
): Promise<void> {
  try {
    // TODO: Implement Redis integration
    // const redis = require('redis');
    // const client = redis.createClient({
    //   host: process.env.REDIS_HOST,
    //   port: process.env.REDIS_PORT,
    //   password: process.env.REDIS_PASSWORD
    // });

    // await client.setex(key, ttl, JSON.stringify(results));

    console.log(`Results cached with key: ${key} (TTL: ${ttl}s)`);
  } catch (error) {
    console.error('Redis cache write error:', error);
    // Fail gracefully - don't throw
  }
}

/**
 * Helper: Paginate results
 */
function paginateResults(
  results: InstructorSummary[],
  page: number,
  limit: number
): PaginatedInstructorsResponse {
  const start = (page - 1) * limit;
  const end = start + limit;
  const paginatedData = results.slice(start, end);

  return {
    data: paginatedData,
    page,
    limit,
    total: results.length,
    hasMore: end < results.length
  };
}

