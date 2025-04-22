export interface ZapConfig {
  id: string;
  name: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ZapConfigInput {
  name: string;
  isActive: boolean;
} 