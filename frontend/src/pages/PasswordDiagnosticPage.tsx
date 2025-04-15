import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  TextField,
  Grid,
  Alert,
  List,
  ListItem,
  ListItemText,
  Divider,
  Card,
  CardContent,
  IconButton,
  Tooltip,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import UserPasswordService from '../services/UserPasswordService';
import { useUsers } from '../contexts/UserContext';

const PasswordDiagnosticPage: React.FC = () => {
  const { users } = useUsers();
  const [storedPasswords, setStoredPasswords] = useState<Record<string, string>>({});
  const [testEmail, setTestEmail] = useState('');
  const [testPassword, setTestPassword] = useState('');
  const [testResult, setTestResult] = useState<boolean | null>(null);
  const [showPasswords, setShowPasswords] = useState(false);

  useEffect(() => {
    refreshPasswords();
  }, []);

  const refreshPasswords = () => {
    const passwords = UserPasswordService.getPasswords();
    setStoredPasswords(passwords);
  };

  const handleResetAllPasswords = () => {
    if (window.confirm('Tem certeza que deseja redefinir TODAS as senhas para os valores padrão? Esta ação não pode ser desfeita.')) {
      UserPasswordService.resetAllPasswords();
      refreshPasswords();
      setTestResult(null);
      setTestEmail('');
      setTestPassword('');
    }
  };

  const handleTestPassword = () => {
    if (!testEmail || !testPassword) {
      return;
    }

    const result = UserPasswordService.verifyPassword(testEmail, testPassword);
    setTestResult(result);
  };

  const handleResetPassword = (email: string) => {
    let defaultPassword = 'operador123';

    if (email === 'admin@sistema.com') {
      defaultPassword = 'admin123';
    } else if (email === 'supervisor@sistema.com') {
      defaultPassword = 'supervisor123';
    } else if (email === 'vendedor@sistema.com' || email === 'maria@wolf.com') {
      defaultPassword = 'vendedor123';
    }

    UserPasswordService.setPassword(email, defaultPassword);
    refreshPasswords();
  };

  const toggleShowPasswords = () => {
    setShowPasswords(!showPasswords);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Diagnóstico de Senhas
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, mb: 3, borderRadius: '12px' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Senhas Armazenadas</Typography>
              <Box>
                <Tooltip title={showPasswords ? "Ocultar senhas" : "Mostrar senhas"}>
                  <IconButton onClick={toggleShowPasswords} size="small">
                    {showPasswords ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                </Tooltip>
                <Tooltip title="Atualizar">
                  <IconButton onClick={refreshPasswords} size="small">
                    <RefreshIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Button
                variant="outlined"
                color="error"
                size="small"
                onClick={handleResetAllPasswords}
                startIcon={<RefreshIcon />}
              >
                Redefinir Todas as Senhas
              </Button>
              <Typography variant="caption" color="text.secondary">
                Restaura todas as senhas para os valores padrão
              </Typography>
            </Box>

            {Object.keys(storedPasswords).length === 0 ? (
              <Alert severity="info" sx={{ mb: 2 }}>
                Nenhuma senha personalizada armazenada. Os usuários estão usando as senhas padrão.
              </Alert>
            ) : (
              <List>
                {Object.entries(storedPasswords).map(([email, password]) => (
                  <ListItem
                    key={email}
                    secondaryAction={
                      <Tooltip title="Redefinir para senha padrão">
                        <IconButton edge="end" onClick={() => handleResetPassword(email)}>
                          <RefreshIcon />
                        </IconButton>
                      </Tooltip>
                    }
                  >
                    <ListItemText
                      primary={email}
                      secondary={showPasswords ? password : '••••••••'}
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </Paper>

          <Paper sx={{ p: 3, borderRadius: '12px' }}>
            <Typography variant="h6" gutterBottom>
              Testar Senha
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Senha"
                  type={showPasswords ? "text" : "password"}
                  value={testPassword}
                  onChange={(e) => setTestPassword(e.target.value)}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12}>
                <Button
                  variant="contained"
                  onClick={handleTestPassword}
                  disabled={!testEmail || !testPassword}
                >
                  Testar
                </Button>
              </Grid>
              {testResult !== null && (
                <Grid item xs={12}>
                  <Alert
                    severity={testResult ? "success" : "error"}
                    icon={testResult ? <CheckCircleIcon /> : <CancelIcon />}
                  >
                    {testResult
                      ? "Senha válida! O login seria bem-sucedido."
                      : "Senha inválida! O login seria rejeitado."}
                  </Alert>
                </Grid>
              )}
            </Grid>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: '12px' }}>
            <Typography variant="h6" gutterBottom>
              Usuários do Sistema
            </Typography>
            <List>
              {users.map((user) => {
                const hasCustomPassword = Object.keys(storedPasswords).includes(user.email.toLowerCase());
                return (
                  <ListItem
                    key={user.id}
                    secondaryAction={
                      <Tooltip title={hasCustomPassword ? "Senha personalizada" : "Senha padrão"}>
                        <IconButton edge="end" color={hasCustomPassword ? "primary" : "default"}>
                          {hasCustomPassword ? <CheckCircleIcon /> : <RefreshIcon />}
                        </IconButton>
                      </Tooltip>
                    }
                  >
                    <ListItemText
                      primary={user.nome}
                      secondary={
                        <>
                          {user.email}
                          <br />
                          <Typography variant="caption" color="textSecondary">
                            Papéis: {user.papeis.join(', ')}
                          </Typography>
                        </>
                      }
                    />
                  </ListItem>
                );
              })}
            </List>
          </Paper>

          <Paper sx={{ p: 3, mt: 3, borderRadius: '12px' }}>
            <Typography variant="h6" gutterBottom>
              Informações de Senhas Padrão
            </Typography>
            <List>
              <ListItem>
                <ListItemText primary="Admin" secondary="admin123" />
              </ListItem>
              <ListItem>
                <ListItemText primary="Supervisor" secondary="supervisor123" />
              </ListItem>
              <ListItem>
                <ListItemText primary="Operadores" secondary="operador123" />
              </ListItem>
              <ListItem>
                <ListItemText primary="Vendedores" secondary="vendedor123" />
              </ListItem>
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default PasswordDiagnosticPage;
