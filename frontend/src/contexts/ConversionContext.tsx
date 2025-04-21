import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';

interface ConversionSettings {
  enabled: boolean;
  salesConversion: number;
  revenueConversion: number;
  whatsappConversion: number;
  facebookConversion: number;
}

interface ConversionContextType {
  conversionSettings: ConversionSettings;
  updateConversionSettings: (settings: Partial<ConversionSettings>) => void;
  applyConversion: (value: number, type: keyof Omit<ConversionSettings, 'enabled'>) => number;
}

const defaultSettings: ConversionSettings = {
  enabled: false,
  salesConversion: 100, // 100% means no change
  revenueConversion: 100,
  whatsappConversion: 100,
  facebookConversion: 100,
};

const ConversionContext = createContext<ConversionContextType | undefined>(undefined);

export const ConversionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [conversionSettings, setConversionSettings] = useState<ConversionSettings>(() => {
    // Load settings from localStorage if available
    const savedSettings = localStorage.getItem('conversionSettings');
    return savedSettings ? JSON.parse(savedSettings) : defaultSettings;
  });

  // Save settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('conversionSettings', JSON.stringify(conversionSettings));
  }, [conversionSettings]);

  const updateConversionSettings = (settings: Partial<ConversionSettings>) => {
    setConversionSettings(prev => ({ ...prev, ...settings }));
  };

  // Function to apply conversion to a value based on the type
  const applyConversion = (value: number, type: keyof Omit<ConversionSettings, 'enabled'>): number => {
    // If conversion is disabled, always return the original value
    if (!conversionSettings.enabled) return value;

    // For revenue conversion, we want to make the Valor Recebido be the specified percentage of Valor Total
    if (type === 'revenueConversion') {
      // If we're calculating the received value, apply the conversion rate directly
      return value * (conversionSettings.revenueConversion / 100);
    } else {
      // For other types, use the standard conversion
      const conversionRate = conversionSettings[type] / 100;
      return value * conversionRate;
    }
  };

  return (
    <ConversionContext.Provider value={{ conversionSettings, updateConversionSettings, applyConversion }}>
      {children}
    </ConversionContext.Provider>
  );
};

export const useConversion = (): ConversionContextType => {
  const context = useContext(ConversionContext);
  if (context === undefined) {
    throw new Error('useConversion must be used within a ConversionProvider');
  }
  return context;
};
