/**
 * Type definitions for Authentication & User Management
 */

export interface StudentRegistrationData {
  userId: string;
  cpf: string;
  name: string;
  birthDate: string; // ISO 8601
  phone: string;
  email: string;
  documents: {
    rg: string; // Storage URL
    cnh?: string; // Storage URL (optional)
    proofOfAddress: string; // Storage URL
  };
  acceptLGPD: boolean;
}

export interface InstructorRegistrationData {
  userId: string;
  cpf: string;
  name: string;
  birthDate: string;
  phone: string;
  email: string;
  cnh: string; // Storage URL
  detranCertificate: string; // Storage URL
  criminalRecord?: string; // Storage URL (optional)
  vehicle: VehicleData;
  experienceYears: number;
  categories: string[]; // ['A', 'B', 'C', 'D', 'E', 'ACC']
  pricePerHour?: number;
  acceptLGPD: boolean;
}

export interface VehicleData {
  model: string;
  plate: string;
  year: number;
  type: 'manual' | 'automatic';
  hasIdentification: boolean;
  photo?: string;
}

export interface CNHValidationData {
  cnhNumber: string;
  cpf: string;
  state: string; // UF code (e.g., 'SP', 'RJ')
  expiryDate: string;
}

export interface DetranAPIResponse {
  isValid: boolean;
  hasEAR: boolean;
  categories: string[];
  expiryDate: string;
  detranProtocol?: string;
}

export interface SMSVerificationData {
  userId: string;
  phone: string;
}

export interface SMSCodeVerificationData {
  userId: string;
  code: string;
}

export interface VerificationCode {
  code: string;
  hash: string;
  createdAt: Date;
  expiresAt: Date;
  attempts: number;
}

