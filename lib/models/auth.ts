/**
 * Authentication Models
 */

import { UserType } from './enums';

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: {
    id: string;
    type: UserType;
    email: string;
    emailVerified: boolean;
    phoneVerified: boolean;
  };
}

export interface Login {
  cpf: string;
  password: string;
}

export interface StudentRegistration {
  cpf: string;
  name: string;
  birthDate: string;
  phone: string;
  email: string;
  password: string;
  rg: File | Blob;
  cnh?: File | Blob;
  proofOfAddress: File | Blob;
  acceptLGPD: true;
}

export interface InstructorRegistration {
  cpf: string;
  name: string;
  birthDate: string;
  phone: string;
  email: string;
  password: string;
  cnh: File | Blob;
  detranCertificate: File | Blob;
  criminalRecord?: File | Blob;
  vehicle: VehicleInput;
  experienceYears: number;
  categories: string[];
  pricePerHour?: number;
  acceptLGPD: true;
}

export interface VehicleInput {
  model: string;
  plate: string;
  year: number;
  type: string;
  photo?: string;
  hasIdentification?: boolean;
}

export interface ErrorResponse {
  code: string;
  message: string;
  details?: Record<string, any>;
  timestamp?: string;
}

