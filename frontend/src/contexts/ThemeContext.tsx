import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ThemeProvider as MuiThemeProvider, createTheme, Theme, PaletteMode } from '@mui/material';
import { ptBR } from '@mui/material/locale';

// Define theme colors
const lightTheme = {
  primary: {
    main: '#1976d2',
    light: '#42a5f5',
    dark: '#1565c0',
    contrastText: '#fff',
  },
  secondary: {
    main: '#9c27b0',
    light: '#ba68c8',
    dark: '#7b1fa2',
    contrastText: '#fff',
  },
  background: {
    default: '#f5f5f5',
    paper: '#fff',
  },
};

const darkTheme = {
  primary: {
    main: '#90caf9',
    light: '#e3f2fd',
    dark: '#42a5f5',
    contrastText: '#000',
  },
  secondary: {
    main: '#ce93d8',
    light: '#f3e5f5',
    dark: '#ab47bc',
    contrastText: '#000',
  },
  background: {
    default: '#121212',
    paper: '#1e1e1e',
  },
};

// Create theme with mode
const createAppTheme = (mode: PaletteMode) => {
  const colors = mode === 'light' ? lightTheme : darkTheme;

  return createTheme(
    {
      palette: {
        mode,
        primary: colors.primary,
        secondary: colors.secondary,
        background: colors.background,
      },
      typography: {
        fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
      },
      components: {
        MuiButton: {
          styleOverrides: {
            root: {
              textTransform: 'none',
              borderRadius: 8,
              fontWeight: 500,
              boxShadow: 'none',
              '&:hover': {
                boxShadow: 'none',
              },
            },
            contained: {
              boxShadow: 'none',
              '&:hover': {
                boxShadow: 'none',
              },
            },
          },
        },
        MuiCard: {
          styleOverrides: {
            root: {
              borderRadius: 10,
              boxShadow: mode === 'light'
                ? '0px 1px 3px rgba(0, 0, 0, 0.05)'
                : '0px 1px 3px rgba(0, 0, 0, 0.2)',
              border: mode === 'light' ? '1px solid rgba(0, 0, 0, 0.05)' : 'none',
            },
          },
        },
        MuiPaper: {
          styleOverrides: {
            root: {
              borderRadius: 10,
              boxShadow: mode === 'light'
                ? '0px 1px 3px rgba(0, 0, 0, 0.05)'
                : '0px 1px 3px rgba(0, 0, 0, 0.2)',
            },
          },
        },
        MuiTableCell: {
          styleOverrides: {
            root: {
              borderBottom: mode === 'light' ? '1px solid rgba(0, 0, 0, 0.05)' : '1px solid rgba(255, 255, 255, 0.05)',
            },
            head: {
              fontWeight: 600,
              backgroundColor: mode === 'light' ? 'rgba(0, 0, 0, 0.02)' : 'rgba(255, 255, 255, 0.05)',
            },
          },
        },
        MuiChip: {
          styleOverrides: {
            root: {
              borderRadius: 8,
            },
          },
        },
      },
    },
    ptBR // Add Brazilian Portuguese localization
  );
};

// Theme context type
interface ThemeContextType {
  theme: Theme;
  mode: PaletteMode;
  toggleTheme: () => void;
  setMode: (mode: PaletteMode) => void;
}

// Create context
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Provider props
interface ThemeProviderProps {
  children: ReactNode;
}

// Theme provider
export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  // Get initial theme from localStorage or use light mode
  const [mode, setMode] = useState<PaletteMode>(() => {
    const savedMode = localStorage.getItem('themeMode');
    return (savedMode as PaletteMode) || 'light';
  });

  // Create theme based on mode
  const theme = createAppTheme(mode);

  // Toggle theme
  const toggleTheme = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  // Save theme mode to localStorage
  useEffect(() => {
    localStorage.setItem('themeMode', mode);
  }, [mode]);

  return (
    <ThemeContext.Provider value={{ theme, mode, toggleTheme, setMode }}>
      <MuiThemeProvider theme={theme}>{children}</MuiThemeProvider>
    </ThemeContext.Provider>
  );
};

// Hook to use theme context
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);

  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }

  return context;
};
