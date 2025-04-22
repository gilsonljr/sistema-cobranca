import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import UnifiedAuthService, { UserInfo } from '../services/UnifiedAuthService';

interface AuthContextType {
  isAuthenticated: boolean;
  userInfo: UserInfo | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAdmin: () => boolean;
  isSupervisor: () => boolean;
  isCollector: () => boolean;
  isSeller: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

  useEffect(() => {
    // Check authentication status on mount
    const checkAuth = async () => {
      const isAuth = UnifiedAuthService.isAuthenticated();
      setIsAuthenticated(isAuth);

      if (isAuth) {
        const user = UnifiedAuthService.getUserInfo();
        setUserInfo(user);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    await UnifiedAuthService.login({ email, password });
    setIsAuthenticated(true);
    const user = UnifiedAuthService.getUserInfo();
    setUserInfo(user);
  };

  const logout = () => {
    UnifiedAuthService.logout();
    setIsAuthenticated(false);
    setUserInfo(null);
  };

  // Helper functions to check user roles
  const isAdmin = () => {
    const user = UnifiedAuthService.getUserInfo();
    return user?.role === 'admin';
  };

  const isSupervisor = () => {
    const user = UnifiedAuthService.getUserInfo();
    return user?.role === 'supervisor';
  };

  const isCollector = () => {
    const user = UnifiedAuthService.getUserInfo();
    return user?.role === 'collector';
  };

  const isSeller = () => {
    const user = UnifiedAuthService.getUserInfo();
    return user?.role === 'seller';
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        userInfo,
        login,
        logout,
        isAdmin,
        isSupervisor,
        isCollector,
        isSeller
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};