import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Paper,
  Alert,
  CircularProgress
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import AuthService from '../services/AuthService';

const PasswordResetPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [token, setToken] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  // Extract token from URL query parameters
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const tokenParam = searchParams.get('token');
    if (tokenParam) {
      setToken(tokenParam);
    } else {
      setError('Token de redefinição de senha não encontrado na URL.');
    }
  }, [location.search]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');

    // Validate passwords
    if (newPassword !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }

    if (newPassword.length < 8) {
      setError('A senha deve ter pelo menos 8 caracteres.');
      return;
    }

    setLoading(true);

    try {
      await AuthService.resetPassword({
        token,
        new_password: newPassword
      });
      setSuccess(true);

      // Redirect to login page after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err: any) {
      console.error('Password reset error:', err);
      setError(err.response?.data?.detail || 'Erro ao redefinir senha. O token pode ser inválido ou expirado.');
    } finally {
      setLoading(false);
    }
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
            Redefinir Senha
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {success ? (
            <Alert severity="success">
              Senha redefinida com sucesso! Você será redirecionado para a página de login em instantes.
            </Alert>
          ) : (
            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
              <TextField
                margin="normal"
                required
                fullWidth
                name="newPassword"
                label="Nova Senha"
                type="password"
                id="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={loading || !token}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="confirmPassword"
                label="Confirmar Nova Senha"
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading || !token}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                disabled={loading || !token || !newPassword || !confirmPassword}
              >
                {loading ? <CircularProgress size={24} /> : 'Redefinir Senha'}
              </Button>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => navigate('/login')}
              >
                Voltar para Login
              </Button>
            </Box>
          )}
        </Paper>
      </Box>
    </Container>
  );
};

export default PasswordResetPage;
