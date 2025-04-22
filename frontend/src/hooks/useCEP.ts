import { useState } from 'react';
import { searchCEP, AddressData, formatCEP } from '../utils/brazilianUtils';

interface UseCEPReturn {
  cep: string;
  address: AddressData | null;
  loading: boolean;
  error: string | null;
  handleCEPChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleCEPBlur: () => Promise<void>;
  setCEP: (value: string) => void;
}

/**
 * Custom hook to handle CEP input and address auto-fill
 */
export const useCEP = (): UseCEPReturn => {
  const [cep, setCEP] = useState('');
  const [address, setAddress] = useState<AddressData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCEPChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCEP(value);
    
    // Clear previous results when input changes
    if (value.length !== 9) { // 9 is the length with mask
      setAddress(null);
      setError(null);
    }
  };

  const handleCEPBlur = async () => {
    // Only search if CEP has content
    if (!cep || cep.length < 8) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const cleanCEP = cep.replace(/[^\d]/g, '');
      const addressData = await searchCEP(cleanCEP);
      setAddress(addressData);
      // Format CEP with mask
      setCEP(formatCEP(cleanCEP));
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Erro ao buscar CEP');
      }
      setAddress(null);
    } finally {
      setLoading(false);
    }
  };

  return {
    cep,
    address,
    loading,
    error,
    handleCEPChange,
    handleCEPBlur,
    setCEP
  };
};

export default useCEP; 