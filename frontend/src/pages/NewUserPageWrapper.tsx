import React from 'react';
import { UserProvider } from '../contexts/NewUserContext';
import NewUserPageNew from './NewUserPageNew';

/**
 * Wrapper para a página de novo usuário que fornece o contexto necessário
 */
const NewUserPageWrapper: React.FC = () => {
  return (
    <UserProvider>
      <NewUserPageNew />
    </UserProvider>
  );
};

export default NewUserPageWrapper;
