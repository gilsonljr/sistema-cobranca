/**
 * UserManager - Serviço centralizado para gerenciamento de usuários
 *
 * Este serviço atua como a única fonte de verdade para todos os dados de usuários
 * no sistema, garantindo consistência em todas as partes da aplicação.
 */

// Interfaces
export interface User {
  id: number;
  nome: string;
  email: string;
  papeis: string[];
  permissoes: string[];
  ativo: boolean;
}

export interface UserCredentials {
  email: string;
  password: string;
}

export interface UserWithPassword extends User {
  password: string;
}

// Tipos de eventos
export type UserEventType = 'create' | 'update' | 'delete' | 'reset';

// Interface para eventos de usuário
export interface UserEvent {
  type: UserEventType;
  user?: User;
  users?: User[];
}

// Classe singleton para gerenciar usuários
class UserManager {
  // Chaves de armazenamento
  private readonly USERS_KEY = 'unified_users';
  private readonly PASSWORDS_KEY = 'unified_passwords';

  // Usuário admin padrão
  private readonly DEFAULT_ADMIN: User = {
    id: 1,
    nome: 'Admin',
    email: 'admin@sistema.com',
    papeis: ['admin'],
    permissoes: [
      'criar_usuario',
      'editar_usuario',
      'excluir_usuario',
      'ver_relatorios',
      'editar_configuracoes',
      'ver_todos_pedidos',
      'editar_pedidos'
    ],
    ativo: true
  };

  // Senha padrão do admin
  private readonly DEFAULT_ADMIN_PASSWORD = 'admin123';

  // Instância singleton
  private static instance: UserManager;

  // Obter a instância singleton
  public static getInstance(): UserManager {
    if (!UserManager.instance) {
      UserManager.instance = new UserManager();
    }
    return UserManager.instance;
  }

  // Construtor privado
  private constructor() {
    this.initialize();
  }

  /**
   * Inicializa o gerenciador de usuários
   * Garante que exista pelo menos o usuário admin
   */
  public initialize(): void {
    console.log('UserManager: Inicializando...');

    try {
      // Verificar se já existem usuários
      const users = this.getUsers();

      // Se não houver usuários ou não houver admin, adicionar admin padrão
      if (users.length === 0 || !users.some(u => u.email === 'admin@sistema.com')) {
        console.log('UserManager: Nenhum usuário ou admin encontrado, adicionando admin padrão');

        // Se não houver usuários, inicializar com apenas o admin
        if (users.length === 0) {
          this.saveUsers([this.DEFAULT_ADMIN]);
        } else {
          // Se houver usuários mas não houver admin, adicionar admin
          users.push(this.DEFAULT_ADMIN);
          this.saveUsers(users);
        }

        // Definir senha do admin
        this.setPassword('admin@sistema.com', this.DEFAULT_ADMIN_PASSWORD);
      }

      // Sincronizar com armazenamentos legados para compatibilidade
      this.syncWithLegacyStorages();

      console.log('UserManager: Inicialização concluída');
    } catch (error) {
      console.error('UserManager: Erro ao inicializar', error);

      // Em caso de erro, resetar para o estado padrão
      this.resetToAdmin();
    }
  }

  /**
   * Obtém todos os usuários
   */
  public getUsers(): User[] {
    try {
      const usersJson = localStorage.getItem(this.USERS_KEY);
      return usersJson ? JSON.parse(usersJson) : [];
    } catch (error) {
      console.error('UserManager: Erro ao obter usuários', error);
      return [];
    }
  }

  /**
   * Salva a lista de usuários
   */
  public saveUsers(users: User[]): void {
    try {
      localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
      this.syncWithLegacyStorages();
      this.dispatchUserEvent('update', undefined, users);
    } catch (error) {
      console.error('UserManager: Erro ao salvar usuários', error);
    }
  }

  /**
   * Obtém um usuário por ID
   */
  public getUserById(id: number): User | undefined {
    return this.getUsers().find(user => user.id === id);
  }

  /**
   * Obtém um usuário por email
   */
  public getUserByEmail(email: string): User | undefined {
    const emailLower = email.toLowerCase();
    return this.getUsers().find(user => user.email.toLowerCase() === emailLower);
  }

