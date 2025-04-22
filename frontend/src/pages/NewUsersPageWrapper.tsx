import React from 'react';
import { UserProvider } from '../contexts/NewUserContext';
import NewUsersPage from './NewUsersPage';

/**
 * Wrapper para a página de usuários que fornece o contexto necessário
 */
const NewUsersPageWrapper: React.FC = () => {
  return (
    <UserProvider>
      <NewUsersPage />
    </UserProvider>
  );
};

export default NewUsersPageWrapper;
