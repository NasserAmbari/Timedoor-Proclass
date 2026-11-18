export type Role = 'admin' | 'user';

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  username?: string;
  urlImage?: string;
  role: Role;
}

export interface Register {
  fullName: string;
  username: string;
  email: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthError {
  code: string;
  message: string;
}
