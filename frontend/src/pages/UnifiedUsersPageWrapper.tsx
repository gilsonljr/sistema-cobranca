import React from 'react';
import { UnifiedUserProvider } from '../contexts/UnifiedUserContext';
import UnifiedUsersPage from './UnifiedUsersPage';

/**
 * Wrapper para a página de usuários que fornece o contexto unificado
 */
const UnifiedUsersPageWrapper: React.FC = () => {
  return (
    <UnifiedUserProvider>
      <UnifiedUsersPage />
    </UnifiedUserProvider>
  );
};

export default UnifiedUsersPageWrapper;
