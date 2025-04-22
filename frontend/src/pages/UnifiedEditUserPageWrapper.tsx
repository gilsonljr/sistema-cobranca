import React from 'react';
import { UnifiedUserProvider } from '../contexts/UnifiedUserContext';
import UnifiedEditUserPage from './UnifiedEditUserPage';

/**
 * Wrapper para a página de edição de usuário que fornece o contexto unificado
 */
const UnifiedEditUserPageWrapper: React.FC = () => {
  return (
    <UnifiedUserProvider>
      <UnifiedEditUserPage />
    </UnifiedUserProvider>
  );
};

export default UnifiedEditUserPageWrapper;
