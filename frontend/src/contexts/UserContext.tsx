import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, UserInput, UserRole } from '../types/User';
import UserStore, { UserError } from '../services/UserStore';
import AuthService from '../services/AuthService';

// Re-export the User type
export type { User };

interface UserContextType {
  users: User[];
  currentUser: User | null;
  loading: boolean;
  error: string | null;
  addUser: (userInput: UserInput) => Promise<User>;
  updateUser: (userId: number, userInput: UserInput) => Promise<User> | Promise<User>;
  deleteUser: (userId: number) => Promise<void>;
  resetToAdmin: () => Promise<void>;
  hasRole: (role: UserRole | UserRole[]) => boolean;
  isAdmin: () => boolean;
  isSupervisor: () => boolean;
  isCollector: () => boolean;
  isSeller: () => boolean;
  getUserById: (id: number) => User | undefined;
  getUserByEmail?: (email: string) => User | undefined;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const userStore = UserStore.getInstance();

    // Load initial data
    setUsers(userStore.getUsers());
    setCurrentUser(AuthService.getCurrentUser());
    setLoading(false);

    // Set up event listeners
    const handleUsersUpdated = (updatedUsers: User[]) => {
      setUsers(updatedUsers);
    };

    userStore.addEventListener(handleUsersUpdated);

    return () => {
      userStore.removeEventListener(handleUsersUpdated);
    };
  }, []);

  const addUser = async (userInput: UserInput): Promise<User> => {
    try {
      setLoading(true);
      setError(null);
      const userStore = UserStore.getInstance();
      const newUser = userStore.addUser(userInput);
      return newUser;
    } catch (error) {
      setError(error instanceof UserError ? error.message : 'Failed to add user');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateUser = async (userId: number, userInput: UserInput): Promise<User> => {
    try {
      setLoading(true);
      setError(null);
      const userStore = UserStore.getInstance();
      const updatedUser = userStore.updateUser(userId, userInput);
      return updatedUser;
    } catch (error) {
      setError(error instanceof UserError ? error.message : 'Failed to update user');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (userId: number): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      const userStore = UserStore.getInstance();
      userStore.deleteUser(userId);
    } catch (error) {
      setError(error instanceof UserError ? error.message : 'Failed to delete user');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const resetToAdmin = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      const userStore = UserStore.getInstance();
      userStore.resetToAdmin();
    } catch (error) {
      setError(error instanceof UserError ? error.message : 'Failed to reset to admin');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const hasRole = (role: UserRole | UserRole[]): boolean => {
    return AuthService.hasRole(role);
  };

  const isAdmin = (): boolean => {
    return AuthService.isAdmin();
  };

  const isSupervisor = (): boolean => {
    return AuthService.isSupervisor();
  };

  const isCollector = (): boolean => {
    return AuthService.isCollector();
  };

  const isSeller = (): boolean => {
    return AuthService.isSeller();
  };

  const getUserById = (id: number): User | undefined => {
    return users.find(user => user.id === id);
  };

  const getUserByEmail = (email: string): User | undefined => {
    return users.find(user => user.email.toLowerCase() === email.toLowerCase());
  };

  const value = {
    users,
    currentUser,
    loading,
    error,
    addUser,
    updateUser,
    deleteUser,
    resetToAdmin,
    hasRole,
    isAdmin,
    isSupervisor,
    isCollector,
    isSeller,
    getUserById,
    getUserByEmail
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUsers = (): UserContextType => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUsers must be used within a UserProvider');
  }
  return context;
};
