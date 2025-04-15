import React from 'react';
import { Box, BoxProps, Button, Stack } from '@mui/material';

export interface FormProps extends Omit<BoxProps, 'onSubmit'> {
  onSubmit: (e: React.FormEvent) => void;
  submitLabel?: string;
  resetLabel?: string;
  onReset?: () => void;
  loading?: boolean;
  disabled?: boolean;
  hideButtons?: boolean;
  submitButtonProps?: React.ComponentProps<typeof Button>;
  resetButtonProps?: React.ComponentProps<typeof Button>;
  children: React.ReactNode;
}

/**
 * Form component with submit and reset buttons
 */
const Form: React.FC<FormProps> = ({
  onSubmit,
  submitLabel = 'Salvar',
  resetLabel = 'Cancelar',
  onReset,
  loading = false,
  disabled = false,
  hideButtons = false,
  submitButtonProps,
  resetButtonProps,
  children,
  ...boxProps
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(e);
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      noValidate
      autoComplete="off"
      {...boxProps}
    >
      {children}

      {!hideButtons && (
        <Stack
          direction="row"
          spacing={2}
          justifyContent="flex-end"
          sx={{ mt: 3 }}
        >
          {onReset && (
            <Button
              type="button"
              variant="outlined"
              onClick={onReset}
              disabled={loading || disabled}
              {...resetButtonProps}
            >
              {resetLabel}
            </Button>
          )}
          <Button
            type="submit"
            variant="contained"
            disabled={loading || disabled}
            {...submitButtonProps}
          >
            {submitLabel}
          </Button>
        </Stack>
      )}
    </Box>
  );
};

export default Form;
