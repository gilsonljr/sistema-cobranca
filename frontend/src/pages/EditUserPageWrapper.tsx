import React from 'react';
import { UserProvider } from '../contexts/NewUserContext';
import EditUserPageNew from './EditUserPageNew';

/**
 * Wrapper para a página de edição de usuário que fornece o contexto necessário
 */
const EditUserPageWrapper: React.FC = () => {
  return (
    <UserProvider>
      <EditUserPageNew />
    </UserProvider>
  );
};

export default EditUserPageWrapper;
