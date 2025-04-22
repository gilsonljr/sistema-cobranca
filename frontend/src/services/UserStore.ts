/**
 * UserStore - Armazenamento centralizado de usuários
 *
 * Este serviço atua como a única fonte de verdade para todos os dados de usuários
 * no sistema, garantindo consistência em todas as partes da aplicação.
 */

import { User, UserInput, UserRole } from '../types/User';
import { hashPassword, validatePassword, PasswordError } from '../utils/passwordUtils';

// Custom error class for user-related errors
export class UserError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'UserError';
  }
}

// Classe singleton para gerenciar usuários
class UserStore {
  // Static methods for direct access
  static getUsers: () => User[];
  static getUserById: (id: number) => User | undefined;
  static getUserByEmail: (email: string) => User | undefined;
  static addUser: (userInput: UserInput) => Promise<User>;
  static updateUser: (userId: number, userInput: UserInput) => Promise<User>;
  static deleteUser: (userId: number) => void;
  static resetToAdmin: () => void;
  static saveUsers: (users: User[]) => void;
  private static instance: UserStore;
  private users: User[] = [];
  private readonly STORAGE_KEY = 'users';
  private readonly STORAGE_VERSION = '1.0';
  private readonly EVENT_NAME = 'user-store-updated';

  // Usuário admin padrão
  private readonly DEFAULT_ADMIN: User = {
    id: 1,
    email: 'admin@admin.com',
    full_name: 'Admin',
    role: 'admin',
    is_active: true,
    created_at: new Date(),
    updated_at: new Date(),
    password_hash: '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', // hash for 'admin123'
    password_changed_at: new Date(),
    last_login_at: new Date(),
    failed_login_attempts: 0
  };

  private constructor() {
    this.initializeStore();
    this.setupStorageListener();
  }

  public static getInstance(): UserStore {
    if (!UserStore.instance) {
      UserStore.instance = new UserStore();
    }
    return UserStore.instance;
  }

  private initializeStore(): void {
    try {
      const storedData = localStorage.getItem(this.STORAGE_KEY);
      if (!storedData) {
        this.saveUsers([this.DEFAULT_ADMIN]);
        return;
      }

      const { version, users } = JSON.parse(storedData);
      if (version !== this.STORAGE_VERSION) {
        this.migrateData(version, users);
      } else {
        this.users = users.map((user: any) => ({
          ...user,
          created_at: new Date(user.created_at),
          updated_at: new Date(user.updated_at),
          password_changed_at: user.password_changed_at ? new Date(user.password_changed_at) : undefined,
          last_login_at: user.last_login_at ? new Date(user.last_login_at) : undefined,
          account_locked_until: user.account_locked_until ? new Date(user.account_locked_until) : undefined
        }));
      }
    } catch (error) {
      console.error('Error initializing UserStore:', error);
      this.saveUsers([this.DEFAULT_ADMIN]);
    }
  }

  private setupStorageListener(): void {
    window.addEventListener('storage', (event) => {
      if (event.key === this.STORAGE_KEY) {
        this.initializeStore();
        this.notifyUsersUpdated();
      }
    });
  }

  private migrateData(oldVersion: string, oldUsers: any[]): void {
    try {
      const migratedUsers = oldUsers.map(user => ({
        ...user,
        full_name: user.nome || user.full_name,
        role: this.convertRole(user.papeis || user.role),
        is_active: user.ativo || user.is_active,
        created_at: user.created_at ? new Date(user.created_at) : new Date(),
        updated_at: new Date(),
        password_hash: user.password_hash || undefined,
        password_changed_at: user.password_changed_at ? new Date(user.password_changed_at) : undefined,
        last_login_at: user.last_login_at ? new Date(user.last_login_at) : undefined,
        failed_login_attempts: user.failed_login_attempts || 0,
        account_locked_until: user.account_locked_until ? new Date(user.account_locked_until) : undefined
      }));

      this.saveUsers(migratedUsers);
    } catch (error) {
      console.error('Error migrating user data:', error);
      this.saveUsers([this.DEFAULT_ADMIN]);
    }
  }

  private convertRole(oldRole: string | string[]): UserRole {
    if (Array.isArray(oldRole)) {
      if (oldRole.includes('admin')) return 'admin';
      if (oldRole.includes('supervisor')) return 'supervisor';
      if (oldRole.includes('collector') || oldRole.includes('operador')) return 'collector';
      if (oldRole.includes('seller') || oldRole.includes('vendedor')) return 'seller';
    }
    return oldRole as UserRole;
  }

  public getUsers(): User[] {
    return [...this.users];
  }

  public saveUsers(users: User[]): void {
    try {
      const data = {
        version: this.STORAGE_VERSION,
        users: users.map(user => ({
          ...user,
          created_at: user.created_at?.toISOString(),
          updated_at: new Date().toISOString(),
          password_changed_at: user.password_changed_at?.toISOString(),
          last_login_at: user.last_login_at?.toISOString(),
          account_locked_until: user.account_locked_until?.toISOString()
        }))
      };
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
      this.users = users;
      this.notifyUsersUpdated();
    } catch (error) {
      console.error('Error saving users:', error);
      throw new UserError('Failed to save users');
    }
  }

