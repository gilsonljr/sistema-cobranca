import { User } from '../types/User';
import { convertToUserManagerType } from '../utils/typeAdapters';
import UserPasswordService from './UserPasswordService';

/**
 * Serviço para sincronização de usuários entre diferentes armazenamentos
 * Centraliza a lógica de sincronização para evitar inconsistências
 */
export default class UserSyncService {
  /**
   * Sincroniza todos os usuários em todos os locais de armazenamento
   * @param users Array de usuários do contexto principal
   */
  static syncAllUsers(users: User[]): void {
    try {
      // 1. Sincronizar com default_users (usado pelo emergency-fix)
      UserSyncService.syncWithDefaultUsers(users);

      // 2. Sincronizar com mockUsers (usado por algumas páginas)
      UserSyncService.syncWithMockUsers(users);

      // 3. Sincronizar senhas
      UserSyncService.syncPasswords(users);

      console.log('UserSyncService: Usuários sincronizados em todos os locais');
    } catch (error) {
      console.error('UserSyncService: Erro ao sincronizar usuários:', error);
    }
  }

  /**
   * Sincroniza um único usuário em todos os locais de armazenamento
   * Útil para atualizações pontuais
   * @param user Usuário a ser sincronizado
   * @param oldEmail Email antigo (necessário em caso de alteração de email)
   * @param password Nova senha (opcional, apenas em caso de mudança de senha)
   */
  static syncSingleUser(user: any, oldEmail?: string, password?: string): void {
    try {
      // 1. Obter todos os usuários do contexto principal
      const usersStr = localStorage.getItem('users');
      const users = usersStr ? JSON.parse(usersStr) : [];

      // 2. Atualizar ou adicionar o usuário na lista
      const index = users.findIndex((u: User) => u.id === user.id);
      if (index >= 0) {
        users[index] = user;
      } else {
        users.push(user);
      }

      // 3. Salvar a lista atualizada
      localStorage.setItem('users', JSON.stringify(users));

      // 4. Sincronizar com default_users
      UserSyncService.syncWithDefaultUsers(users, oldEmail, user, password);

      // 5. Sincronizar com mockUsers
      UserSyncService.syncWithMockUsers(users, oldEmail);

      // 6. Sincronizar senhas
      if (password) {
        // Se houver nova senha, atualizar diretamente
        UserPasswordService.setPassword(user.email, password);
      } else {
        // Caso contrário, apenas sincronizar as senhas existentes
        UserSyncService.syncPasswords(users, oldEmail);
      }

      console.log('UserSyncService: Usuário sincronizado em todos os locais:', user.email);
    } catch (error) {
      console.error('UserSyncService: Erro ao sincronizar usuário:', error);
    }
  }

  /**
   * Sincroniza com default_users no localStorage
   * @param users Lista de usuários para sincronizar
   * @param oldEmail Email antigo para remover (opcional)
   * @param specificUser Usuário específico a atualizar (opcional)
   * @param password Nova senha para o usuário específico (opcional)
   */
  private static syncWithDefaultUsers(users: User[], oldEmail?: string, specificUser?: User, password?: string): void {
    try {
      const defaultUsersStr = localStorage.getItem('default_users');
      const defaultUsers = defaultUsersStr ? JSON.parse(defaultUsersStr) : {};

      // Se houve mudança de email, remover entrada antiga
      if (oldEmail && oldEmail !== '') {
        delete defaultUsers[oldEmail];
      }

      // Se tivermos um usuário específico e uma senha específica
      if (specificUser && password) {
        // Mapear papel para role
        let role = 'user';
        if (specificUser.papeis && specificUser.papeis.includes('admin')) role = 'admin';
        else if (specificUser.papeis && specificUser.papeis.includes('supervisor')) role = 'supervisor';
        else if (specificUser.papeis && (specificUser.papeis.includes('collector') || specificUser.papeis.includes('operador'))) role = 'collector';
        else if (specificUser.papeis && (specificUser.papeis.includes('seller') || specificUser.papeis.includes('vendedor'))) role = 'seller';

        // Atualizar entrada para o usuário específico com a nova senha
        defaultUsers[specificUser.email] = {
          id: specificUser.id,
          email: specificUser.email,
          fullName: specificUser.nome,
          role: role,
          password: password
        };
      } else {
        // Atualizar entradas para todos os usuários
        users.forEach(user => {
          // Mapear papel para role
          let role = 'user';
          if (user.papeis && user.papeis.includes('admin')) role = 'admin';
          else if (user.papeis && user.papeis.includes('supervisor')) role = 'supervisor';
          else if (user.papeis && (user.papeis.includes('collector') || user.papeis.includes('operador'))) role = 'collector';
          else if (user.papeis && (user.papeis.includes('seller') || user.papeis.includes('vendedor'))) role = 'seller';

          // Manter senha existente ou usar padrão
          const existingPassword = defaultUsers[user.email]?.password || 'senha123';

          defaultUsers[user.email] = {
            id: user.id,
            email: user.email,
            fullName: user.nome,
            role: role,
            password: existingPassword
          };
        });
      }

      localStorage.setItem('default_users', JSON.stringify(defaultUsers));
    } catch (error) {
      console.error('UserSyncService: Erro ao sincronizar com default_users:', error);
    }
  }

