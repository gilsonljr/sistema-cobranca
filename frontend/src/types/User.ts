export type UserRole = 'admin' | 'supervisor' | 'collector' | 'seller' | 'operador' | 'vendedor' | 'user';

export interface User {
  id: number;
  email: string;
  full_name: string;
  role: UserRole;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
  password_hash?: string;
  password_changed_at?: Date;
  last_login_at?: Date;
  failed_login_attempts?: number;
  account_locked_until?: Date;

  // Additional properties from UserManager.ts User interface
  nome?: string;
  papeis?: string[];
  permissoes?: string[];
  ativo?: boolean;
}

// Helper type for user creation/update
export interface UserInput {
  email: string;
  full_name: string;
  role: UserRole;
  is_active: boolean;
  password?: string;

  // Additional properties for legacy forms
  nome?: string;
  confirmarSenha?: string;
  senha?: string;
  papeis?: UserRole[];
  permissoes?: string[];
  perfil?: string;
  ativo?: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetConfirm {
  token: string;
  new_password: string;
}

export interface PasswordChange {
  current_password: string;
  new_password: string;
}
