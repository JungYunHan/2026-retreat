export interface User {
  id: number;
  username: string;
  password?: string;
  name: string;
  phoneNumber: string;
  gender: string;
  birthDate: string | null;
  email: string | null;
  role: string;
  teamName: string | null;
  position: string | null;
  passwordChangeRequired: boolean;
  createdAt: string;
  updatedAt: string;
}

export type CreateUserRequest = Partial<User> & {
  username: string;
  password: string;
  name: string;
  phoneNumber: string;
  gender: string;
};

export type UpdateUserRequest = Partial<User>;

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
}
