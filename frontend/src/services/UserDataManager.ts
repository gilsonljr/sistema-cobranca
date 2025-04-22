import { User, UserInput } from '../types/User';
import { convertToUserManagerFormat } from '../utils/userUtils';

/**
 * UserDataManager - Gerenciador centralizado de dados de usuários
 *
 * Esta classe é responsável por gerenciar todos os dados de usuários no sistema,
 * garantindo que haja apenas uma fonte de verdade e que todos os componentes
 * utilizem os mesmos dados.
 */
export class UserDataManager {
  // Singleton instance
  private static instance: UserDataManager;
  private users: User[] = [];

  private constructor() {
    this.loadUsers();
  }

  public static getInstance(): UserDataManager {
    if (!UserDataManager.instance) {
      UserDataManager.instance = new UserDataManager();
    }
    return UserDataManager.instance;
  }

  private loadUsers(): void {
    const usersStr = localStorage.getItem('users');
    if (usersStr) {
      try {
        const parsedUsers = JSON.parse(usersStr);
        this.users = parsedUsers.map((user: any) => ({
          ...user,
          created_at: new Date(user.created_at),
          updated_at: new Date(user.updated_at)
        }));
      } catch (error) {
        console.error('Error loading users:', error);
        this.users = [];
      }
    }
  }

  private saveUsers(): void {
    localStorage.setItem('users', JSON.stringify(this.users));
  }

  public getUsers(): User[] {
    return [...this.users];
  }

  public getUserById(id: number): User | undefined {
    return this.users.find(user => user.id === id);
  }

  public getUserByEmail(email: string): User | undefined {
    return this.users.find(user => user.email === email);
  }

  public addUser(userInput: UserInput): User {
    const newUser: User = {
      id: Date.now(),
      email: userInput.email,
      full_name: userInput.full_name,
      role: userInput.role,
      is_active: userInput.is_active,
      created_at: new Date(),
      updated_at: new Date()
    };

    this.users.push(newUser);
    this.saveUsers();
    return newUser;
  }

  public updateUser(id: number, userInput: UserInput): User | undefined {
    const userIndex = this.users.findIndex(user => user.id === id);
    if (userIndex === -1) return undefined;

    const updatedUser: User = {
      ...this.users[userIndex],
      ...userInput,
      updated_at: new Date()
    };

    this.users[userIndex] = updatedUser;
    this.saveUsers();
    return updatedUser;
  }

  public deleteUser(id: number): boolean {
    const initialLength = this.users.length;
    this.users = this.users.filter(user => user.id !== id);
    const deleted = this.users.length !== initialLength;
    if (deleted) {
      this.saveUsers();
    }
    return deleted;
  }

  public resetToAdmin(): void {
    const adminUser: User = {
      id: 1,
      email: 'admin@sistema.com',
      full_name: 'Administrador',
      role: 'admin',
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    };

    this.users = [adminUser];
    this.saveUsers();
  }

  // Alias for getUsers for backward compatibility
  public getAllUsers(): User[] {
    return this.users;
  }

  // For backward compatibility
  public clearAllUsersExceptAdmin(): void {
    this.resetToAdmin();
  }
}

// Create a singleton instance and export it as default
const userDataManager = UserDataManager.getInstance();
export default userDataManager;
