import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import AuthService from '../services/AuthService';

interface AuthCheckProps {
  children: React.ReactNode;
}

const AuthCheck: React.FC<AuthCheckProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    // Verificar se o usuário está autenticado
    const checkAuth = () => {
      const isAuth = AuthService.isAuthenticated();
      console.log('AuthCheck - Verificando autenticação:', isAuth);
      setIsAuthenticated(isAuth);
    };

    checkAuth();
  }, []);

  // Enquanto estamos verificando, não renderizamos nada
  if (isAuthenticated === null) {
    return null;
  }

  // Se o usuário não estiver autenticado, redirecionamos para a página de login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Se o usuário estiver autenticado, renderizamos os filhos
  return <>{children}</>;
};

export default AuthCheck;
