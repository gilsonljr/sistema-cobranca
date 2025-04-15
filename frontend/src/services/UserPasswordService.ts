/**
 * Serviço para gerenciar senhas de usuários no modo de desenvolvimento/mock
 */
class UserPasswordService {
  private readonly STORAGE_KEY = 'user_passwords';

  /**
   * Obtém todas as senhas armazenadas
   * @returns Um objeto com emails como chaves e senhas como valores
   */
  getPasswords(): Record<string, string> {
    const passwords = localStorage.getItem(this.STORAGE_KEY);
    return passwords ? JSON.parse(passwords) : {};
  }

  /**
   * Obtém todas as senhas armazenadas para debug
   * @returns Um objeto com emails como chaves e senhas como valores
   */
  getAllPasswords(): Record<string, string> {
    const passwords = this.getPasswords();
    console.log('Todas as senhas armazenadas:', passwords);
    return passwords;
  }

  /**
   * Define a senha para um usuário específico
   * @param email Email do usuário
   * @param password Nova senha
   */
  setPassword(email: string, password: string): void {
    if (!email || !password) {
      console.error('Tentativa de definir senha com email ou senha vazios');
      return;
    }

    const emailLower = email.toLowerCase();

    // Obter senhas atuais
    const passwordsStr = localStorage.getItem(this.STORAGE_KEY);
    const passwords = passwordsStr ? JSON.parse(passwordsStr) : {};

    // Atualizar senha
    passwords[emailLower] = password;

    // Salvar no localStorage
    const updatedPasswordsStr = JSON.stringify(passwords);
    localStorage.setItem(this.STORAGE_KEY, updatedPasswordsStr);

    console.log(`Senha atualizada para o usuário: ${emailLower}`);
    console.log('Novas senhas armazenadas:', passwords);
    console.log(`Dados salvos no localStorage: ${updatedPasswordsStr}`);

    // Verificar se a senha foi salva corretamente
    const verifyStr = localStorage.getItem(this.STORAGE_KEY);
    const verifyPasswords = verifyStr ? JSON.parse(verifyStr) : {};
    console.log(`Verificação após salvar: ${verifyPasswords[emailLower] === password ? 'OK' : 'FALHA'}`);
  }

  /**
   * Verifica se a senha fornecida é válida para o usuário
   * @param email Email do usuário
   * @param password Senha a ser verificada
   * @returns true se a senha for válida, false caso contrário
   */
  verifyPassword(email: string, password: string): boolean {
    if (!email || !password) {
      console.error('Email ou senha vazios');
      return false;
    }

    const emailLower = email.toLowerCase();
    console.log(`Verificando senha para ${emailLower}`);

    // Obter senhas do localStorage
    const passwordsStr = localStorage.getItem(this.STORAGE_KEY);
    console.log(`Dados brutos do localStorage: ${passwordsStr}`);

    const passwords = passwordsStr ? JSON.parse(passwordsStr) : {};
    console.log('Senhas parseadas:', passwords);

    const storedPassword = passwords[emailLower];
    console.log(`Senha armazenada para ${emailLower}: ${storedPassword || 'nenhuma'}`);

    // Se houver uma senha armazenada, verificar contra ela
    if (storedPassword) {
      const isMatch = storedPassword === password;
      console.log(`Verificando senha armazenada para ${emailLower}: ${isMatch ? 'CORRETA' : 'INCORRETA'}`);
      return isMatch;
    }

    // Se não houver senha armazenada, verificar as senhas padrão
    console.log(`Nenhuma senha armazenada para ${emailLower}, verificando senha padrão`);
    const isDefaultMatch = this.verifyDefaultPassword(emailLower, password);
    console.log(`Verificando senha padrão para ${emailLower}: ${isDefaultMatch ? 'CORRETA' : 'INCORRETA'}`);
    return isDefaultMatch;
  }

  /**
   * Verifica se a senha fornecida corresponde à senha padrão para o usuário
   * @param email Email do usuário
   * @param password Senha a ser verificada
   * @returns true se a senha for válida, false caso contrário
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
      console.log(`Usuário ${emailLower} não reconhecido, mas é do domínio wolf.com. Tentando senha padrão de operador.`);
      return password === 'operador123';
    }

    return false;
  }

  /**
   * Limpa todas as senhas armazenadas e reinicializa com as senhas padrão
   */
  resetAllPasswords(): void {
    console.log('Limpando todas as senhas armazenadas...');
    localStorage.removeItem(this.STORAGE_KEY);
    this.initialize();
    console.log('Todas as senhas foram redefinidas para os valores padrão');
  }

  /**
   * Inicializa o serviço com as senhas padrão se necessário
   */
  initialize(): void {
    console.log('Inicializando serviço de senhas...');

    // Verificar se já existem senhas armazenadas
    const passwordsStr = localStorage.getItem(this.STORAGE_KEY);
    console.log(`Dados existentes no localStorage: ${passwordsStr}`);

    const passwords = passwordsStr ? JSON.parse(passwordsStr) : {};
    const passwordCount = Object.keys(passwords).length;
    console.log(`Encontradas ${passwordCount} senhas armazenadas`);

    // Se já existirem senhas armazenadas, não fazer nada
    if (passwordCount > 0) {
      console.log('Senhas já inicializadas, mantendo as existentes');
      return;
    }

    console.log('Nenhuma senha encontrada, inicializando senhas padrão...');

    // Definir senhas padrão
    const defaultPasswords = {
      'admin@sistema.com': 'admin123',
      'supervisor@sistema.com': 'supervisor123',
      'operador@sistema.com': 'operador123',
      'joao@wolf.com': 'operador123',
      'ana@wolf.com': 'operador123',
      'ludimila@wolf.com': 'operador123',
      'carlos@wolf.com': 'operador123',
      'pedro@wolf.com': 'operador123',
      'vendedor@sistema.com': 'vendedor123',
      'maria@wolf.com': 'vendedor123'
    };

    // Salvar diretamente no localStorage para evitar chamadas múltiplas
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(defaultPasswords));

    // Verificar se as senhas foram salvas corretamente
    const verifyStr = localStorage.getItem(this.STORAGE_KEY);
    const verifyPasswords = verifyStr ? JSON.parse(verifyStr) : {};
    const verifyCount = Object.keys(verifyPasswords).length;

    console.log(`Senhas padrão inicializadas: ${verifyCount} senhas configuradas`);
    console.log('Senhas padrão:', verifyPasswords);
  }
}

export default new UserPasswordService();