  /**
   * Adiciona um novo usuário
   * @returns O usuário adicionado ou undefined se falhar
   */
  public addUser(user: User, password?: string): User | undefined {
    try {
      // Verificar se o email já existe
      const existingUser = this.getUserByEmail(user.email);
      if (existingUser) {
        console.error(`UserManager: Usuário com email ${user.email} já existe`);
        return undefined;
      }

      // Obter todos os usuários
      const users = this.getUsers();

      // Adicionar o novo usuário
      users.push(user);

      // Salvar usuários
      this.saveUsers(users);

      // Se uma senha foi fornecida, salvá-la
      if (password) {
        this.setPassword(user.email, password);
      }

      // Disparar evento de criação
      this.dispatchUserEvent('create', user);

      console.log(`UserManager: Usuário ${user.nome} (${user.email}) adicionado com sucesso`);
      return user;
    } catch (error) {
      console.error('UserManager: Erro ao adicionar usuário', error);
      return undefined;
    }
  }

  /**
   * Atualiza um usuário existente
   * @returns O usuário atualizado ou undefined se falhar
   */
  public updateUser(user: User, password?: string): User | undefined {
    try {
      // Obter todos os usuários
      const users = this.getUsers();

      // Encontrar o índice do usuário
      const index = users.findIndex(u => u.id === user.id);

      // Se o usuário não for encontrado, retornar undefined
      if (index === -1) {
        console.error(`UserManager: Usuário com ID ${user.id} não encontrado para atualização`);
        return undefined;
      }

      // Verificar se o email está sendo alterado
      const oldEmail = users[index].email;
      const newEmail = user.email;

      // Se o email estiver sendo alterado, verificar se o novo email já existe
      if (oldEmail.toLowerCase() !== newEmail.toLowerCase()) {
        const existingUser = this.getUserByEmail(newEmail);
        if (existingUser && existingUser.id !== user.id) {
          console.error(`UserManager: Não é possível atualizar o usuário. Email ${newEmail} já está em uso`);
          return undefined;
        }
      }

      // Atualizar o usuário
      users[index] = user;

      // Salvar usuários
      this.saveUsers(users);

      // Se uma senha foi fornecida, salvá-la
      if (password) {
        this.setPassword(user.email, password);

        // Se o email foi alterado, remover a senha antiga
        if (oldEmail.toLowerCase() !== newEmail.toLowerCase()) {
          this.removePassword(oldEmail);
        }
      } else if (oldEmail.toLowerCase() !== newEmail.toLowerCase()) {
        // Se o email foi alterado mas não foi fornecida uma nova senha,
        // mover a senha antiga para o novo email
        this.movePassword(oldEmail, newEmail);
      }

      // Disparar evento de atualização
      this.dispatchUserEvent('update', user);

      console.log(`UserManager: Usuário ${user.nome} (${user.email}) atualizado com sucesso`);
      return user;
    } catch (error) {
      console.error('UserManager: Erro ao atualizar usuário', error);
      return undefined;
    }
  }

  /**
   * Exclui um usuário
   * @returns true se o usuário foi excluído, false caso contrário
   */
  public deleteUser(userId: number): boolean {
    try {
      // Obter todos os usuários
      const users = this.getUsers();

      // Encontrar o usuário
      const user = users.find(u => u.id === userId);

      // Se o usuário não for encontrado, retornar false
      if (!user) {
        console.error(`UserManager: Usuário com ID ${userId} não encontrado para exclusão`);
        return false;
      }

      // Verificar se é o admin
      if (user.email.toLowerCase() === 'admin@sistema.com') {
        console.error('UserManager: Não é possível excluir o usuário admin');
        return false;
      }

      // Filtrar o usuário
      const filteredUsers = users.filter(u => u.id !== userId);

      // Salvar usuários
      this.saveUsers(filteredUsers);

      // Remover senha
      this.removePassword(user.email);

      // Disparar evento de exclusão
      this.dispatchUserEvent('delete', user);

      console.log(`UserManager: Usuário ${user.nome} (${user.email}) excluído com sucesso`);
      return true;
    } catch (error) {
      console.error('UserManager: Erro ao excluir usuário', error);
      return false;
    }
  }

