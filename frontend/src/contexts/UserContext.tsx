import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import UserSyncService from '../services/UserSyncService';

// Interface para o tipo de usuário
export interface User {
  id: number;
  nome: string;
  email: string;
  papeis: string[];
  permissoes: string[];
  ativo: boolean;
}

// Interface para o contexto
interface UserContextType {
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  getUserById: (id: number) => User | undefined;
  getUserByEmail: (email: string) => User | undefined;
  updateUser: (updatedUser: User) => void;
  addUser: (newUser: User) => void;
  deleteUser: (userId: number) => void;
}

// Dados iniciais de usuários
const initialUsers: User[] = [
  {
    id: 1,
    nome: 'Admin',
    email: 'admin@sistema.com',
    papeis: ['admin'],
    permissoes: ['criar_usuario', 'editar_usuario', 'excluir_usuario', 'ver_relatorios', 'editar_configuracoes', 'ver_todos_pedidos', 'editar_pedidos'],
    ativo: true
  },
  {
    id: 8,
    nome: 'Ricardo Mendes',
    email: 'ricardo@wolf.com',
    papeis: ['supervisor'],
    permissoes: ['ver_relatorios', 'ver_todos_pedidos', 'editar_pedidos'],
    ativo: true
  },
  {
    id: 9,
    nome: 'Fernanda Lima',
    email: 'fernanda@wolf.com',
    papeis: ['supervisor'],
    permissoes: ['ver_relatorios', 'ver_todos_pedidos', 'editar_pedidos'],
    ativo: true
  }
];

// Criar o contexto
const UserContext = createContext<UserContextType | undefined>(undefined);

// Props do provider
interface UserProviderProps {
  children: ReactNode;
}

// Provider
export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  // Inicializar usuários a partir do localStorage ou usar valores padrão
  const [users, setUsers] = useState<User[]>(() => {
    const storedUsers = localStorage.getItem('users');
    return storedUsers ? JSON.parse(storedUsers) : initialUsers;
  });

  // Função para obter usuário por ID
  const getUserById = (id: number): User | undefined => {
    return users.find(user => user.id === id);
  };

  // Função para obter usuário por email
  const getUserByEmail = (email: string): User | undefined => {
    return users.find(user => user.email.toLowerCase() === email.toLowerCase());
  };

  // Efeito para sincronizar usuários com o localStorage e outros armazenamentos
  useEffect(() => {
    // Usar o serviço de sincronização centralizado
    UserSyncService.syncAllUsers(users);
  }, [users]);

  // Função para adicionar um novo usuário
  const addUser = (newUser: User): void => {
    setUsers(prevUsers => [...prevUsers, newUser]);
  };

  // Função para atualizar um usuário
  const updateUser = (updatedUser: User): void => {
    // Encontrar o usuário original para obter o email antigo
    const originalUser = getUserById(updatedUser.id);
    const oldEmail = originalUser?.email;
    
    // Verificar se houve alteração de email
    if (oldEmail && oldEmail !== updatedUser.email) {
      // Usar o serviço com o email antigo para garantir sincronização correta
      UserSyncService.syncSingleUser(updatedUser, oldEmail);
      // Atualizar o userInfo se for o usuário logado
      UserSyncService.updateLoggedUser(updatedUser);
    }
    
    setUsers(prevUsers =>
      prevUsers.map(user =>
        user.id === updatedUser.id ? updatedUser : user
      )
    );
  };

  // Função para excluir um usuário
  const deleteUser = (userId: number): void => {
    setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
  };

  return (
    <UserContext.Provider value={{ users, setUsers, getUserById, getUserByEmail, updateUser, addUser, deleteUser }}>
      {children}
    </UserContext.Provider>
  );
};

// Hook para usar o contexto
export const useUsers = (): UserContextType => {
  const context = useContext(UserContext);

  if (context === undefined) {
    throw new Error('useUsers must be used within a UserProvider');
  }

  return context;
};
