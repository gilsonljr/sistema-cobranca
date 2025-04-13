import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook for handling localStorage with type safety
 * @param key The localStorage key
 * @param initialValue The initial value
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void, () => void] {
  // Get from localStorage or use initialValue
  const readValue = useCallback((): T => {
    if (typeof window === 'undefined') {
      return initialValue;
    }
    
    try {
      const item = window.localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  }, [initialValue, key]);
  
  // State to store our value
  const [storedValue, setStoredValue] = useState<T>(readValue);
  
  // Return a wrapped version of useState's setter function that
  // persists the new value to localStorage
  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      if (typeof window === 'undefined') {
        console.warn(
          `Tried setting localStorage key "${key}" even though environment is not a browser`
        );
        return;
      }
      
      try {
        // Allow value to be a function so we have the same API as useState
        const valueToStore =
          value instanceof Function ? value(storedValue) : value;
        
        // Save state
        setStoredValue(valueToStore);
        
        // Save to localStorage
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
        
        // Dispatch a custom event so other instances can update
        window.dispatchEvent(new Event('local-storage'));
      } catch (error) {
        console.warn(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key, storedValue]
  );
  
  // Remove from localStorage
  const removeValue = useCallback(() => {
    if (typeof window === 'undefined') {
      console.warn(
        `Tried removing localStorage key "${key}" even though environment is not a browser`
      );
      return;
    }
    
    try {
      // Remove from localStorage
      window.localStorage.removeItem(key);
      
      // Reset state
      setStoredValue(initialValue);
      
      // Dispatch a custom event so other instances can update
      window.dispatchEvent(new Event('local-storage'));
    } catch (error) {
      console.warn(`Error removing localStorage key "${key}":`, error);
    }
  }, [initialValue, key]);
  
  // Listen for changes to this localStorage key in other documents
  useEffect(() => {
    const handleStorageChange = () => {
      setStoredValue(readValue());
    };
    
    // Listen for the custom event
    window.addEventListener('local-storage', handleStorageChange);
    
    // Listen for the storage event (when localStorage changes in other windows)
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('local-storage', handleStorageChange);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [readValue]);
  
  return [storedValue, setValue, removeValue];
}
