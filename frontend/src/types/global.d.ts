// Declaração global para o serviço de emergência
interface PasswordFixService {
  fixPasswordIssue: () => { success: boolean; message: string };
  checkCredentials: (email: string, password: string) => { 
    valid: boolean; 
    message: string;
    user?: {
      id: number;
      email: string;
      fullName: string;
      role: string;
      password: string;
    } | null;
  };
  updatePassword: (email: string, newPassword: string) => { success: boolean; message: string };
}

interface Window {
  PasswordFixService?: PasswordFixService;
}
