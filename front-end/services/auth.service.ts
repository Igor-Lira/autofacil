import apiClient, { setAccessToken, setRefreshToken, clearTokens, createFormData } from './api-client';
import type {
  AuthResponse,
  LoginCredentials,
  StudentRegistration,
  InstructorRegistration
} from '../../lib/models/auth';

class AuthService {
  /**
   * Register a new student
   */
  async registerStudent(data: StudentRegistration): Promise<AuthResponse> {
    const formData = createFormData(data);
    const response = await apiClient.post<AuthResponse>('/auth/register/student', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    if (response.data.accessToken) {
      await setAccessToken(response.data.accessToken);
      await setRefreshToken(response.data.refreshToken);
    }

    return response.data;
  }

  /**
   * Register a new instructor
   */
  async registerInstructor(data: InstructorRegistration): Promise<AuthResponse> {
    const formData = createFormData(data);
    const response = await apiClient.post<AuthResponse>('/auth/register/instructor', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    if (response.data.accessToken) {
      await setAccessToken(response.data.accessToken);
      await setRefreshToken(response.data.refreshToken);
    }

    return response.data;
  }

  /**
   * Login user
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/login', credentials);

    if (response.data.accessToken) {
      await setAccessToken(response.data.accessToken);
      await setRefreshToken(response.data.refreshToken);
    }

    return response.data;
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    await clearTokens();
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(cpf: string, email: string): Promise<{ message: string }> {
    const response = await apiClient.post('/auth/password-reset', { cpf, email });
    return response.data;
  }

  /**
   * Confirm password reset with token
   */
  async confirmPasswordReset(token: string, newPassword: string): Promise<void> {
    await apiClient.post('/auth/password-reset/confirm', { token, newPassword });
  }

  /**
   * Resend email verification
   */
  async resendEmailVerification(): Promise<void> {
    await apiClient.post('/auth/verify-email');
  }

  /**
   * Confirm email with token
   */
  async confirmEmail(token: string): Promise<void> {
    await apiClient.get('/auth/verify-email/confirm', { params: { token } });
  }

  /**
   * Send phone verification SMS
   */
  async sendPhoneVerification(): Promise<{ expiresIn: number }> {
    const response = await apiClient.post('/auth/verify-phone');
    return response.data;
  }

  /**
   * Confirm phone with verification code
   */
  async confirmPhone(code: string): Promise<void> {
    await apiClient.post('/auth/verify-phone/confirm', { code });
  }
}

export default new AuthService();