  /**
   * Define a senha de um usuário
   * Usa um hash simples para não armazenar a senha em texto puro
   */
  public setPassword(email: string, password: string): void {
    try {
      const emailLower = email.toLowerCase();

      // Obter senhas atuais
      const passwordsJson = localStorage.getItem(this.PASSWORDS_KEY);
      const passwords = passwordsJson ? JSON.parse(passwordsJson) : {};

      // Criar um hash simples da senha
      // Em um sistema real, usaríamos bcrypt ou outro algoritmo seguro
      const hashedPassword = this.hashPassword(password);

      // Definir nova senha
      passwords[emailLower] = hashedPassword;

      // Salvar senhas
      localStorage.setItem(this.PASSWORDS_KEY, JSON.stringify(passwords));

      console.log(`UserManager: Senha definida para ${emailLower}`);
    } catch (error) {
      console.error('UserManager: Erro ao definir senha', error);
    }
  }

  /**
   * Cria um hash simples da senha
   * Nota: Este não é um método seguro para produção, apenas para demonstração
   */
  private hashPassword(password: string): string {
    // Em um sistema real, usaríamos bcrypt ou outro algoritmo seguro
    // Este é apenas um hash simples para demonstração
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
      const char = password.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Converter para inteiro de 32 bits
    }

