export interface User {
  id: string;
  username: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserCredentials {
  email: string;
  password: string;
}

export interface UserRegistration extends UserCredentials {
  username: string;
  confirmPassword: string;
} 