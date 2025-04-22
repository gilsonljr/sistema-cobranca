/**
 * Utilities for Brazilian-specific functionalities
 */

// Interface for address data
export interface AddressData {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  ibge?: string;
  gia?: string;
  ddd?: string;
  siafi?: string;
}

/**
 * Validates a Brazilian CPF
 * @param cpf CPF to validate (can include formatting)
 * @returns boolean indicating if CPF is valid
 */
export const validateCPF = (cpf: string): boolean => {
  // Remove non-numeric characters
  const cleanCPF = cpf.replace(/[^\d]/g, '');

  // Check if it has 11 digits
  if (cleanCPF.length !== 11) {
    return false;
  }

  // Check if all digits are the same (invalid case)
  if (/^(\d)\1+$/.test(cleanCPF)) {
    return false;
  }

  // Validate first check digit
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (10 - i);
  }
  let mod = sum % 11;
  const firstCheckDigit = mod < 2 ? 0 : 11 - mod;
  if (parseInt(cleanCPF.charAt(9)) !== firstCheckDigit) {
    return false;
  }

  // Validate second check digit
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (11 - i);
  }
  mod = sum % 11;
  const secondCheckDigit = mod < 2 ? 0 : 11 - mod;
  if (parseInt(cleanCPF.charAt(10)) !== secondCheckDigit) {
    return false;
  }

  return true;
};

/**
 * Format CPF with mask (###.###.###-##)
 */
export const formatCPF = (cpf: string): string => {
  const cleanCPF = cpf.replace(/[^\d]/g, '');
  return cleanCPF.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
};

/**
 * Searches for address information using a CEP
 * @param cep CEP to search (only numbers)
 * @returns Promise with address data
 */
export const searchCEP = async (cep: string): Promise<AddressData> => {
  const cleanCEP = cep.replace(/[^\d]/g, '');
  
  if (cleanCEP.length !== 8) {
    throw new Error('CEP deve ter 8 dígitos');
  }
  
  try {
    const response = await fetch(`https://viacep.com.br/ws/${cleanCEP}/json/`);
    const data = await response.json();
    
    if (data.erro) {
      throw new Error('CEP não encontrado');
    }
    
    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Erro ao buscar o CEP');
  }
};

/**
 * Format CEP with mask (#####-###)
 */
export const formatCEP = (cep: string): string => {
  const cleanCEP = cep.replace(/[^\d]/g, '');
  return cleanCEP.replace(/(\d{5})(\d{3})/, '$1-$2');
}; 