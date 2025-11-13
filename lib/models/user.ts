/**
 * User Profile Models
 */

import { UserStatus, InstructorStatus, LicenseCategory, VehicleType } from './enums';
import { StudentProgress } from './progress';

export interface StudentProfile {
  id: string;
  cpf: string;
  name: string;
  birthDate: string;
  phone: string;
  email: string;
  photo?: string;
  address?: string;
  emailVerified: boolean;
  phoneVerified: boolean;
  status: UserStatus;
  preferences?: StudentPreferences;
  progress?: StudentProgress;
  createdAt: string;
}

export interface StudentPreferences {
  category?: LicenseCategory;
  budget?: number;
  schedule?: string;
}

export interface StudentProfileUpdate {
  name?: string;
  phone?: string;
  photo?: string;
  address?: string;
  preferences?: StudentPreferences;
}

export interface InstructorProfile {
  id: string;
  cpf: string;
  name: string;
  birthDate: string;
  phone: string;
  email: string;
  photo?: string;
  status: InstructorStatus;
  categories: LicenseCategory[];
  experienceYears: number;
  vehicle: Vehicle;
  pricePerHour: number;
  calendar?: string;
  rating: number;
  totalReviews: number;
  badges: string[];
  approvalDate?: string;
  createdAt: string;
}

export interface InstructorProfileUpdate {
  phone?: string;
  photo?: string;
  pricePerHour?: number;
  calendar?: string;
  vehicle?: Vehicle;
}

export interface Vehicle {
  model: string;
  plate: string;
  year: number;
  type: VehicleType;
  photo?: string;
  hasIdentification?: boolean;
}

export interface InstructorSummary {
  id: string;
  name: string;
  rating: number;
  totalReviews: number;
  categories: string[];
  pricePerHour: number;
  distance?: number;
  vehicleType: VehicleType;
  verified: boolean;
}

