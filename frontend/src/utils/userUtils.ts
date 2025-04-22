import { User } from '../types/User';

export const convertToUserManagerFormat = (user: User) => {
  // Convert role to papeis
  const papeis = [user.role];
  if (user.role === 'collector') papeis.push('operador' as any);
  if (user.role === 'seller') papeis.push('vendedor' as any);

  // Get permissions based on role
  const permissoes = getPermissionsFromRole(user.role);

  return {
    id: user.id,
    nome: user.full_name,
    email: user.email,
    papeis,
    permissoes,
    ativo: user.is_active
  };
};

export const convertFromUserManagerFormat = (user: any): User => {
  // Convert papeis to role
  let role: 'admin' | 'supervisor' | 'collector' | 'seller' = 'collector';
  if (user.papeis?.includes('admin')) role = 'admin';
  else if (user.papeis?.includes('supervisor')) role = 'supervisor';
  else if (user.papeis?.includes('collector') || user.papeis?.includes('operador')) role = 'collector';
  else if (user.papeis?.includes('seller') || user.papeis?.includes('vendedor')) role = 'seller';

  return {
    id: user.id,
    email: user.email,
    full_name: user.nome,
    role,
    is_active: user.ativo !== undefined ? user.ativo : true,
    created_at: user.created_at ? new Date(user.created_at) : new Date(),
    updated_at: user.updated_at ? new Date(user.updated_at) : new Date()
  };
};

const getPermissionsFromRole = (role: string): string[] => {
  switch (role) {
    case 'admin':
      return ['criar_usuario', 'editar_usuario', 'excluir_usuario', 'ver_relatorios',
              'editar_configuracoes', 'ver_todos_pedidos', 'editar_pedidos'];
    case 'supervisor':
      return ['ver_relatorios', 'ver_todos_pedidos', 'editar_pedidos'];
    case 'collector':
      return ['ver_pedidos_atribuidos', 'editar_pedidos_atribuidos'];
    case 'seller':
      return ['ver_pedidos_proprios', 'criar_pedidos'];
    default:
      return [];
  }
};