import React from 'react';
import { DatePicker as MuiDatePicker } from '@mui/x-date-pickers/DatePicker';
import { TextField, TextFieldProps } from '@mui/material';

export interface DatePickerProps {
  label: string;
  value: Date | null;
  onChange: (date: Date | null) => void;
  error?: string | null;
  helperText?: string;
  minDate?: Date;
  maxDate?: Date;
  disabled?: boolean;
  required?: boolean;
  fullWidth?: boolean;
  size?: 'small' | 'medium';
  format?: string;
  disablePast?: boolean;
  disableFuture?: boolean;
  inputProps?: Omit<TextFieldProps, 'error' | 'helperText'>;
}

/**
 * Enhanced DatePicker component with error handling
 */
const DatePicker: React.FC<DatePickerProps> = ({
  label,
  value,
  onChange,
  error,
  helperText,
  minDate,
  maxDate,
  disabled,
  required,
  fullWidth,
  size,
  format = 'dd/MM/yyyy',
  disablePast,
  disableFuture,
  inputProps,
}) => {
  return (
    <MuiDatePicker
      label={label}
      value={value}
      onChange={onChange}
      format={format}
      minDate={minDate}
      maxDate={maxDate}
      disablePast={disablePast}
      disableFuture={disableFuture}
      slotProps={{
        textField: {
          ...inputProps,
          error: !!error,
          helperText: error || helperText,
          required,
          fullWidth,
          size,
          disabled,
        },
      }}
    />
  );
};

export default DatePicker;
