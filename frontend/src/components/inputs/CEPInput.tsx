import React, { useState, useEffect } from 'react';
import { 
  TextField, 
  TextFieldProps,
  CircularProgress,
  InputAdornment
} from '@mui/material';
import { formatCEP } from '../../utils/brazilianUtils';
import useCEP from '../../hooks/useCEP';

interface CEPInputProps extends Omit<TextFieldProps, 'onChange'> {
  value: string;
  onChange: (value: string) => void;
  onAddressFound: (address: any) => void;
  onBlur?: () => void;
}

/**
 * Input component for CEP with address auto-fill
 */
const CEPInput: React.FC<CEPInputProps> = ({ 
  value, 
  onChange, 
  onAddressFound,
  onBlur,
  error,
  helperText,
  ...props 
}) => {
  const {
    cep,
    address,
    loading,
    error: cepError,
    handleCEPChange,
    handleCEPBlur,
    setCEP
  } = useCEP();

  // Update the external value when necessary
  useEffect(() => {
    if (value !== cep) {
      setCEP(value);
    }
  }, [value, setCEP]);

  // Notify parent about address changes
  useEffect(() => {
    if (address) {
      onAddressFound(address);
    }
  }, [address, onAddressFound]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleCEPChange(e);
    onChange(e.target.value);
  };

  const handleBlur = async () => {
    await handleCEPBlur();
    if (onBlur) onBlur();
  };

  return (
    <TextField
      {...props}
      value={cep}
      onChange={handleChange}
      onBlur={handleBlur}
      error={error || !!cepError}
      helperText={helperText || cepError}
      InputProps={{
        endAdornment: loading ? (
          <InputAdornment position="end">
            <CircularProgress size={20} />
          </InputAdornment>
        ) : null,
        ...props.InputProps
      }}
      inputProps={{
        maxLength: 9, // #####-###
        ...props.inputProps
      }}
    />
  );
};

export default CEPInput; 