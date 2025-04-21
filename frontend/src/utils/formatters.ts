/**
 * Format a date to DD/MM/YYYY format
 */
export const formatDate = (date: Date): string => {
  if (!date || isNaN(date.getTime())) return '';

  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
};

/**
 * Format a date to DD/MM/YYYY HH:MM format
 */
export const formatDateTime = (date: Date): string => {
  if (!date || isNaN(date.getTime())) return '';

  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');

  return `${day}/${month}/${year} ${hours}:${minutes}`;
};

/**
 * Format a currency value to BRL format
 */
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

/**
 * Format a percentage value
 * @param value - The number to format as percentage
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted percentage string
 */
export const formatPercentage = (value: number, decimals: number = 2): string => {
  return `${value.toFixed(decimals)}%`;
};

/**
 * Format a phone number to (XX) XXXXX-XXXX format
 */
export const formatPhone = (phone: string): string => {
  if (!phone) return '';

  // Remove non-numeric characters
  const numericPhone = phone.replace(/\D/g, '');

  // Format based on length
  if (numericPhone.length === 11) {
    // Mobile: (XX) XXXXX-XXXX
    return `(${numericPhone.substring(0, 2)}) ${numericPhone.substring(2, 7)}-${numericPhone.substring(7)}`;
  } else if (numericPhone.length === 10) {
    // Landline: (XX) XXXX-XXXX
    return `(${numericPhone.substring(0, 2)}) ${numericPhone.substring(2, 6)}-${numericPhone.substring(6)}`;
  }

  // Return original if not a standard format
  return phone;
};

/**
 * Parse an address string into components
 */
export interface AddressComponents {
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  complement: string;
}

export const parseAddress = (address: string): AddressComponents => {
  const defaultComponents: AddressComponents = {
    street: '',
    number: '',
    neighborhood: '',
    city: '',
    state: '',
    zipCode: '',
    complement: ''
  };

  if (!address) return defaultComponents;

  try {
    // Expected format: "Street, Number, Neighborhood, City, State, ZipCode, Complement"
    const parts = address.split(',').map(part => part.trim());

    // Extract components based on position
    return {
      street: parts[0] || '',
      number: parts[1] || '',
      neighborhood: parts[2] || '',
      city: parts[3] || '',
      state: parts[4] || '',
      zipCode: parts[5] || '',
      complement: parts[6] || ''
    };
  } catch (error) {
    console.error('Error parsing address:', error);
    return defaultComponents;
  }
};
