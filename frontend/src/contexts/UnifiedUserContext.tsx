import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import UserManager, { User } from '../services/UserManager';

// Interface do contexto
interface UserContextType {
  users: User[];
  loading: boolean;
  error: string | null;
  getUserById: (id: number) => User | undefined;
  getUserByEmail: (email: string) => User | undefined;
  addUser: (user: User, password?: string) => User | undefined;
  updateUser: (user: User, password?: string) => User | undefined;
  deleteUser: (userId: number) => boolean;
  resetToAdmin: () => void;
}

// Criar o contexto
const UnifiedUserContext = createContext<UserContextType | undefined>(undefined);

// Props do provider
interface UnifiedUserProviderProps {
  children: ReactNode;
}

// Provider
export const UnifiedUserProvider: React.FC<UnifiedUserProviderProps> = ({ children }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Inicializar o contexto
  useEffect(() => {
    try {
      // Inicializar o UserManager se ainda não estiver inicializado
      UserManager.initialize();

      const loadedUsers = UserManager.getUsers();
      setUsers(loadedUsers);
      setLoading(false);
    } catch (err) {
      console.error('Error initializing user context:', err);
      setError('Failed to load users. Please refresh the page.');
      setLoading(false);
    }
  }, []);

  // Ouvir eventos de usuário
  useEffect(() => {
    const handleUserEvent = (event: Event) => {
      try {
        const loadedUsers = UserManager.getUsers();
        setUsers(loadedUsers);
      } catch (err) {
        console.error('Error handling user event:', err);
        setError('Failed to update users. Please refresh the page.');
      }
    };

    // Ouvir eventos de usuário do UserManager
    window.addEventListener('user-event', handleUserEvent);
    return () => window.removeEventListener('user-event', handleUserEvent);
  }, []);

  const getUserById = (id: number): User | undefined => {
    return UserManager.getUserById(id);
  };

  const getUserByEmail = (email: string): User | undefined => {
    return UserManager.getUserByEmail(email);
  };

  const addUser = (user: User, password?: string): User | undefined => {
    try {
      setLoading(true);
      setError(null);
      return UserManager.addUser(user, password);
    } catch (err: any) {
      setError(err?.message || 'Failed to add user');
      return undefined;
    } finally {
      setLoading(false);
    }
  };

  const updateUser = (user: User, password?: string): User | undefined => {
    try {
      setLoading(true);
      setError(null);
      return UserManager.updateUser(user, password);
    } catch (err: any) {
      setError(err?.message || 'Failed to update user');
      return undefined;
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = (userId: number): boolean => {
    try {
      setLoading(true);
      setError(null);
      return UserManager.deleteUser(userId);
    } catch (err: any) {
      setError(err?.message || 'Failed to delete user');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const resetToAdmin = (): void => {
    try {
      setLoading(true);
      setError(null);
      UserManager.resetToAdmin();
      setUsers(UserManager.getUsers());
    } catch (err: any) {
      setError(err?.message || 'Failed to reset users');
    } finally {
      setLoading(false);
    }
  };

  return (
    <UnifiedUserContext.Provider value={{
      users,
      loading,
      error,
      getUserById,
      getUserByEmail,
      addUser,
      updateUser,
      deleteUser,
      resetToAdmin
    }}>
      {children}
    </UnifiedUserContext.Provider>
  );
};

// Hook para usar o contexto
export const useUnifiedUsers = (): UserContextType => {
  const context = useContext(UnifiedUserContext);
  if (context === undefined) {
    throw new Error('useUnifiedUsers must be used within a UnifiedUserProvider');
  }
  return context;
};

// Manter o hook antigo para compatibilidade
export const useUsers = useUnifiedUsers;
