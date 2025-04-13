import React, { useState } from 'react';
import { Box, Container, Typography, TextField, Button, Paper, Alert, CircularProgress, Link } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AuthService from '../services/AuthService';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    console.log('Login attempt with:', formData.email, formData.password);

    // TEMPORARY FIX: Direct login for testing
    // Admin login
    if (formData.email === 'admin@sistema.com' && formData.password === 'admin123') {
      console.log('Direct admin login!');
      localStorage.setItem('userInfo', JSON.stringify({
        id: 1,
        email: 'admin@sistema.com',
        fullName: 'Admin',
        role: 'admin'
      }));

      localStorage.setItem('authTokens', JSON.stringify({
        access_token: 'mock-admin-token',
        refresh_token: 'mock-admin-refresh-token',
        token_type: 'bearer'
      }));

      navigate('/');
      return;
    }

    // Supervisor login
    if (formData.email === 'supervisor@sistema.com' && formData.password === 'supervisor123') {
      console.log('Direct supervisor login!');
      localStorage.setItem('userInfo', JSON.stringify({
        id: 2,
        email: 'supervisor@sistema.com',
        fullName: 'Supervisor',
        role: 'supervisor'
      }));

      localStorage.setItem('authTokens', JSON.stringify({
        access_token: 'mock-supervisor-token',
        refresh_token: 'mock-supervisor-refresh-token',
        token_type: 'bearer'
      }));

      navigate('/');
      return;
    }

    // Operador login
    if (formData.email === 'operador@sistema.com' && formData.password === 'operador123') {
      console.log('Direct operador login!');
      localStorage.setItem('userInfo', JSON.stringify({
        id: 3,
        email: 'operador@sistema.com',
        fullName: 'Operador',
        role: 'collector'
      }));

      localStorage.setItem('authTokens', JSON.stringify({
        access_token: 'mock-operator-token',
        refresh_token: 'mock-operator-refresh-token',
        token_type: 'bearer'
      }));

      navigate('/');
      return;
    }

    // Vendedor login
    if (formData.email === 'vendedor@sistema.com' && formData.password === 'vendedor123') {
      console.log('Direct vendedor login!');
      localStorage.setItem('userInfo', JSON.stringify({
        id: 4,
        email: 'vendedor@sistema.com',
        fullName: 'Vendedor',
        role: 'seller'
      }));

      localStorage.setItem('authTokens', JSON.stringify({
        access_token: 'mock-seller-token',
        refresh_token: 'mock-seller-refresh-token',
        token_type: 'bearer'
      }));

      navigate('/');
      return;
    }

    try {
      console.log('Calling AuthService.login...');
      await AuthService.login({
        email: formData.email,
        password: formData.password
      });
      console.log('Login successful!');

      // Navigate to dashboard on successful login
      navigate('/');
    } catch (err: any) {
      console.error('Login error:', err);
      console.error('Error details:', err.message, err.stack);
      setError(err.response?.data?.detail || 'Credenciais inválidas. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      await AuthService.requestPasswordReset(resetEmail);
      setError('');
      alert('Se o email existir no sistema, você receberá um link para redefinir sua senha.');
      setShowForgotPassword(false);
    } catch (err: any) {
      console.error('Password reset error:', err);
      setError('Erro ao solicitar redefinição de senha. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const fillAdminCredentials = () => {
    setFormData({
      email: 'admin@sistema.com',
      password: 'admin123'
    });
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
          <Typography component="h1" variant="h5" align="center" gutterBottom>
            Sistema de Cobrança Inteligente
          </Typography>

          <Alert severity="info" sx={{ mb: 3 }}>
            Use as credenciais de administrador:
            <Box sx={{ mt: 1 }}>
              <strong>Email:</strong> admin@sistema.com
              <br />
              <strong>Senha:</strong> admin123
              <br />
              <Link
                component="button"
                variant="body2"
                onClick={fillAdminCredentials}
                sx={{ mt: 1 }}
              >
                Preencher automaticamente
              </Link>
            </Box>
          </Alert>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email"
              name="email"
              autoComplete="email"
              autoFocus
              value={formData.email}
              onChange={handleChange}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Senha"
              type="password"
              id="password"
              autoComplete="current-password"
              value={formData.password}
              onChange={handleChange}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Entrar'}
            </Button>

            {!showForgotPassword ? (
              <Box sx={{ textAlign: 'center' }}>
                <Link
                  component="button"
                  variant="body2"
                  onClick={() => setShowForgotPassword(true)}
                >
                  Esqueceu sua senha?
                </Link>
              </Box>
            ) : (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Redefinir Senha
                </Typography>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="reset-email"
                  label="Email"
                  name="reset-email"
                  autoComplete="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                  <Button
                    variant="outlined"
                    onClick={() => setShowForgotPassword(false)}
                    disabled={loading}
                  >
                    Cancelar
                  </Button>
                  <Button
                    variant="contained"
                    onClick={handleForgotPassword}
                    disabled={loading || !resetEmail}
                  >
                    {loading ? <CircularProgress size={24} /> : 'Enviar'}
                  </Button>
                </Box>
              </Box>
            )}
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default LoginPage;