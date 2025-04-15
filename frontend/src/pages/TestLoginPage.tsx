import React, { useState } from 'react';
import { Box, Button, Container, Paper, TextField, Typography } from '@mui/material';
import AuthService from '../services/AuthService';

const TestLoginPage: React.FC = () => {
  const [result, setResult] = useState<string>('');

  const testAdminLogin = async () => {
    try {
      setResult('Testing admin login...');
      const tokens = await AuthService.login({
        email: 'admin@sistema.com',
        password: 'admin123'
      });
      setResult(`Success! Tokens: ${JSON.stringify(tokens)}`);
    } catch (error: any) {
      setResult(`Error: ${error.message}`);
    }
  };

  const testSupervisorLogin = async () => {
    try {
      setResult('Testing supervisor login...');
      const tokens = await AuthService.login({
        email: 'supervisor@sistema.com',
        password: 'supervisor123'
      });
      setResult(`Success! Tokens: ${JSON.stringify(tokens)}`);
    } catch (error: any) {
      setResult(`Error: ${error.message}`);
    }
  };

  const testOperadorLogin = async () => {
    try {
      setResult('Testing operador login...');
      const tokens = await AuthService.login({
        email: 'operador@sistema.com',
        password: 'operador123'
      });
      setResult(`Success! Tokens: ${JSON.stringify(tokens)}`);
    } catch (error: any) {
      setResult(`Error: ${error.message}`);
    }
  };

  const testJoaoLogin = async () => {
    try {
      setResult('Testing João Silva login...');
      const tokens = await AuthService.login({
        email: 'joao@wolf.com',
        password: 'operador123'
      });
      setResult(`Success! Tokens: ${JSON.stringify(tokens)}`);
    } catch (error: any) {
      setResult(`Error: ${error.message}`);
    }
  };

  const testAnaLogin = async () => {
    try {
      setResult('Testing Ana Souza login...');
      const tokens = await AuthService.login({
        email: 'ana@wolf.com',
        password: 'operador123'
      });
      setResult(`Success! Tokens: ${JSON.stringify(tokens)}`);
    } catch (error: any) {
      setResult(`Error: ${error.message}`);
    }
  };

  const testLudimilaLogin = async () => {
    try {
      setResult('Testing Ludimila login...');
      const tokens = await AuthService.login({
        email: 'ludimila@wolf.com',
        password: 'operador123'
      });
      setResult(`Success! Tokens: ${JSON.stringify(tokens)}`);
    } catch (error: any) {
      setResult(`Error: ${error.message}`);
    }
  };

  const testCarlosLogin = async () => {
    try {
      setResult('Testing Carlos Ferreira login...');
      const tokens = await AuthService.login({
        email: 'carlos@wolf.com',
        password: 'operador123'
      });
      setResult(`Success! Tokens: ${JSON.stringify(tokens)}`);
    } catch (error: any) {
      setResult(`Error: ${error.message}`);
    }
  };

  const testPedroLogin = async () => {
    try {
      setResult('Testing Pedro Santos login...');
      const tokens = await AuthService.login({
        email: 'pedro@wolf.com',
        password: 'operador123'
      });
      setResult(`Success! Tokens: ${JSON.stringify(tokens)}`);
    } catch (error: any) {
      setResult(`Error: ${error.message}`);
    }
  };

  const testVendedorLogin = async () => {
    try {
      setResult('Testing vendedor login...');
      const tokens = await AuthService.login({
        email: 'vendedor@sistema.com',
        password: 'vendedor123'
      });
      setResult(`Success! Tokens: ${JSON.stringify(tokens)}`);
    } catch (error: any) {
      setResult(`Error: ${error.message}`);
    }
  };

  const testMariaLogin = async () => {
    try {
      setResult('Testing Maria Oliveira login...');
      const tokens = await AuthService.login({
        email: 'maria@wolf.com',
        password: 'vendedor123'
      });
      setResult(`Success! Tokens: ${JSON.stringify(tokens)}`);
    } catch (error: any) {
      setResult(`Error: ${error.message}`);
    }
  };

  const checkMockMode = () => {
    setResult(`REACT_APP_MOCK_API: ${process.env.REACT_APP_MOCK_API}`);
  };

  const checkLocalStorage = () => {
    const authTokens = localStorage.getItem('authTokens');
    const userInfo = localStorage.getItem('userInfo');
    setResult(`LocalStorage:\nAuthTokens: ${authTokens}\nUserInfo: ${userInfo}`);
  };

  const clearLocalStorage = () => {
    localStorage.removeItem('authTokens');
    localStorage.removeItem('userInfo');
    setResult('LocalStorage cleared');
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          Login Test Page
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Usuários Padrão
          </Typography>
          <Button variant="contained" onClick={testAdminLogin}>
            Test Admin Login
          </Button>
          <Button variant="contained" onClick={testSupervisorLogin}>
            Test Supervisor Login
          </Button>
          <Button variant="contained" onClick={testOperadorLogin}>
            Test Operador Login
          </Button>
          <Button variant="contained" onClick={testVendedorLogin}>
            Test Vendedor Login
          </Button>

          <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
            Operadores
          </Typography>
          <Button variant="contained" color="success" onClick={testJoaoLogin}>
            Test João Silva Login
          </Button>
          <Button variant="contained" color="success" onClick={testAnaLogin}>
            Test Ana Souza Login
          </Button>
          <Button variant="contained" color="success" onClick={testLudimilaLogin}>
            Test Ludimila Login
          </Button>
          <Button variant="contained" color="success" onClick={testCarlosLogin}>
            Test Carlos Ferreira Login
          </Button>
          <Button variant="contained" color="success" onClick={testPedroLogin}>
            Test Pedro Santos Login
          </Button>

          <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
            Vendedores
          </Typography>
          <Button variant="contained" color="secondary" onClick={testMariaLogin}>
            Test Maria Oliveira Login
          </Button>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 4 }}>
          <Button variant="outlined" onClick={checkMockMode}>
            Check Mock Mode
          </Button>
          <Button variant="outlined" onClick={checkLocalStorage}>
            Check LocalStorage
          </Button>
          <Button variant="outlined" onClick={clearLocalStorage}>
            Clear LocalStorage
          </Button>
        </Box>

        <Typography variant="h5" gutterBottom>
          Result:
        </Typography>
        <Paper
          variant="outlined"
          sx={{
            p: 2,
            whiteSpace: 'pre-wrap',
            fontFamily: 'monospace',
            minHeight: '200px'
          }}
        >
          {result}
        </Paper>
      </Paper>
    </Container>
  );
};

export default TestLoginPage;
