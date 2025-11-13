/**
 * Progress and Rating Models
 */

import { Booking } from './booking';

export interface StudentProgress {
  theoreticalHours: number;
  practicalHours: number;
  requiredTheoretical: number;
  requiredPractical: number;
  focusStats: Record<string, number>;
  lessons: Booking[];
  examEligible: boolean;
}

export interface InstructorRating {
  rating: number;
  totalReviews: number;
  badges: string[];
  reviews: Review[];
  stats: InstructorStats;
}

export interface InstructorStats {
  totalLessons: number;
  approvalRate: number;
  punctualityRate: number;
}

export interface Review {
  id: string;
  studentName: string;
  rating: number;
  tags: string[];
  comment: string;
  date: string;
}

