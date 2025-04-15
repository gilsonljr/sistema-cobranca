import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AuthService, { UserInfo } from '../services/AuthService';

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
      const isAuth = AuthService.isAuthenticated();
      setIsAuthenticated(isAuth);

      if (isAuth) {
        const user = AuthService.getUserInfo();
        setUserInfo(user);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    await AuthService.login({ email, password });
    setIsAuthenticated(true);
    const user = AuthService.getUserInfo();
    setUserInfo(user);
  };

  const logout = () => {
    AuthService.logout();
    setIsAuthenticated(false);
    setUserInfo(null);
  };

  const isAdmin = () => AuthService.isAdmin();
  const isSupervisor = () => AuthService.isSupervisor();
  const isCollector = () => AuthService.isCollector();
  const isSeller = () => AuthService.isSeller();

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