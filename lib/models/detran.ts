/**
 * Detran Integration Models
 */

import { DetranLessonType, DetranValidationStatus, LicenseCategory } from './enums';

export interface DetranValidationRequest {
  cpf_aluno: string;
  cpf_instrutor: string;
  data_aula: string;
  duracao_horas: number;
  categoria: LicenseCategory;
  tipo: DetranLessonType;
  veiculo_placa: string;
}

export interface DetranValidationResponse {
  protocolo: string;
  hash: string;
  status: DetranValidationStatus;
  message?: string;
}

