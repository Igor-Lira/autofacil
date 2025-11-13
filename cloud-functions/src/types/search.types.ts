/**
 * Type definitions for Search & Matching
 */

export interface InstructorSearchFilters {
  location: {
    lat: number;
    lng: number;
  };
  radius?: number; // km (default: 10)
  categories?: string[]; // ['A', 'B', 'C', 'D', 'E', 'ACC']
  priceRange?: {
    min: number;
    max: number;
  };
  minRating?: number;
  availability?: 'today' | 'this_week' | 'next_7_days';
  vehicleType?: 'manual' | 'automatic';
  acceptsBeginners?: boolean;
  accessiblePcD?: boolean;
  page?: number;
  limit?: number;
}

export interface InstructorSummary {
  id: string;
  name: string;
  photo?: string;
  rating: number;
  totalReviews: number;
  categories: string[];
  pricePerHour: number;
  distance: number; // km from search location
  vehicleType: 'manual' | 'automatic';
  verified: boolean;
  badges: string[];
  matchScore?: number; // Internal ranking score
}

export interface PaginatedInstructorsResponse {
  data: InstructorSummary[];
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
}

export interface AvailabilitySlot {
  date: string; // ISO 8601
  slots: TimeSlot[];
}

export interface TimeSlot {
  start: string; // HH:mm format
  end: string;
  available: boolean;
  duration: number; // hours
}

export interface InstructorAvailabilityRequest {
  instructorId: string;
  startDate?: string; // ISO 8601
  endDate?: string; // ISO 8601
}

