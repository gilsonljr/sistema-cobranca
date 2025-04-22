import bcrypt from 'bcryptjs';

export class PasswordError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PasswordError';
  }
}

export const PASSWORD_POLICY = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
  specialChars: '!@#$%^&*()_+-=[]{}|;:,.<>?',
  maxConsecutiveChars: 2,
  maxPasswordAge: 90, // days
};

export const validatePassword = (password: string): void => {
  if (password.length < PASSWORD_POLICY.minLength) {
    throw new PasswordError(`Password must be at least ${PASSWORD_POLICY.minLength} characters long`);
  }

  if (PASSWORD_POLICY.requireUppercase && !/[A-Z]/.test(password)) {
    throw new PasswordError('Password must contain at least one uppercase letter');
  }

  if (PASSWORD_POLICY.requireLowercase && !/[a-z]/.test(password)) {
    throw new PasswordError('Password must contain at least one lowercase letter');
  }

  if (PASSWORD_POLICY.requireNumbers && !/[0-9]/.test(password)) {
    throw new PasswordError('Password must contain at least one number');
  }

  if (PASSWORD_POLICY.requireSpecialChars && 
      !new RegExp(`[${PASSWORD_POLICY.specialChars.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}]`).test(password)) {
    throw new PasswordError('Password must contain at least one special character');
  }

  // Check for consecutive characters
  for (let i = 0; i < password.length - PASSWORD_POLICY.maxConsecutiveChars; i++) {
    const consecutive = password.slice(i, i + PASSWORD_POLICY.maxConsecutiveChars + 1);
    if (new Set(consecutive).size === 1) {
      throw new PasswordError(`Password cannot contain more than ${PASSWORD_POLICY.maxConsecutiveChars} consecutive identical characters`);
    }
  }
};

export const hashPassword = async (password: string): Promise<string> => {
  validatePassword(password);
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

export const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

export const generateTemporaryPassword = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
  let password = '';
  
  // Ensure at least one of each required character type
  password += chars.match(/[A-Z]/)![Math.floor(Math.random() * 26)];
  password += chars.match(/[a-z]/)![Math.floor(Math.random() * 26)];
  password += chars.match(/[0-9]/)![Math.floor(Math.random() * 10)];
  password += chars.match(/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/)![Math.floor(Math.random() * 20)];
  
  // Fill the rest to meet minimum length
  while (password.length < PASSWORD_POLICY.minLength) {
    password += chars[Math.floor(Math.random() * chars.length)];
  }
  
  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('');
}; 