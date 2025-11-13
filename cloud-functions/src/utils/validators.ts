/**
 * Utility functions for CPF validation
 */

/**
 * Validates Brazilian CPF using verification digits algorithm
 * @param cpf - CPF string (with or without formatting)
 * @returns boolean indicating if CPF is valid
 */
export function validateCPF(cpf: string): boolean {
  // Remove non-digits
  const cleanCPF = cpf.replace(/\D/g, '');

  // Check length
  if (cleanCPF.length !== 11) {
    return false;
  }

  // Check for known invalid CPFs (all same digits)
  if (/^(\d)\1{10}$/.test(cleanCPF)) {
    return false;
  }

  // Validate first verification digit
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (10 - i);
  }
  let digit1 = 11 - (sum % 11);
  if (digit1 >= 10) digit1 = 0;

  if (digit1 !== parseInt(cleanCPF.charAt(9))) {
    return false;
  }

  // Validate second verification digit
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (11 - i);
  }
  let digit2 = 11 - (sum % 11);
  if (digit2 >= 10) digit2 = 0;

  if (digit2 !== parseInt(cleanCPF.charAt(10))) {
    return false;
  }

  return true;
}

/**
 * Formats CPF with standard Brazilian format
 * @param cpf - CPF string (digits only)
 * @returns Formatted CPF (xxx.xxx.xxx-xx)
 */
export function formatCPF(cpf: string): string {
  const cleanCPF = cpf.replace(/\D/g, '');
  return cleanCPF.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

/**
 * Validates age based on birthDate
 * @param birthDate - ISO 8601 date string
 * @param minAge - Minimum required age
 * @returns boolean indicating if user meets age requirement
 */
export function validateAge(birthDate: string, minAge: number): boolean {
  const birth = new Date(birthDate);
  const today = new Date();

  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }

  return age >= minAge;
}

