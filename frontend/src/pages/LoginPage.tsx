import React, { useState, useEffect } from 'react';
import { Box, Container, Typography, TextField, Button, Paper, Alert, CircularProgress, Link } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AuthService from '../services/AuthService';
import UserPasswordService from '../services/UserPasswordService';

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
  const [showDebugOptions, setShowDebugOptions] = useState(false);

  // Inicializar o serviço de senhas quando a página é carregada
  useEffect(() => {
    UserPasswordService.initialize();
  }, []);

  const handleResetAllPasswords = () => {
    if (window.confirm('Tem certeza que deseja redefinir TODAS as senhas para os valores padrão? Esta ação não pode ser desfeita.')) {
      UserPasswordService.resetAllPasswords();
      alert('Todas as senhas foram redefinidas para os valores padrão.');
    }
  };

  const toggleDebugOptions = () => {
    setShowDebugOptions(!showDebugOptions);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Função auxiliar para navegar após o login
  const navigateAfterLogin = () => {
    // Adicionar um pequeno atraso para garantir que o localStorage seja atualizado
    setTimeout(() => {
      navigate('/');
    }, 100);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    console.log('Login attempt with:', formData.email, formData.password);

    // Verificar se já existe um token de autenticação e removê-lo para evitar conflitos
    localStorage.removeItem('authTokens');
    localStorage.removeItem('userInfo');

    // Verificar se as credenciais são válidas usando o serviço de senhas de emergência
    console.log(`Tentando login com email: ${formData.email}, senha: ${formData.password}`);

    // Verificar se o serviço de emergência está disponível
    if (window.PasswordFixService) {
      console.log('Usando serviço de emergência para verificar credenciais');
      const result = window.PasswordFixService.checkCredentials(formData.email, formData.password);
      console.log('Resultado da verificação de emergência:', result);

      if (!result.valid) {
        setError('Credenciais inválidas. Por favor, tente novamente.');
        setLoading(false);
        return;
      }
    } else {
      // Fallback para o serviço original
      console.log('Serviço de emergência não disponível, usando serviço padrão');

      // Verificar todas as senhas armazenadas para debug
      const allPasswords = UserPasswordService.getAllPasswords();
      console.log('Todas as senhas armazenadas:', allPasswords);

      const isValid = UserPasswordService.verifyPassword(formData.email, formData.password);
      console.log(`Resultado da verificação de senha: ${isValid}`);

      if (!isValid) {
        setError('Credenciais inválidas. Por favor, tente novamente.');
        setLoading(false);
        return;
      }
    }

    // Login baseado no tipo de usuário
    // Admin login
    if (formData.email.toLowerCase() === 'admin@sistema.com') {
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

      navigateAfterLogin();
      return;
    }

    // Supervisor login
    if (formData.email.toLowerCase() === 'supervisor@sistema.com') {
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

      navigateAfterLogin();
      return;
    }

    // Operador login - padrão
    if (formData.email.toLowerCase() === 'operador@sistema.com') {
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

      navigateAfterLogin();
      return;
    }

    // João Silva (Operador)
    if (formData.email.toLowerCase() === 'joao@wolf.com') {
      console.log('João Silva login!');
      localStorage.setItem('userInfo', JSON.stringify({
        id: 101,
        email: 'joao@wolf.com',
        fullName: 'João Silva',
        role: 'collector'
      }));

      localStorage.setItem('authTokens', JSON.stringify({
        access_token: 'mock-joao-token',
        refresh_token: 'mock-joao-refresh-token',
        token_type: 'bearer'
      }));

      navigateAfterLogin();
      return;
    }

    // Ana Souza (Operador)
    if (formData.email.toLowerCase() === 'ana@wolf.com') {
      console.log('Ana Souza login!');
      localStorage.setItem('userInfo', JSON.stringify({
        id: 102,
        email: 'ana@wolf.com',
        fullName: 'Ana Souza',
        role: 'collector'
      }));

      localStorage.setItem('authTokens', JSON.stringify({
        access_token: 'mock-ana-token',
        refresh_token: 'mock-ana-refresh-token',
        token_type: 'bearer'
      }));

      navigateAfterLogin();
      return;
    }

    // Ludimila (Operador)
    if (formData.email.toLowerCase() === 'ludimila@wolf.com') {
      console.log('Ludimila login!');
      localStorage.setItem('userInfo', JSON.stringify({
        id: 104,
        email: 'ludimila@wolf.com',
        fullName: 'Ludimila',
        role: 'collector'
      }));

      localStorage.setItem('authTokens', JSON.stringify({
        access_token: 'mock-ludimila-token',
        refresh_token: 'mock-ludimila-refresh-token',
        token_type: 'bearer'
      }));

      navigateAfterLogin();
      return;
    }

    // Carlos Ferreira (Operador)
    if (formData.email.toLowerCase() === 'carlos@wolf.com') {
      console.log('Carlos Ferreira login!');
      localStorage.setItem('userInfo', JSON.stringify({
        id: 105,
        email: 'carlos@wolf.com',
        fullName: 'Carlos Ferreira',
        role: 'collector'
      }));

      localStorage.setItem('authTokens', JSON.stringify({
        access_token: 'mock-carlos-token',
        refresh_token: 'mock-carlos-refresh-token',
        token_type: 'bearer'
      }));

      navigateAfterLogin();
      return;
    }

    // Pedro Santos (Operador)
    if (formData.email.toLowerCase() === 'pedro@wolf.com') {
      console.log('Pedro Santos login!');
      localStorage.setItem('userInfo', JSON.stringify({
        id: 106,
        email: 'pedro@wolf.com',
        fullName: 'Pedro Santos',
        role: 'collector'
      }));

      localStorage.setItem('authTokens', JSON.stringify({
        access_token: 'mock-pedro-token',
        refresh_token: 'mock-pedro-refresh-token',
        token_type: 'bearer'
      }));

      navigateAfterLogin();
      return;
    }

    // Vendedor login - padrão
    if (formData.email.toLowerCase() === 'vendedor@sistema.com') {
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

      navigateAfterLogin();
      return;
    }

    // Maria Oliveira (Vendedor)
    if (formData.email.toLowerCase() === 'maria@wolf.com') {
      console.log('Maria Oliveira login!');
      localStorage.setItem('userInfo', JSON.stringify({
        id: 103,
        email: 'maria@wolf.com',
        fullName: 'Maria Oliveira',
        role: 'seller'
      }));

      localStorage.setItem('authTokens', JSON.stringify({
        access_token: 'mock-maria-token',
        refresh_token: 'mock-maria-refresh-token',
        token_type: 'bearer'
      }));

      navigateAfterLogin();
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
      navigateAfterLogin();
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

                <Box sx={{ mt: 1 }}>
                  <Link
                    component="button"
                    variant="caption"
                    onClick={toggleDebugOptions}
                    sx={{ color: 'text.secondary', textDecoration: 'none', fontSize: '0.7rem' }}
                  >
                    {showDebugOptions ? 'Ocultar opções de debug' : 'Opções de debug'}
                  </Link>
                </Box>

                {showDebugOptions && (
                  <Box sx={{ mt: 1, p: 1, border: '1px dashed #ccc', borderRadius: 1 }}>
                    <Typography variant="caption" color="text.secondary" gutterBottom>
                      Opções de Diagnóstico
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 1 }}>
                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        onClick={handleResetAllPasswords}
                        sx={{ fontSize: '0.7rem' }}
                      >
                        Redefinir Todas as Senhas
                      </Button>

                      <Button
                        variant="outlined"
                        color="primary"
                        size="small"
                        onClick={() => window.open('/emergency-fix.html', '_blank')}
                        sx={{ fontSize: '0.7rem' }}
                      >
                        Ferramenta de Emergência
                      </Button>
                    </Box>
                  </Box>
                )}
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