import { useState, useCallback, useMemo } from 'react';

type ValidationRule<T> = (value: T) => string | null;

interface FieldConfig<T> {
  value: T;
  rules?: ValidationRule<T>[];
}

type FormConfig<T> = {
  [K in keyof T]: FieldConfig<T[K]>;
};

interface UseFormValidationReturn<T> {
  values: T;
  errors: Record<keyof T, string | null>;
  touched: Record<keyof T, boolean>;
  handleChange: (field: keyof T, value: any) => void;
  handleBlur: (field: keyof T) => void;
  isValid: boolean;
  validateField: (field: keyof T) => boolean;
  validateAll: () => boolean;
  resetForm: () => void;
  setFieldValue: (field: keyof T, value: any) => void;
}

/**
 * Custom hook for form validation
 */
export function useFormValidation<T extends Record<string, any>>(
  initialConfig: FormConfig<T>
): UseFormValidationReturn<T> {
  // Extract initial values from config
  const initialValues = Object.entries(initialConfig).reduce(
    (acc, [key, config]) => {
      acc[key as keyof T] = config.value;
      return acc;
    },
    {} as T
  );
  
  // Initialize state
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Record<keyof T, string | null>>(
    Object.keys(initialValues).reduce(
      (acc, key) => {
        acc[key as keyof T] = null;
        return acc;
      },
      {} as Record<keyof T, string | null>
    )
  );
  const [touched, setTouched] = useState<Record<keyof T, boolean>>(
    Object.keys(initialValues).reduce(
      (acc, key) => {
        acc[key as keyof T] = false;
        return acc;
      },
      {} as Record<keyof T, boolean>
    )
  );
  
  // Validate a single field
  const validateField = useCallback(
    (field: keyof T): boolean => {
      const config = initialConfig[field];
      const rules = config.rules || [];
      
      for (const rule of rules) {
        const error = rule(values[field]);
        if (error) {
          setErrors(prev => ({ ...prev, [field]: error }));
          return false;
        }
      }
      
      setErrors(prev => ({ ...prev, [field]: null }));
      return true;
    },
    [initialConfig, values]
  );
  
  // Validate all fields
  const validateAll = useCallback((): boolean => {
    let isValid = true;
    
    Object.keys(initialConfig).forEach(key => {
      const field = key as keyof T;
      const fieldIsValid = validateField(field);
      
      // Mark all fields as touched
      setTouched(prev => ({ ...prev, [field]: true }));
      
      if (!fieldIsValid) {
        isValid = false;
      }
    });
    
    return isValid;
  }, [initialConfig, validateField]);
  
  // Handle field change
  const handleChange = useCallback(
    (field: keyof T, value: any) => {
      setValues(prev => ({ ...prev, [field]: value }));
      
      // If field has been touched, validate on change
      if (touched[field]) {
        validateField(field);
      }
    },
    [touched, validateField]
  );
  
  // Handle field blur
  const handleBlur = useCallback(
    (field: keyof T) => {
      setTouched(prev => ({ ...prev, [field]: true }));
      validateField(field);
    },
    [validateField]
  );
  
  // Set field value directly
  const setFieldValue = useCallback(
    (field: keyof T, value: any) => {
      setValues(prev => ({ ...prev, [field]: value }));
    },
    []
  );
  
  // Reset form to initial values
  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors(
      Object.keys(initialValues).reduce(
        (acc, key) => {
          acc[key as keyof T] = null;
          return acc;
        },
        {} as Record<keyof T, string | null>
      )
    );
    setTouched(
      Object.keys(initialValues).reduce(
        (acc, key) => {
          acc[key as keyof T] = false;
          return acc;
        },
        {} as Record<keyof T, boolean>
      )
    );
  }, [initialValues]);
  
  // Check if form is valid
  const isValid = useMemo(() => {
    return Object.values(errors).every(error => error === null);
  }, [errors]);
  
  return {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    isValid,
    validateField,
    validateAll,
    resetForm,
    setFieldValue
  };
}

// Common validation rules
export const validationRules = {
  required: (message: string = 'Este campo é obrigatório') => 
    (value: any) => {
      if (value === undefined || value === null || value === '') {
        return message;
      }
      return null;
    },
  
  minLength: (length: number, message?: string) => 
    (value: string) => {
      if (value && value.length < length) {
        return message || `Deve ter pelo menos ${length} caracteres`;
      }
      return null;
    },
  
  maxLength: (length: number, message?: string) => 
    (value: string) => {
      if (value && value.length > length) {
        return message || `Deve ter no máximo ${length} caracteres`;
      }
      return null;
    },
  
  email: (message: string = 'Email inválido') => 
    (value: string) => {
      if (value && !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(value)) {
        return message;
      }
      return null;
    },
  
  phone: (message: string = 'Telefone inválido') => 
    (value: string) => {
      if (value && !/^\(\d{2}\) \d{5}-\d{4}$/.test(value)) {
        return message;
      }
      return null;
    },
  
  numeric: (message: string = 'Deve conter apenas números') => 
    (value: string) => {
      if (value && !/^\d+$/.test(value)) {
        return message;
      }
      return null;
    },
  
  decimal: (message: string = 'Valor decimal inválido') => 
    (value: string) => {
      if (value && !/^\d+(\.\d{1,2})?$/.test(value)) {
        return message;
      }
      return null;
    },
  
  min: (min: number, message?: string) => 
    (value: number) => {
      if (value !== undefined && value !== null && value < min) {
        return message || `Deve ser maior ou igual a ${min}`;
      }
      return null;
    },
  
  max: (max: number, message?: string) => 
    (value: number) => {
      if (value !== undefined && value !== null && value > max) {
        return message || `Deve ser menor ou igual a ${max}`;
      }
      return null;
    }
};
