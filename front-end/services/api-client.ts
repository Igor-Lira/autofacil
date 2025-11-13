import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Constants
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://api.autofacil.com/v1';
const TOKEN_KEY = '@autofacil:token';
const REFRESH_TOKEN_KEY = '@autofacil:refresh_token';

// Token management
let accessToken: string | null = null;
let refreshToken: string | null = null;

export const getAccessToken = async (): Promise<string | null> => {
  if (!accessToken) {
    accessToken = await AsyncStorage.getItem(TOKEN_KEY);
  }
  return accessToken;
};

export const setAccessToken = async (token: string | null): Promise<void> => {
  accessToken = token;
  if (token) {
    await AsyncStorage.setItem(TOKEN_KEY, token);
  } else {
    await AsyncStorage.removeItem(TOKEN_KEY);
  }
};

export const getRefreshToken = async (): Promise<string | null> => {
  if (!refreshToken) {
    refreshToken = await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
  }
  return refreshToken;
};

export const setRefreshToken = async (token: string | null): Promise<void> => {
  refreshToken = token;
  if (token) {
    await AsyncStorage.setItem(REFRESH_TOKEN_KEY, token);
  } else {
    await AsyncStorage.removeItem(REFRESH_TOKEN_KEY);
  }
};

export const clearTokens = async (): Promise<void> => {
  accessToken = null;
  refreshToken = null;
  await AsyncStorage.multiRemove([TOKEN_KEY, REFRESH_TOKEN_KEY]);
};

// API Client Instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor - Add auth token
apiClient.interceptors.request.use(
  async (config) => {
    const token = await getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor - Handle token refresh
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

    // If error is 401 and we haven't tried to refresh yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Queue the request while token is being refreshed
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return apiClient(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshTokenValue = await getRefreshToken();

      if (!refreshTokenValue) {
        // No refresh token, clear everything and reject
        await clearTokens();
        processQueue(new Error('No refresh token available'), null);
        isRefreshing = false;
        return Promise.reject(error);
      }

      try {
        // Attempt to refresh the token
        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refreshToken: refreshTokenValue,
        });

        const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response.data;

        await setAccessToken(newAccessToken);
        if (newRefreshToken) {
          await setRefreshToken(newRefreshToken);
        }

        // Update the failed requests queue
        processQueue(null, newAccessToken);

        // Retry the original request
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        }
        isRefreshing = false;
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed, clear tokens and reject all queued requests
        processQueue(refreshError as Error, null);
        await clearTokens();
        isRefreshing = false;
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Helper function to handle errors
export const handleApiError = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{ message?: string; code?: string }>;

    if (axiosError.response) {
      // Server responded with error
      return axiosError.response.data?.message || 'Erro ao processar requisição';
    } else if (axiosError.request) {
      // Request made but no response
      return 'Sem resposta do servidor. Verifique sua conexão.';
    }
  }

  return 'Erro desconhecido. Tente novamente.';
};

// Multipart/form-data helper
export const createFormData = (data: Record<string, any>): FormData => {
  const formData = new FormData();

  Object.keys(data).forEach((key) => {
    const value = data[key];

    if (value === null || value === undefined) {
      return;
    }

    if (Array.isArray(value)) {
      value.forEach((item) => {
        formData.append(key, item);
      });
    } else if (typeof value === 'object' && value.uri) {
      // Handle file uploads (from image picker)
      formData.append(key, {
        uri: value.uri,
        type: value.type || 'image/jpeg',
        name: value.name || `${key}.jpg`,
      } as any);
    } else {
      formData.append(key, value);
    }
  });

  return formData;
};

export default apiClient;

