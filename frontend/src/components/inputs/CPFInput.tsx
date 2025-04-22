import React, { useState, useEffect } from 'react';
import { TextField, TextFieldProps } from '@mui/material';
import { validateCPF, formatCPF } from '../../utils/brazilianUtils';

interface CPFInputProps extends Omit<TextFieldProps, 'onChange'> {
  value: string;
  onChange: (value: string, isValid: boolean) => void;
  onBlur?: () => void;
}

/**
 * Input component for CPF with validation
 */
const CPFInput: React.FC<CPFInputProps> = ({ 
  value, 
  onChange, 
  onBlur,
  error,
  helperText,
  ...props 
}) => {
  const [isValid, setIsValid] = useState(true);
  const [internalError, setInternalError] = useState<string | null>(null);

  // Validate CPF on value change
  useEffect(() => {
    // Only validate if there's a value and it has 11 digits (without format)
    const cleanCPF = value.replace(/[^\d]/g, '');
    if (cleanCPF.length === 11) {
      const valid = validateCPF(cleanCPF);
      setIsValid(valid);
      setInternalError(valid ? null : 'CPF inválido');
    } else if (cleanCPF.length > 0) {
      setIsValid(false);
      setInternalError(cleanCPF.length < 11 ? null : 'CPF inválido');
    } else {
      setIsValid(true);
      setInternalError(null);
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    // Only accept numbers and format characters
    if (/^[\d.-]*$/.test(newValue)) {
      const cleanValue = newValue.replace(/[^\d]/g, '');
      
      // Format as user types
      let formattedValue = newValue;
      if (cleanValue.length <= 11) {
        // Apply mask as needed
        formattedValue = formatCPF(cleanValue);
      }
      
      // Call the provided onChange with the value and validity
      onChange(formattedValue, isValid);
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    // Format on blur
    const cleanValue = value.replace(/[^\d]/g, '');
    if (cleanValue.length > 0) {
      const formattedValue = formatCPF(cleanValue);
      onChange(formattedValue, isValid);
    }
    
    // Call the provided onBlur if any
    if (onBlur) {
      onBlur();
    }
  };

  return (
    <TextField
      {...props}
      value={value}
      onChange={handleChange}
      onBlur={handleBlur}
      error={error || (value.length > 0 && !isValid)}
      helperText={helperText || internalError}
      inputProps={{
        maxLength: 14, // ###.###.###-##
        ...props.inputProps
      }}
    />
  );
};

export default CPFInput; 