  public getUserById(id: number): User | undefined {
    return this.users.find(user => user.id === id);
  }

  public getUserByEmail(email: string): User | undefined {
    return this.users.find(user => user.email.toLowerCase() === email.toLowerCase());
  }

  public async addUser(userInput: UserInput): Promise<User> {
    this.validateUserInput(userInput);

    const existingUser = this.getUserByEmail(userInput.email);
    if (existingUser) {
      throw new UserError('User with this email already exists');
    }

    let password_hash: string | undefined;
    if (userInput.password) {
      await validatePassword(userInput.password);
      password_hash = await hashPassword(userInput.password);
    }

    const newUser: User = {
      ...userInput,
      id: this.getNextUserId(),
      created_at: new Date(),
      updated_at: new Date(),
      password_hash,
      password_changed_at: password_hash ? new Date() : undefined,
      last_login_at: undefined,
      failed_login_attempts: 0,
      account_locked_until: undefined
    };

    this.saveUsers([...this.users, newUser]);
    return newUser;
  }

  public async updateUser(userId: number, userInput: UserInput): Promise<User> {
    this.validateUserInput(userInput);

    const userIndex = this.users.findIndex(user => user.id === userId);
    if (userIndex === -1) {
      throw new UserError('User not found');
    }

    const existingUser = this.getUserByEmail(userInput.email);
    if (existingUser && existingUser.id !== userId) {
      throw new UserError('Email already in use by another user');
    }

    const currentUser = this.users[userIndex];
    let password_hash = currentUser.password_hash;
    let password_changed_at = currentUser.password_changed_at;

    if (userInput.password) {
      await validatePassword(userInput.password);
      password_hash = await hashPassword(userInput.password);
      password_changed_at = new Date();
    }

    const updatedUser: User = {
      ...currentUser,
      ...userInput,
      updated_at: new Date(),
      password_hash,
      password_changed_at
    };

    const updatedUsers = [...this.users];
    updatedUsers[userIndex] = updatedUser;
    this.saveUsers(updatedUsers);
    return updatedUser;
  }

  public deleteUser(userId: number): void {
    if (userId === 1) {
      throw new UserError('Cannot delete admin user');
    }

    const filteredUsers = this.users.filter(user => user.id !== userId);
    if (filteredUsers.length === this.users.length) {
      throw new UserError('User not found');
    }

    this.saveUsers(filteredUsers);
  }

  public resetToAdmin(): void {
    this.saveUsers([this.DEFAULT_ADMIN]);
  }

  private validateUserInput(userInput: UserInput): void {
    if (!userInput.email || !userInput.email.includes('@')) {
      throw new UserError('Invalid email address');
    }

    if (!userInput.full_name || userInput.full_name.trim().length < 2) {
      throw new UserError('Full name must be at least 2 characters long');
    }

    if (!userInput.role || !['admin', 'supervisor', 'collector', 'seller'].includes(userInput.role)) {
      throw new UserError('Invalid role');
    }
  }

  private getNextUserId(): number {
    return Math.max(...this.users.map(user => user.id), 0) + 1;
  }

  private notifyUsersUpdated(): void {
    const event = new CustomEvent(this.EVENT_NAME, {
      detail: {
        users: this.getUsers()
      }
    });
    window.dispatchEvent(event);
  }

  public addEventListener(callback: (users: User[]) => void): void {
    const handler = (event: CustomEvent) => callback(event.detail.users);
    window.addEventListener(this.EVENT_NAME, handler as EventListener);
  }

  public removeEventListener(callback: (users: User[]) => void): void {
    const handler = (event: CustomEvent) => callback(event.detail.users);
    window.removeEventListener(this.EVENT_NAME, handler as EventListener);
  }
}

// Create a singleton instance
const userStoreInstance = UserStore.getInstance();

// Add static methods to the UserStore class for direct access
UserStore.getUsers = function(): User[] {
  return userStoreInstance.getUsers();
};

UserStore.getUserById = function(id: number): User | undefined {
  return userStoreInstance.getUserById(id);
};

UserStore.getUserByEmail = function(email: string): User | undefined {
  return userStoreInstance.getUserByEmail(email);
};

UserStore.addUser = function(userInput: UserInput): Promise<User> {
  return userStoreInstance.addUser(userInput);
};

UserStore.updateUser = function(userId: number, userInput: UserInput): Promise<User> {
  return userStoreInstance.updateUser(userId, userInput);
};

UserStore.deleteUser = function(userId: number): void {
  return userStoreInstance.deleteUser(userId);
};

UserStore.resetToAdmin = function(): void {
  return userStoreInstance.resetToAdmin();
};

UserStore.saveUsers = function(users: User[]): void {
  return userStoreInstance.saveUsers(users);
};

// Export both the class and the instance
export type { User };
export default UserStore;

