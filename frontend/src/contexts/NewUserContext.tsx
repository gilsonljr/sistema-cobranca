import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import UserStore, { User } from '../services/UserStore';

// Interface do contexto
interface UserContextType {
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  getUserById: (id: number) => User | undefined;
  getUserByEmail: (email: string) => User | undefined;
  addUser: (user: User) => void;
  updateUser: (user: User) => void;
  deleteUser: (userId: number) => void;
  resetToAdmin: () => void;
}

// Criar o contexto
const UserContext = createContext<UserContextType | undefined>(undefined);

// Props do provider
interface UserProviderProps {
  children: ReactNode;
}

// Provider
export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  // Estado local que reflete o UserStore
  const [users, setUsers] = useState<User[]>(() => {
    return UserStore.getUsers();
  });

  // Efeito para sincronizar mudanças no estado local com o UserStore
  useEffect(() => {
    UserStore.saveUsers(users);
  }, [users]);

  // Função para obter usuário por ID
  const getUserById = (id: number): User | undefined => {
    return UserStore.getUserById(id);
  };

  // Função para obter usuário por email
  const getUserByEmail = (email: string): User | undefined => {
    return UserStore.getUserByEmail(email);
  };

  // Função para adicionar um novo usuário
  const addUser = (newUser: User): void => {
    setUsers(prevUsers => {
      const updatedUsers = [...prevUsers];
      const existingIndex = updatedUsers.findIndex(u => u.id === newUser.id);
      if (existingIndex >= 0) {
        updatedUsers[existingIndex] = newUser;
      } else {
        updatedUsers.push(newUser);
      }
      return updatedUsers;
    });
  };

  // Função para atualizar um usuário
  const updateUser = (updatedUser: User): void => {
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

  // Função para resetar para apenas o admin
  const resetToAdmin = (): void => {
    UserStore.resetToAdmin();
    setUsers(UserStore.getUsers());
  };

  // Efeito para ouvir eventos de reset de usuários
  useEffect(() => {
    const handleUserReset = () => {
      console.log('NewUserContext: Recebido evento de reset de usuários');
      setUsers(UserStore.getUsers());
    };

    window.addEventListener('user-list-reset', handleUserReset);
    window.addEventListener('user-data-reset', handleUserReset);

    return () => {
      window.removeEventListener('user-list-reset', handleUserReset);
      window.removeEventListener('user-data-reset', handleUserReset);
    };
  }, []);

  return (
    <UserContext.Provider value={{ 
      users, 
      setUsers, 
      getUserById, 
      getUserByEmail, 
      addUser, 
      updateUser, 
      deleteUser,
      resetToAdmin
    }}>
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
