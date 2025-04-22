import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Paper,
  Alert,
  CircularProgress,
  Link,
  IconButton,
  InputAdornment
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import UnifiedAuthService from '../services/UnifiedAuthService';
import UserManager from '../services/UserManager';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';

const UnifiedLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Inicializar o UserManager quando a página é carregada
  useEffect(() => {
    try {
      // Inicializar o UserManager
      UserManager.initialize();
      console.log('UserManager inicializado com sucesso');
    } catch (error) {
      console.error('Erro ao inicializar UserManager:', error);
      setError('Erro ao inicializar o sistema. Por favor, recarregue a página.');
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Limpar mensagens de erro quando o usuário digita
    if (error) setError('');
  };

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Função auxiliar para navegar após o login
  const navigateAfterLogin = () => {
    // Adicionar um pequeno atraso para garantir que o localStorage seja atualizado
    setTimeout(() => {
      navigate('/dashboard');
    }, 100);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log('Tentando login com:', formData.email);

      // Usar o UnifiedAuthService para login
      await UnifiedAuthService.login({
        email: formData.email,
        password: formData.password
      });

      console.log('Login bem-sucedido!');
      setSuccessMessage('Login bem-sucedido! Redirecionando...');

      // Navegar para o dashboard após login bem-sucedido
      navigateAfterLogin();
    } catch (err: any) {
      console.error('Erro no login:', err);
      setError(err.message || 'Credenciais inválidas. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Verificar se o email existe
      const user = UserManager.getUserByEmail(resetEmail);

      if (!user) {
        // Não informar ao usuário se o email existe ou não (segurança)
        setSuccessMessage('Se o email existir no sistema, você receberá instruções para redefinir sua senha.');
        setShowForgotPassword(false);
      } else {
        // Em um sistema real, enviaríamos um email com um link para redefinição de senha
        // Aqui, apenas redefinimos para uma senha padrão para demonstração
        UserManager.setPassword(resetEmail, 'senha123');
        setSuccessMessage(`Senha redefinida para o usuário ${resetEmail}. A nova senha é: senha123`);
        setShowForgotPassword(false);
      }
    } catch (err: any) {
      console.error('Erro ao redefinir senha:', err);
      setError('Erro ao processar a solicitação. Por favor, tente novamente.');
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
        <Paper elevation={3} sx={{ p: 4, width: '100%', borderRadius: '12px' }}>
          <Typography component="h1" variant="h5" align="center" gutterBottom>
            Sistema de Cobrança Inteligente
          </Typography>

          {!showForgotPassword ? (
            <>
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

              {successMessage && (
                <Alert severity="success" sx={{ mb: 2 }}>
                  {successMessage}
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
                  sx={{ mb: 2 }}
                />
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="password"
                  label="Senha"
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  autoComplete="current-password"
                  value={formData.password}
                  onChange={handleChange}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={handleTogglePasswordVisibility}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
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
                <Box sx={{ textAlign: 'center' }}>
                  <Link
                    component="button"
                    variant="body2"
                    onClick={() => setShowForgotPassword(true)}
                  >
                    Esqueceu sua senha?
                  </Link>
                </Box>
              </Box>
            </>
          ) : (
            <>
              <Typography variant="h6" gutterBottom>
                Redefinir Senha
              </Typography>

              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}

              {successMessage && (
                <Alert severity="success" sx={{ mb: 2 }}>
                  {successMessage}
                </Alert>
              )}

              <Box component="form" onSubmit={handleForgotPassword} sx={{ mt: 1 }}>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="resetEmail"
                  label="Email"
                  name="resetEmail"
                  autoComplete="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                />
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{ mt: 3, mb: 2 }}
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={24} /> : 'Enviar Link de Redefinição'}
                </Button>
                <Box sx={{ textAlign: 'center' }}>
                  <Link
                    component="button"
                    variant="body2"
                    onClick={() => setShowForgotPassword(false)}
                  >
                    Voltar para o login
                  </Link>
                </Box>
              </Box>
            </>
          )}
        </Paper>
      </Box>
    </Container>
  );
};

export default UnifiedLoginPage;
