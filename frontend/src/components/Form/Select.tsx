import React from 'react';
import {
  FormControl,
  InputLabel,
  Select as MuiSelect,
  MenuItem,
  FormHelperText,
  SelectProps as MuiSelectProps,
} from '@mui/material';

export interface SelectOption {
  value: string | number;
  label: string;
}

export interface SelectProps extends Omit<MuiSelectProps, 'error'> {
  label: string;
  options: SelectOption[];
  error?: string | null;
  helperText?: string;
}

/**
 * Enhanced Select component with error handling and options
 */
const Select: React.FC<SelectProps> = ({
  label,
  options,
  error,
  helperText,
  ...props
}) => {
  const labelId = `${props.id || 'select'}-label`;

  return (
    <FormControl
      fullWidth={props.fullWidth}
      size={props.size}
      error={!!error}
      disabled={props.disabled}
      required={props.required}
    >
      <InputLabel id={labelId}>{label}</InputLabel>
      <MuiSelect
        {...props}
        labelId={labelId}
        label={label}
      >
        {options.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </MuiSelect>
      {(error || helperText) && (
        <FormHelperText>{error || helperText}</FormHelperText>
      )}
    </FormControl>
  );
};

export default Select;
