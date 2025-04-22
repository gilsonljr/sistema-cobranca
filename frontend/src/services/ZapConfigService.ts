import { ZapConfig, ZapConfigInput } from '../types/Zap';

class ZapConfigService {
  private static instance: ZapConfigService;
  private readonly STORAGE_KEY = 'zap_configurations';

  private constructor() {}

  public static getInstance(): ZapConfigService {
    if (!ZapConfigService.instance) {
      ZapConfigService.instance = new ZapConfigService();
    }
    return ZapConfigService.instance;
  }

  /**
   * Get all Zap configurations
   */
  public getAllConfigs(): ZapConfig[] {
    const storedConfigs = localStorage.getItem(this.STORAGE_KEY);
    if (!storedConfigs) {
      return [];
    }

    try {
      const configs = JSON.parse(storedConfigs);
      return configs.map((config: any) => ({
        ...config,
        createdAt: new Date(config.createdAt),
        updatedAt: new Date(config.updatedAt)
      }));
    } catch (error) {
      console.error('Error parsing Zap configurations:', error);
      return [];
    }
  }

  /**
   * Get all active Zap configurations
   */
  public getActiveConfigs(): ZapConfig[] {
    return this.getAllConfigs().filter(config => config.isActive);
  }

  /**
   * Get a Zap configuration by ID
   */
  public getConfigById(id: string): ZapConfig | undefined {
    return this.getAllConfigs().find(config => config.id === id);
  }

  /**
   * Create a new Zap configuration
   */
  public createConfig(input: ZapConfigInput): ZapConfig {
    const configs = this.getAllConfigs();
    
    const newConfig: ZapConfig = {
      id: `zap_${Date.now()}`,
      name: input.name,
      isActive: input.isActive,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const updatedConfigs = [...configs, newConfig];
    this.saveConfigs(updatedConfigs);
    
    return newConfig;
  }

  /**
   * Update a Zap configuration
   */
  public updateConfig(id: string, input: Partial<ZapConfigInput>): ZapConfig | undefined {
    const configs = this.getAllConfigs();
    const configIndex = configs.findIndex(config => config.id === id);
    
    if (configIndex === -1) {
      return undefined;
    }

    const updatedConfig: ZapConfig = {
      ...configs[configIndex],
      ...input,
      updatedAt: new Date()
    };

    configs[configIndex] = updatedConfig;
    this.saveConfigs(configs);
    
    return updatedConfig;
  }

  /**
   * Delete a Zap configuration
   */
  public deleteConfig(id: string): boolean {
    const configs = this.getAllConfigs();
    const filteredConfigs = configs.filter(config => config.id !== id);
    
    if (filteredConfigs.length === configs.length) {
      return false;
    }

    this.saveConfigs(filteredConfigs);
    return true;
  }

  /**
   * Toggle the active status of a Zap configuration
   */
  public toggleConfigStatus(id: string): ZapConfig | undefined {
    const config = this.getConfigById(id);
    
    if (!config) {
      return undefined;
    }

    return this.updateConfig(id, { isActive: !config.isActive });
  }

  /**
   * Save Zap configurations to localStorage
   */
  private saveConfigs(configs: ZapConfig[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(configs));
  }

  /**
   * Initialize with default configurations if none exist
   */
  public initializeDefaultConfigs(): void {
    const configs = this.getAllConfigs();
    
    if (configs.length === 0) {
      const defaultConfigs: ZapConfigInput[] = [
        { name: 'Zap51', isActive: true },
        { name: 'Zap10', isActive: true },
        { name: 'Zap43', isActive: true }
      ];

      defaultConfigs.forEach(config => this.createConfig(config));
    }
  }
}

// Initialize service
const zapConfigService = ZapConfigService.getInstance();
zapConfigService.initializeDefaultConfigs();

export default zapConfigService; 