/**
 * Type adapter utilities to handle different User type formats in the application
 */

import { User as UserType } from '../types/User';
import { User as UserManagerType } from '../services/UserManager';

/**
 * Ensures a user object has all required properties with proper defaults
 * This helps handle both the User type from types/User.ts and from UserManager.ts
 */
export function ensureUserProperties(user: any): UserType {
  return {
    // Standard User properties
    id: user.id,
    email: user.email || '',
    full_name: user.full_name || user.nome || '',
    role: user.role || (user.papeis && user.papeis.includes('admin') ? 'admin' : 
                        user.papeis && user.papeis.includes('supervisor') ? 'supervisor' : 
                        user.papeis && user.papeis.includes('collector') ? 'collector' : 
                        user.papeis && user.papeis.includes('seller') ? 'seller' : 'collector'),
    is_active: user.is_active !== undefined ? user.is_active : (user.ativo !== undefined ? user.ativo : true),
    created_at: user.created_at || new Date(),
    updated_at: user.updated_at || new Date(),
    
    // Additional properties from UserManager
    nome: user.nome || user.full_name || '',
    papeis: user.papeis || [user.role || 'collector'],
    permissoes: user.permissoes || [],
    ativo: user.ativo !== undefined ? user.ativo : (user.is_active !== undefined ? user.is_active : true),
  };
}

/**
 * Converts a User from types/User.ts to a User from UserManager.ts
 */
export function convertToUserManagerType(user: UserType): UserManagerType {
  return {
    id: user.id,
    nome: user.nome || user.full_name,
    email: user.email,
    papeis: user.papeis || [user.role],
    permissoes: user.permissoes || [],
    ativo: user.ativo !== undefined ? user.ativo : user.is_active
  };
}

/**
 * Converts a User from UserManager.ts to a User from types/User.ts
 */
export function convertToUserType(user: UserManagerType): UserType {
  // Map papeis to role
  let role = 'collector';
  if (user.papeis && user.papeis.includes('admin')) role = 'admin';
  else if (user.papeis && user.papeis.includes('supervisor')) role = 'supervisor';
  else if (user.papeis && user.papeis.includes('collector')) role = 'collector';
  else if (user.papeis && user.papeis.includes('seller')) role = 'seller';

  return {
    id: user.id,
    email: user.email,
    full_name: user.nome,
    role: role as any,
    is_active: user.ativo,
    created_at: new Date(),
    updated_at: new Date(),
    nome: user.nome,
    papeis: user.papeis,
    permissoes: user.permissoes,
    ativo: user.ativo
  };
}
