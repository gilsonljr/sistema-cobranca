import React from 'react';
import { UnifiedUserProvider } from '../contexts/UnifiedUserContext';
import UnifiedNewUserPage from './UnifiedNewUserPage';

/**
 * Wrapper para a página de novo usuário que fornece o contexto unificado
 */
const UnifiedNewUserPageWrapper: React.FC = () => {
  return (
    <UnifiedUserProvider>
      <UnifiedNewUserPage />
    </UnifiedUserProvider>
  );
};

export default UnifiedNewUserPageWrapper;
