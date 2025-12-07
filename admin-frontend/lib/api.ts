import { apiClient, ApiResponse } from './api-client';
import { User, CreateUserRequest, UpdateUserRequest, LoginRequest, LoginResponse } from './types';

export const authApi = {
  login: async (data: LoginRequest): Promise<ApiResponse<LoginResponse>> => {
    const response = await apiClient.post<LoginResponse>('/auth/login', data);
    if (response.success && response.data?.accessToken) {
      apiClient.setToken(response.data.accessToken);
    }
    return response;
  },

  logout: () => {
    apiClient.clearToken();
  },

  isLoggedIn: () => {
    return !!apiClient.getToken();
  }
};

export const userApi = {
  getAll: (): Promise<ApiResponse<User[]>> => {
    return apiClient.get<User[]>('/admin/users');
  },

  getById: (id: number): Promise<ApiResponse<User>> => {
    return apiClient.get<User>(`/admin/users/${id}`);
  },

  create: (data: CreateUserRequest): Promise<ApiResponse<User>> => {
    return apiClient.post<User>('/admin/users', data);
  },

  update: (id: number, data: UpdateUserRequest): Promise<ApiResponse<User>> => {
    return apiClient.put<User>(`/admin/users/${id}`, data);
  },

  delete: (id: number): Promise<ApiResponse<void>> => {
    return apiClient.delete<void>(`/admin/users/${id}`);
  },

  resetPassword: (id: number, newPassword: string): Promise<ApiResponse<void>> => {
    return apiClient.post<void>(`/admin/users/${id}/reset-password`, { newPassword });
  }
};
