import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemText,
  Button,
  TextField,
  Alert,
  Chip,
  Card,
  CardContent,
  IconButton,
  Tooltip,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import LockIcon from '@mui/icons-material/Lock';
import EmailIcon from '@mui/icons-material/Email';
import PersonIcon from '@mui/icons-material/Person';
import BadgeIcon from '@mui/icons-material/Badge';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import AuthService from '../services/AuthService';
import UserSyncService from '../services/UserSyncService';
import { useUsers } from '../contexts/UserContext';
import { User, UserInput } from '../types/User';
import { convertToUserManagerFormat } from '../utils/userUtils';

interface UserInfo {
  id: number;
  email: string;
  fullName: string;
  role: string;
}

const ProfilePage: React.FC = () => {
  const { currentUser, updateUser } = useUsers();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<UserInput>({
    email: '',
    full_name: '',
    role: 'collector',
    is_active: true
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (currentUser) {
      setFormData({
        email: currentUser.email,
        full_name: currentUser.full_name,
        role: currentUser.role,
        is_active: currentUser.is_active
      });
    }
  }, [currentUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!currentUser) {
        throw new Error('No user logged in');
      }

      // Update user in UserStore
      await updateUser(currentUser.id, formData);

      // Convert to UserManager format for sync
      const userManagerFormat = convertToUserManagerFormat({
        ...currentUser,
        ...formData
      });

      // Update logged user
      UserSyncService.updateLoggedUser(userManagerFormat);

      setIsEditing(false);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = () => {
    setIsEditing(true);
    setError('');
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    if (currentUser) {
      setFormData({
        email: currentUser.email,
        full_name: currentUser.full_name,
        role: currentUser.role,
        is_active: currentUser.is_active
      });
    }
    setError('');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <AdminPanelSettingsIcon fontSize="large" color="primary" />;
      case 'supervisor':
        return <SupervisorAccountIcon fontSize="large" color="info" />;
      case 'collector':
        return <SupportAgentIcon fontSize="large" color="success" />;
      case 'seller':
        return <PersonOutlineIcon fontSize="large" color="warning" />;
      default:
        return <PersonIcon fontSize="large" />;
    }
  };

  const getRoleName = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Administrador';
      case 'supervisor':
        return 'Supervisor';
      case 'collector':
        return 'Operador';
      case 'seller':
        return 'Vendedor';
      default:
        return role;
    }
  };

  if (!currentUser) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          Não foi possível carregar as informações do usuário. Por favor, faça login novamente.
        </Alert>
        <Button
          variant="contained"
          sx={{ mt: 2 }}
          onClick={() => AuthService.logout()}
        >
          Voltar para o Login
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Meu Perfil
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Cartão de perfil */}
        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: '12px', overflow: 'hidden' }}>
            <Box
              sx={{
                bgcolor: 'primary.main',
                color: 'white',
                p: 3,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
              }}
            >
              <Avatar
                sx={{
                  width: 100,
                  height: 100,
                  bgcolor: 'white',
                  color: 'primary.main',
                  fontSize: '2.5rem',
                  fontWeight: 'bold',
                  mb: 2
                }}
              >
                {currentUser.full_name.charAt(0).toUpperCase()}
              </Avatar>
              <Typography variant="h5" sx={{ fontWeight: 500 }}>
                {currentUser.full_name}
              </Typography>
              <Chip
                label={getRoleName(currentUser.role)}
                color="default"
                sx={{
                  bgcolor: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  mt: 1,
                  fontWeight: 500
                }}
              />
            </Box>
            <CardContent>
              <List>
                <ListItem>
                  <EmailIcon sx={{ mr: 2, color: 'text.secondary' }} />
                  <ListItemText
                    primary="Email"
                    secondary={currentUser.email}
                  />
                </ListItem>
                <ListItem>
                  <BadgeIcon sx={{ mr: 2, color: 'text.secondary' }} />
                  <ListItemText
                    primary="ID do Usuário"
                    secondary={currentUser.id}
                  />
                </ListItem>
                <ListItem>
                  {getRoleIcon(currentUser.role)}
                  <Box sx={{ ml: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Função
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {getRoleName(currentUser.role)}
                    </Typography>
                  </Box>
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Informações detalhadas */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, borderRadius: '12px' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Informações do Usuário
              </Typography>
              {!isEditing ? (
                <Tooltip title="Editar informações">
                  <span>
                    <IconButton
                      color="primary"
                      onClick={handleEditClick}
                    >
                      <EditIcon />
                    </IconButton>
                  </span>
                </Tooltip>
              ) : (
                <Box>
                  <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    onClick={handleCancelEdit}
                    sx={{ mr: 1 }}
                  >
                    Cancelar
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    size="small"
                    onClick={handleSubmit}
                  >
                    Salvar
                  </Button>
                </Box>
              )}
            </Box>

            <Divider sx={{ mb: 3 }} />

            {isEditing ? (
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Nome Completo"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleInputChange}
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    variant="outlined"
                  />
                </Grid>
              </Grid>
            ) : (
              <List>
                <ListItem>
                  <ListItemText
                    primary="Nome Completo"
                    secondary={currentUser.full_name}
                    primaryTypographyProps={{ color: 'text.secondary', variant: 'body2' }}
                    secondaryTypographyProps={{ color: 'text.primary', variant: 'body1', fontWeight: 500 }}
                  />
                </ListItem>
                <Divider component="li" />
                <ListItem>
                  <ListItemText
                    primary="Email"
                    secondary={currentUser.email}
                    primaryTypographyProps={{ color: 'text.secondary', variant: 'body2' }}
                    secondaryTypographyProps={{ color: 'text.primary', variant: 'body1', fontWeight: 500 }}
                  />
                </ListItem>
                <Divider component="li" />
                <ListItem>
                  <ListItemText
                    primary="Função"
                    secondary={getRoleName(currentUser.role)}
                    primaryTypographyProps={{ color: 'text.secondary', variant: 'body2' }}
                    secondaryTypographyProps={{ color: 'text.primary', variant: 'body1', fontWeight: 500 }}
                  />
                </ListItem>
              </List>
            )}

            {!isEditing && (
              <>
                <Divider sx={{ my: 3 }} />

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <LockIcon sx={{ mr: 2, color: 'text.secondary' }} />
                  <Typography variant="h6">
                    Segurança
                  </Typography>
                </Box>

                <Alert severity="info" sx={{ mb: 2 }}>
                  A alteração de senha só pode ser realizada por um administrador do sistema.
                </Alert>

                <Typography variant="body2" color="text.secondary">
                  Para solicitar uma alteração de senha, entre em contato com o administrador do sistema.
                </Typography>
              </>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ProfilePage;
