import React from 'react';
import {
  FormControlLabel,
  Checkbox as MuiCheckbox,
  CheckboxProps as MuiCheckboxProps,
  FormHelperText,
  FormControl,
} from '@mui/material';

export interface CheckboxProps extends MuiCheckboxProps {
  label: string;
  error?: string | null;
  helperText?: string;
}

/**
 * Enhanced Checkbox component with label and error handling
 */
const Checkbox: React.FC<CheckboxProps> = ({
  label,
  error,
  helperText,
  ...props
}) => {
  return (
    <FormControl error={!!error}>
      <FormControlLabel
        control={<MuiCheckbox {...props} />}
        label={label}
      />
      {(error || helperText) && (
        <FormHelperText>{error || helperText}</FormHelperText>
      )}
    </FormControl>
  );
};

export default Checkbox;
