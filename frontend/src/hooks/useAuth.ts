import { useState, useEffect } from 'react';
import UnifiedAuthService, { UserInfo } from '../services/UnifiedAuthService';

export const useAuth = () => {
  const [user, setUser] = useState<UserInfo | null>(UnifiedAuthService.getUserInfo());
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(UnifiedAuthService.isAuthenticated());
  
  useEffect(() => {
    // Function to update user state
    const updateUserState = () => {
      const userInfo = UnifiedAuthService.getUserInfo();
      setUser(userInfo);
      setIsAuthenticated(UnifiedAuthService.isAuthenticated());
    };
    
    // Listen for login and logout events
    const handleUserLogin = () => updateUserState();
    const handleUserLogout = () => updateUserState();
    
    window.addEventListener('user-login', handleUserLogin);
    window.addEventListener('user-logout', handleUserLogout);
    
    return () => {
      window.removeEventListener('user-login', handleUserLogin);
      window.removeEventListener('user-logout', handleUserLogout);
    };
  }, []);
  
  // Function to log in
  const login = async (email: string, password: string) => {
    try {
      await UnifiedAuthService.login({ email, password });
      setUser(UnifiedAuthService.getUserInfo());
      setIsAuthenticated(true);
      return true;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    }
  };
  
  // Function to log out
  const logout = () => {
    UnifiedAuthService.logout();
    setUser(null);
    setIsAuthenticated(false);
  };
  
  return {
    user,
    isAuthenticated,
    login,
    logout
  };
};

export default useAuth; 