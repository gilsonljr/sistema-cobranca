import React from 'react';
import {
  TextField as MuiTextField,
  TextFieldProps as MuiTextFieldProps,
  InputAdornment,
} from '@mui/material';

export interface TextFieldProps extends Omit<MuiTextFieldProps, 'error'> {
  error?: string | null;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
}

/**
 * Enhanced TextField component with error handling and icons
 */
const TextField: React.FC<TextFieldProps> = ({
  error,
  startIcon,
  endIcon,
  helperText,
  ...props
}) => {
  return (
    <MuiTextField
      {...props}
      error={!!error}
      helperText={error || helperText}
      InputProps={{
        ...props.InputProps,
        startAdornment: startIcon ? (
          <InputAdornment position="start">{startIcon}</InputAdornment>
        ) : props.InputProps?.startAdornment,
        endAdornment: endIcon ? (
          <InputAdornment position="end">{endIcon}</InputAdornment>
        ) : props.InputProps?.endAdornment,
      }}
    />
  );
};

export default TextField;