    // Adicionar um prefixo para identificar que é um hash
    return `HASH_${hash}_${password.length}_${Date.now() % 1000}`;
  }

  /**
   * Remove a senha de um usuário
   */
  private removePassword(email: string): void {
    try {
      const emailLower = email.toLowerCase();

      // Obter senhas atuais
      const passwordsJson = localStorage.getItem(this.PASSWORDS_KEY);
      const passwords = passwordsJson ? JSON.parse(passwordsJson) : {};

      // Remover senha
      delete passwords[emailLower];

      // Salvar senhas
      localStorage.setItem(this.PASSWORDS_KEY, JSON.stringify(passwords));

      console.log(`UserManager: Senha removida para ${emailLower}`);
    } catch (error) {
      console.error('UserManager: Erro ao remover senha', error);
    }
  }

  /**
   * Move a senha de um email para outro
   */
  private movePassword(oldEmail: string, newEmail: string): void {
    try {
      const oldEmailLower = oldEmail.toLowerCase();
      const newEmailLower = newEmail.toLowerCase();

      // Obter senhas atuais
      const passwordsJson = localStorage.getItem(this.PASSWORDS_KEY);
      const passwords = passwordsJson ? JSON.parse(passwordsJson) : {};

      // Se não houver senha para o email antigo, não fazer nada
      if (!passwords[oldEmailLower]) {
        return;
      }

      // Mover senha
      passwords[newEmailLower] = passwords[oldEmailLower];
      delete passwords[oldEmailLower];

      // Salvar senhas
      localStorage.setItem(this.PASSWORDS_KEY, JSON.stringify(passwords));

      console.log(`UserManager: Senha movida de ${oldEmailLower} para ${newEmailLower}`);
    } catch (error) {
      console.error('UserManager: Erro ao mover senha', error);
    }
  }

  /**
   * Verifica se a senha de um usuário está correta
   */
  public verifyPassword(email: string, password: string): boolean {
    try {
      const emailLower = email.toLowerCase();

      // Obter senhas
      const passwordsJson = localStorage.getItem(this.PASSWORDS_KEY);
      const passwords = passwordsJson ? JSON.parse(passwordsJson) : {};

      // Verificar se existe uma senha para este email
      if (!passwords[emailLower]) {
        console.log(`UserManager: Nenhuma senha encontrada para ${emailLower}`);

        // Verificar senhas padrão
        return this.verifyDefaultPassword(emailLower, password);
      }

      const storedPassword = passwords[emailLower];

      // Verificar se a senha está em formato de hash
      if (storedPassword.startsWith('HASH_')) {
        // Extrair partes do hash
        const parts = storedPassword.split('_');
        if (parts.length < 3) {
          console.error(`UserManager: Formato de hash inválido para ${emailLower}`);
          return false;
        }

        // Obter o hash esperado e o comprimento da senha
        const expectedHash = parseInt(parts[1], 10);
        const passwordLength = parseInt(parts[2], 10);

        // Verificar se o comprimento da senha corresponde
        if (password.length !== passwordLength) {
          return false;
        }

        // Calcular o hash da senha fornecida
        let hash = 0;
        for (let i = 0; i < password.length; i++) {
          const char = password.charCodeAt(i);
          hash = ((hash << 5) - hash) + char;
          hash = hash & hash; // Converter para inteiro de 32 bits
        }

        // Verificar se os hashes correspondem
        const isCorrect = hash === expectedHash;
        console.log(`UserManager: Verificação de senha para ${emailLower}: ${isCorrect ? 'correta' : 'incorreta'}`);
        return isCorrect;
      } else {
        // Compatibilidade com senhas antigas (texto puro)
        const isCorrect = storedPassword === password;

        // Se a senha estiver correta, atualizar para o novo formato de hash
        if (isCorrect) {
          console.log(`UserManager: Atualizando senha de ${emailLower} para o novo formato de hash`);
          this.setPassword(emailLower, password);
        }

        console.log(`UserManager: Verificação de senha (formato antigo) para ${emailLower}: ${isCorrect ? 'correta' : 'incorreta'}`);
        return isCorrect;
      }
    } catch (error) {
      console.error('UserManager: Erro ao verificar senha', error);
      return false;
    }
  }

  /**
   * Verifica se a senha fornecida corresponde à senha padrão para o usuário
   */
  private verifyDefaultPassword(email: string, password: string): boolean {
    const emailLower = email.toLowerCase();

    // Admin
    if (emailLower === 'admin@sistema.com') {
      return password === 'admin123';
    }

    // Supervisor
    if (emailLower === 'supervisor@sistema.com') {
      return password === 'supervisor123';
    }

    // Operadores conhecidos
    const knownOperators = [
      'operador@sistema.com',
      'joao@wolf.com',
      'ana@wolf.com',
      'ludimila@wolf.com',
      'carlos@wolf.com',
      'pedro@wolf.com'
    ];

    if (knownOperators.includes(emailLower)) {
      return password === 'operador123';
    }

    // Vendedores conhecidos
    const knownSellers = [
      'vendedor@sistema.com',
      'maria@wolf.com'
    ];

    if (knownSellers.includes(emailLower)) {
      return password === 'vendedor123';
    }

    // Verificar pelo domínio do email
    if (emailLower.endsWith('@wolf.com')) {
      // Assumir que novos emails @wolf.com são operadores por padrão
      console.log(`UserManager: Usuário ${emailLower} não reconhecido, mas é do domínio wolf.com. Tentando senha padrão de operador.`);
      return password === 'operador123';
    }

    return false;
  }

  /**
   * Obtém um usuário com sua senha
   */
  public getUserWithPassword(userId: number): UserWithPassword | undefined {
    // Obter usuário
    const user = this.getUserById(userId);
    if (!user) {
      return undefined;
    }

    // Obter senha
    const passwordsJson = localStorage.getItem(this.PASSWORDS_KEY);
    const passwords = passwordsJson ? JSON.parse(passwordsJson) : {};
    const password = passwords[user.email.toLowerCase()] || '';

    // Retornar usuário com senha
    return {
      ...user,
      password
    };
  }

  /**
   * Reseta para apenas o usuário admin
   */
  public resetToAdmin(): void {
    try {
      // Salvar apenas o admin
      this.saveUsers([this.DEFAULT_ADMIN]);

      // Definir senha do admin
      this.setPassword('admin@sistema.com', this.DEFAULT_ADMIN_PASSWORD);

      // Limpar todas as outras senhas
      const passwordsJson = localStorage.getItem(this.PASSWORDS_KEY);
      const passwords = passwordsJson ? JSON.parse(passwordsJson) : {};

      // Manter apenas a senha do admin
      const adminPasswords: Record<string, string> = {
        'admin@sistema.com': this.DEFAULT_ADMIN_PASSWORD
      };

      localStorage.setItem(this.PASSWORDS_KEY, JSON.stringify(adminPasswords));

      // Sincronizar com armazenamentos legados
      this.syncWithLegacyStorages();

      // Disparar evento de reset
      this.dispatchUserEvent('reset', undefined, [this.DEFAULT_ADMIN]);

      console.log('UserManager: Sistema resetado para apenas o admin');
    } catch (error) {
      console.error('UserManager: Erro ao resetar para admin', error);
    }
  }

  /**
   * Sincroniza com armazenamentos legados para compatibilidade
   */
  private syncWithLegacyStorages(): void {
    try {
      const users = this.getUsers();

      // 1. Sincronizar com 'users' (armazenamento antigo)
      localStorage.setItem('users', JSON.stringify(users));

      // 2. Sincronizar com 'default_users'
      const defaultUsers: Record<string, any> = {};

      // Obter senhas
      const passwordsJson = localStorage.getItem(this.PASSWORDS_KEY);
      const passwords = passwordsJson ? JSON.parse(passwordsJson) : {};

      users.forEach(user => {
        // Mapear papel para role
        let role = 'user';
        if (user.papeis.includes('admin')) role = 'admin';
        else if (user.papeis.includes('supervisor')) role = 'supervisor';
        else if (user.papeis.includes('collector') || user.papeis.includes('operador')) role = 'collector';
        else if (user.papeis.includes('seller') || user.papeis.includes('vendedor')) role = 'seller';

        // Obter senha ou usar padrão
        const emailLower = user.email.toLowerCase();
        const password = passwords[emailLower] || 'senha123';

        defaultUsers[emailLower] = {
          id: user.id,
          email: emailLower,
          fullName: user.nome,
          role: role,
          password: password
        };
      });

      localStorage.setItem('default_users', JSON.stringify(defaultUsers));

      // 3. Sincronizar com 'mockUsers'
      const mockUsers = users.map(user => {
        // Determinar perfil
        let perfil = 'Usuário';
        if (user.papeis.includes('admin')) perfil = 'Administrador';
        else if (user.papeis.includes('supervisor')) perfil = 'Supervisor';
        else if (user.papeis.includes('collector') || user.papeis.includes('operador')) perfil = 'Operador';
        else if (user.papeis.includes('seller') || user.papeis.includes('vendedor')) perfil = 'Vendedor';

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

      // 4. Sincronizar com 'user_passwords'
      localStorage.setItem('user_passwords', JSON.stringify(passwords));

      // 5. Sincronizar com 'system_users' (UserStore)
      localStorage.setItem('system_users', JSON.stringify(users));

      console.log('UserManager: Sincronizado com armazenamentos legados');
    } catch (error) {
      console.error('UserManager: Erro ao sincronizar com armazenamentos legados', error);
    }
  }

  /**
   * Migra dados de armazenamentos legados
   */
  public migrateFromLegacyStorages(): void {
    try {
      console.log('UserManager: Iniciando migração de dados legados...');

      // Verificar se já existem usuários no armazenamento unificado
      const existingUsers = this.getUsers();
      if (existingUsers.length > 0) {
        console.log(`UserManager: Já existem ${existingUsers.length} usuários no armazenamento unificado. Pulando migração.`);
        return;
      }

      // Fontes de dados possíveis em ordem de prioridade
      const sources = [
        'system_users',  // UserStore (mais recente)
        'users',         // Armazenamento antigo
        'mockUsers'      // Usado para UI
      ];

      let usersToMigrate: User[] = [];
      let sourceUsed = '';

      // Tentar cada fonte até encontrar usuários
      for (const source of sources) {
        const sourceData = localStorage.getItem(source);
        if (sourceData) {
          const parsedData = JSON.parse(sourceData);

          // Verificar se há dados
          if (Array.isArray(parsedData) && parsedData.length > 0) {
            console.log(`UserManager: Encontrados ${parsedData.length} usuários em '${source}'`);

            // Converter para o formato User
            if (source === 'mockUsers') {
              // Converter de mockUsers para User
              usersToMigrate = parsedData.map((mockUser: any) => {
                // Mapear perfil para papeis
                let papeis: string[] = [];
                if (mockUser.perfil === 'Administrador') papeis = ['admin'];
                else if (mockUser.perfil === 'Supervisor') papeis = ['supervisor'];
                else if (mockUser.perfil === 'Operador') papeis = ['operador'];
                else if (mockUser.perfil === 'Vendedor') papeis = ['vendedor'];
                else papeis = ['user'];

                return {
                  id: mockUser.id,
                  nome: mockUser.nome,
                  email: mockUser.email,
                  papeis: papeis,
                  permissoes: mockUser.permissoes || [],
                  ativo: mockUser.ativo !== undefined ? mockUser.ativo : true
                };
              });
            } else {
              // system_users e users já estão no formato User
              usersToMigrate = parsedData;
            }

            sourceUsed = source;
            break;
          }
        }
      }

      // Se não encontrou usuários em nenhuma fonte, usar admin padrão
      if (usersToMigrate.length === 0) {
        console.log('UserManager: Nenhum usuário encontrado em fontes legadas. Usando admin padrão.');
        usersToMigrate = [this.DEFAULT_ADMIN];
        sourceUsed = 'default';
      }

      // Migrar senhas
      const passwordSources = [
        'user_passwords',  // Armazenamento de senhas
        'default_users'    // Usado para autenticação
      ];

      let passwords: Record<string, string> = {};
      let passwordSourceUsed = '';

      // Tentar cada fonte de senhas
      for (const source of passwordSources) {
        const sourceData = localStorage.getItem(source);
        if (sourceData) {
          const parsedData = JSON.parse(sourceData);

          // Verificar se há dados
          if (parsedData && Object.keys(parsedData).length > 0) {
            console.log(`UserManager: Encontradas senhas em '${source}'`);

            if (source === 'default_users') {
              // Extrair senhas de default_users
              Object.entries(parsedData).forEach(([email, userData]: [string, any]) => {
                if (userData.password) {
                  passwords[email.toLowerCase()] = userData.password;
                }
              });
            } else {
              // user_passwords já está no formato correto
              passwords = parsedData;
            }

            passwordSourceUsed = source;
            break;
          }
        }
      }

      // Se não encontrou senhas, usar senhas padrão
      if (Object.keys(passwords).length === 0) {
        console.log('UserManager: Nenhuma senha encontrada em fontes legadas. Usando senhas padrão.');
        passwords = {
          'admin@sistema.com': this.DEFAULT_ADMIN_PASSWORD
        };
        passwordSourceUsed = 'default';
      }

      // Salvar usuários migrados
      this.saveUsers(usersToMigrate);

      // Salvar senhas migradas
      localStorage.setItem(this.PASSWORDS_KEY, JSON.stringify(passwords));

      console.log(`UserManager: Migração concluída. ${usersToMigrate.length} usuários migrados de '${sourceUsed}' e senhas de '${passwordSourceUsed}'`);

      // Sincronizar com armazenamentos legados para garantir consistência
      this.syncWithLegacyStorages();

      // Disparar evento de reset
      this.dispatchUserEvent('reset', undefined, usersToMigrate);
    } catch (error) {
      console.error('UserManager: Erro ao migrar de armazenamentos legados', error);

      // Em caso de erro, resetar para o estado padrão
      this.resetToAdmin();
    }
  }

  /**
   * Dispara um evento de usuário
   */
  private dispatchUserEvent(type: UserEventType, user?: User, users?: User[]): void {
    try {
      // Criar evento
      const event = new CustomEvent('user-event', {
        detail: { type, user, users } as UserEvent
      });

      // Disparar evento
      window.dispatchEvent(event);

      // Disparar eventos legados para compatibilidade
      if (type === 'reset') {
        window.dispatchEvent(new CustomEvent('user-list-reset'));
        window.dispatchEvent(new CustomEvent('user-data-reset', {
          detail: { users: users || [] }
        }));
      }
    } catch (error) {
      console.error('UserManager: Erro ao disparar evento', error);
    }
  }

  /**
   * Obtém o próximo ID disponível para um novo usuário
   */
  public getNextUserId(): number {
    const users = this.getUsers();

    if (users.length === 0) {
      return 1;
    }

    // Encontrar o maior ID
    const maxId = Math.max(...users.map(user => user.id));

    // Retornar o próximo ID
    return maxId + 1;
  }

  /**
   * Mapeia um papel para um perfil legível
   */
  public static mapRoleToPerfil(role: string): string {
    switch (role) {
      case 'admin':
        return 'Administrador';
      case 'supervisor':
        return 'Supervisor';
      case 'operador':
        return 'Operador';
      case 'vendedor':
        return 'Vendedor';
      default:
        return 'Usuário';
    }
  }

  /**
   * Mapeia um perfil para um papel
   */
  public static mapPerfilToRole(perfil: string): string {
    switch (perfil) {
      case 'Administrador':
        return 'admin';
      case 'Supervisor':
        return 'supervisor';
      case 'Operador':
        return 'operador';
      case 'Vendedor':
        return 'vendedor';
      default:
        return 'user';
    }
  }

  /**
   * Mapeia papéis para um role legado
   */
  public static mapRolesToLegacyRole(roles: string[]): string {
    if (roles.includes('admin')) return 'admin';
    if (roles.includes('supervisor')) return 'supervisor';
    if (roles.includes('operador')) return 'collector';
    if (roles.includes('vendedor')) return 'seller';
    return 'user';
  }
}

// Exportar a instância singleton
export default UserManager.getInstance();
