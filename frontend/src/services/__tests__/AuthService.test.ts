import AuthService from '../AuthService';

// Mock localStorage is already set up in setupTests.ts

describe('AuthService', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should login admin user successfully in mock mode', async () => {
      const credentials = {
        email: 'admin@sistema.com',
        password: 'admin123'
      };

      const result = await AuthService.login(credentials);

      // Check that tokens were returned
      expect(result).toHaveProperty('access_token');
      expect(result).toHaveProperty('refresh_token');
      expect(result).toHaveProperty('token_type');

      // Check that tokens were stored in localStorage
      const storedTokens = localStorage.getItem('authTokens');
      expect(storedTokens).not.toBeNull();
      
      // Check that user info was stored in localStorage
      const storedUserInfo = localStorage.getItem('userInfo');
      expect(storedUserInfo).not.toBeNull();
      
      if (storedUserInfo) {
        const userInfo = JSON.parse(storedUserInfo);
        expect(userInfo.email).toBe('admin@sistema.com');
        expect(userInfo.role).toBe('admin');
      }
    });

    it('should login supervisor user successfully in mock mode', async () => {
      const credentials = {
        email: 'supervisor@sistema.com',
        password: 'supervisor123'
      };

      const result = await AuthService.login(credentials);

      // Check that tokens were returned
      expect(result).toHaveProperty('access_token');
      expect(result).toHaveProperty('refresh_token');
      expect(result).toHaveProperty('token_type');

      // Check that user info was stored correctly
      const storedUserInfo = localStorage.getItem('userInfo');
      if (storedUserInfo) {
        const userInfo = JSON.parse(storedUserInfo);
        expect(userInfo.email).toBe('supervisor@sistema.com');
        expect(userInfo.role).toBe('supervisor');
      }
    });

    it('should throw error for invalid credentials', async () => {
      const credentials = {
        email: 'invalid@example.com',
        password: 'wrongpassword'
      };

      await expect(AuthService.login(credentials)).rejects.toThrow();
    });
  });

  describe('isAuthenticated', () => {
    it('should return true when user is authenticated', () => {
      // Set up mock authenticated state
      localStorage.setItem('authTokens', JSON.stringify({
        access_token: 'test-token',
        refresh_token: 'test-refresh-token',
        token_type: 'bearer'
      }));

      expect(AuthService.isAuthenticated()).toBe(true);
    });

    it('should return false when user is not authenticated', () => {
      // Ensure no tokens in localStorage
      localStorage.clear();
      
      expect(AuthService.isAuthenticated()).toBe(false);
    });
  });

  describe('logout', () => {
    it('should clear authentication data', () => {
      // Set up mock authenticated state
      localStorage.setItem('authTokens', JSON.stringify({
        access_token: 'test-token',
        refresh_token: 'test-refresh-token',
        token_type: 'bearer'
      }));
      localStorage.setItem('userInfo', JSON.stringify({
        id: 1,
        email: 'test@example.com',
        fullName: 'Test User',
        role: 'admin'
      }));

      // Mock window.location.href
      const originalLocation = window.location;
      delete window.location;
      window.location = { ...originalLocation, href: '' } as any;
      
      AuthService.logout();

      // Check that localStorage items were removed
      expect(localStorage.getItem('authTokens')).toBeNull();
      expect(localStorage.getItem('userInfo')).toBeNull();
      
      // Restore original location
      window.location = originalLocation;
    });
  });

  describe('role checks', () => {
    it('should correctly identify admin role', () => {
      localStorage.setItem('userInfo', JSON.stringify({
        id: 1,
        email: 'admin@sistema.com',
        fullName: 'Admin',
        role: 'admin'
      }));

      expect(AuthService.isAdmin()).toBe(true);
      expect(AuthService.isSupervisor()).toBe(true); // Admin is also considered supervisor
      expect(AuthService.isCollector()).toBe(false);
      expect(AuthService.isSeller()).toBe(false);
    });

    it('should correctly identify supervisor role', () => {
      localStorage.setItem('userInfo', JSON.stringify({
        id: 2,
        email: 'supervisor@sistema.com',
        fullName: 'Supervisor',
        role: 'supervisor'
      }));

      expect(AuthService.isAdmin()).toBe(false);
      expect(AuthService.isSupervisor()).toBe(true);
      expect(AuthService.isCollector()).toBe(false);
      expect(AuthService.isSeller()).toBe(false);
    });

    it('should correctly identify collector role', () => {
      localStorage.setItem('userInfo', JSON.stringify({
        id: 3,
        email: 'operador@sistema.com',
        fullName: 'Operador',
        role: 'collector'
      }));

      expect(AuthService.isAdmin()).toBe(false);
      expect(AuthService.isSupervisor()).toBe(false);
      expect(AuthService.isCollector()).toBe(true);
      expect(AuthService.isSeller()).toBe(false);
    });

    it('should correctly identify seller role', () => {
      localStorage.setItem('userInfo', JSON.stringify({
        id: 4,
        email: 'vendedor@sistema.com',
        fullName: 'Vendedor',
        role: 'seller'
      }));

      expect(AuthService.isAdmin()).toBe(false);
      expect(AuthService.isSupervisor()).toBe(false);
      expect(AuthService.isCollector()).toBe(false);
      expect(AuthService.isSeller()).toBe(true);
    });
  });
});