  /**
   * Sincroniza com mockUsers no localStorage
   */
  private static syncWithMockUsers(users: User[], oldEmail?: string): void {
    try {
      // Converter para o formato mockUsers
      const mockUsers = users.map(user => {
        // Determinar perfil
        let perfil = 'Usuário';
        if (user.papeis && user.papeis.includes('admin')) perfil = 'Administrador';
        else if (user.papeis && user.papeis.includes('supervisor')) perfil = 'Supervisor';
        else if (user.papeis && (user.papeis.includes('collector') || user.papeis.includes('operador'))) perfil = 'Operador';
        else if (user.papeis && (user.papeis.includes('seller') || user.papeis.includes('vendedor'))) perfil = 'Vendedor';

        return {
          id: user.id,
          nome: user.nome,
          email: user.email,
          perfil: perfil,
          permissoes: user.permissoes,
          ativo: user.ativo
        };
      });

      localStorage.setItem('mockUsers', JSON.stringify(mockUsers));
    } catch (error) {
      console.error('UserSyncService: Erro ao sincronizar com mockUsers:', error);
    }
  }

  /**
   * Sincroniza senhas de usuários
   */
  private static syncPasswords(users: User[], oldEmail?: string): void {
    try {
      const passwordsStr = localStorage.getItem('user_passwords');
      const passwords = passwordsStr ? JSON.parse(passwordsStr) : {};

      // Se houve mudança de email, mover senha para novo email
      if (oldEmail && oldEmail !== '') {
        const oldPassword = passwords[oldEmail];
        if (oldPassword) {
          // Encontrar o usuário com o novo email
          const user = users.find(u => u.email !== oldEmail && u.email === users.find(u2 => u2.id === u.id)?.email);
          if (user) {
            passwords[user.email] = oldPassword;
            delete passwords[oldEmail];
          }
        }
      }

      // Verificar senhas nos default_users e adicioná-las se não existirem
      const defaultUsersStr = localStorage.getItem('default_users');
      if (defaultUsersStr) {
        const defaultUsers = JSON.parse(defaultUsersStr);

        users.forEach(user => {
          // Se não existe senha para este usuário, mas existe no default_users
          if (!passwords[user.email] && defaultUsers[user.email]?.password) {
            passwords[user.email] = defaultUsers[user.email].password;
          }
        });
      }

      localStorage.setItem('user_passwords', JSON.stringify(passwords));
    } catch (error) {
      console.error('UserSyncService: Erro ao sincronizar senhas de usuários:', error);
    }
  }

  /**
   * Atualiza o usuário logado (userInfo) quando necessário
   * @param user Usuário atualizado
   */
  static updateLoggedUser(user: any): void {
    try {
      const userInfoStr = localStorage.getItem('userInfo');
      if (userInfoStr) {
        const userInfo = JSON.parse(userInfoStr);

        // Se o usuário logado é o que está sendo alterado
        if (userInfo.id === user.id || userInfo.email === user.email) {
          // Mapear papel para role
          let role = 'user';
          if (user.papeis && user.papeis.includes('admin')) role = 'admin';
          else if (user.papeis && user.papeis.includes('supervisor')) role = 'supervisor';
          else if (user.papeis && (user.papeis.includes('collector') || user.papeis.includes('operador'))) role = 'collector';
          else if (user.papeis && (user.papeis.includes('seller') || user.papeis.includes('vendedor'))) role = 'seller';

          const updatedUserInfo = {
            id: user.id,
            email: user.email,
            fullName: user.nome,
            role: role
          };

          localStorage.setItem('userInfo', JSON.stringify(updatedUserInfo));
          console.log('UserSyncService: Usuário logado atualizado');
        }
      }
    } catch (error) {
      console.error('UserSyncService: Erro ao atualizar usuário logado:', error);
    }
  }
}