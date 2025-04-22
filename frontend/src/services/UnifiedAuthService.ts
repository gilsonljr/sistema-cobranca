import UserManager from './UserManager';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface UserInfo {
  id: number;
  email: string;
  fullName: string;
  role: string;
}

/**
 * Serviço unificado de autenticação
 * Usa o UserManager como fonte única de verdade para autenticação
 */
class UnifiedAuthService {
  private readonly AUTH_TOKENS_KEY = 'unified_auth_tokens';
  private readonly USER_INFO_KEY = 'unified_user_info';
  private readonly TOKEN_EXPIRY_KEY = 'unified_token_expiry';

  /**
   * Realiza o login do usuário
   */
  async login(credentials: LoginCredentials): Promise<AuthTokens> {
    try {
      console.log('UnifiedAuthService: Tentando login para', credentials.email);

      // Verificar se as credenciais são válidas
      const isValid = UserManager.verifyPassword(credentials.email, credentials.password);

      if (!isValid) {
        console.error('UnifiedAuthService: Credenciais inválidas para', credentials.email);
        throw new Error('Credenciais inválidas. Por favor, tente novamente.');
      }

      // Obter usuário
      const user = UserManager.getUserByEmail(credentials.email);

      if (!user) {
        console.error('UnifiedAuthService: Usuário não encontrado para', credentials.email);
        throw new Error('Usuário não encontrado.');
      }

      // Verificar se o usuário está ativo
      if (!user.ativo) {
        console.error('UnifiedAuthService: Usuário inativo:', credentials.email);
        throw new Error('Usuário inativo. Entre em contato com o administrador.');
      }

      // Mapear papel para role
      let role = 'user';
      if (user.papeis.includes('admin')) role = 'admin';
      else if (user.papeis.includes('supervisor')) role = 'supervisor';
      else if (user.papeis.includes('operador')) role = 'collector';
      else if (user.papeis.includes('vendedor')) role = 'seller';

      // Gerar tokens
      const tokenPrefix = role;
      const tokens: AuthTokens = {
        access_token: `mock-${tokenPrefix}-token-${Date.now()}`,
        refresh_token: `mock-${tokenPrefix}-refresh-token-${Date.now()}`,
        token_type: 'bearer'
      };

      // Armazenar tokens
      localStorage.setItem(this.AUTH_TOKENS_KEY, JSON.stringify(tokens));

      // Definir expiração do token (8 horas a partir de agora)
      const expiryTime = Date.now() + (8 * 60 * 60 * 1000);
      localStorage.setItem(this.TOKEN_EXPIRY_KEY, expiryTime.toString());

      // Armazenar informações do usuário
      const userInfo: UserInfo = {
        id: user.id,
        email: user.email,
        fullName: user.nome,
        role: role
      };

      localStorage.setItem(this.USER_INFO_KEY, JSON.stringify(userInfo));

      // Disparar evento de login
      window.dispatchEvent(new CustomEvent('user-login', {
        detail: { email: user.email, role: role }
      }));

      console.log('UnifiedAuthService: Login bem-sucedido para', credentials.email);

      return tokens;
    } catch (error) {
      console.error('UnifiedAuthService: Erro no login:', error);
      throw error;
    }
  }

  /**
   * Realiza o logout do usuário
   */
  logout(): void {
    // Obter informações do usuário antes de remover
    const userInfo = this.getUserInfo();

    // Remover dados de autenticação
    localStorage.removeItem(this.AUTH_TOKENS_KEY);
    localStorage.removeItem(this.USER_INFO_KEY);
    localStorage.removeItem(this.TOKEN_EXPIRY_KEY);

    // Disparar evento de logout
    if (userInfo) {
      window.dispatchEvent(new CustomEvent('user-logout', {
        detail: { email: userInfo.email }
      }));
    }

    // Redirecionar para a página de login
    window.location.href = '/login';
  }

  /**
   * Verifica se o usuário está autenticado
   */
  isAuthenticated(): boolean {
    const authTokens = this.getAuthTokens();
    if (!authTokens || !authTokens.access_token) {
      return false;
    }

    // Verificar se o token expirou
    const expiryTimeStr = localStorage.getItem(this.TOKEN_EXPIRY_KEY);
    if (!expiryTimeStr) {
      return false;
    }

    const expiryTime = parseInt(expiryTimeStr, 10);
    const now = Date.now();

    // Se o token expirou, fazer logout
    if (now > expiryTime) {
      console.log('UnifiedAuthService: Token expirado, fazendo logout');
      this.logout();
      return false;
    }

    return true;
  }

  /**
   * Obtém os tokens de autenticação
   */
  getAuthTokens(): AuthTokens | null {
    const authTokensStr = localStorage.getItem(this.AUTH_TOKENS_KEY);
    return authTokensStr ? JSON.parse(authTokensStr) : null;
  }

  /**
   * Obtém as informações do usuário autenticado
   */
  getUserInfo(): UserInfo | null {
    const userInfoStr = localStorage.getItem(this.USER_INFO_KEY);
    return userInfoStr ? JSON.parse(userInfoStr) : null;
  }

  /**
   * Atualiza o token de acesso usando o token de atualização
   */
  async refreshToken(): Promise<AuthTokens> {
    try {
      // Obter tokens atuais
      const authTokens = this.getAuthTokens();

      if (!authTokens || !authTokens.refresh_token) {
        throw new Error('Nenhum token de atualização disponível');
      }

      // Obter informações do usuário
      const userInfo = this.getUserInfo();

      if (!userInfo) {
        throw new Error('Nenhuma informação de usuário disponível');
      }

      // Verificar se o usuário ainda existe e está ativo
      const user = UserManager.getUserByEmail(userInfo.email);
      if (!user || !user.ativo) {
        throw new Error('Usuário não encontrado ou inativo');
      }

      // Gerar novos tokens
      const tokenPrefix = userInfo.role;
      const newTokens: AuthTokens = {
        access_token: `mock-${tokenPrefix}-token-${Date.now()}`,
        refresh_token: `mock-${tokenPrefix}-refresh-token-${Date.now()}`,
        token_type: 'bearer'
      };

      // Armazenar novos tokens
      localStorage.setItem(this.AUTH_TOKENS_KEY, JSON.stringify(newTokens));

      // Atualizar expiração do token (8 horas a partir de agora)
      const expiryTime = Date.now() + (8 * 60 * 60 * 1000);
      localStorage.setItem(this.TOKEN_EXPIRY_KEY, expiryTime.toString());

      return newTokens;
    } catch (error) {
      console.error('UnifiedAuthService: Erro ao atualizar token:', error);
      // Se houver erro, fazer logout
      this.logout();
      throw error;
    }
  }
}

export default new UnifiedAuthService();
