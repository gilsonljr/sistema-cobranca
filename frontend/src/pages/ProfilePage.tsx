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

interface UserInfo {
  id: number;
  email: string;
  fullName: string;
  role: string;
}

const ProfilePage: React.FC = () => {
  const { getUserByEmail, updateUser } = useUsers();
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    fullName: '',
    email: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    // Carregar informações do usuário
    const storedUserInfo = localStorage.getItem('userInfo');
    if (storedUserInfo) {
      const parsedUserInfo = JSON.parse(storedUserInfo);
      setUserInfo(parsedUserInfo);
      setIsAdmin(parsedUserInfo.role === 'admin');
      setEditForm({
        fullName: parsedUserInfo.fullName,
        email: parsedUserInfo.email,
      });
    }
  }, []);

  const handleEditClick = () => {
    if (!isAdmin) {
      setError('Apenas administradores podem editar informações de usuário.');
      return;
    }
    setIsEditing(true);
    setError('');
    setSuccess('');
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    if (userInfo) {
      setEditForm({
        fullName: userInfo.fullName,
        email: userInfo.email,
      });
    }
    setError('');
    setSuccess('');
  };

  const handleSaveEdit = () => {
    // Validação básica
    if (!editForm.fullName.trim() || !editForm.email.trim()) {
      setError('Todos os campos são obrigatórios.');
      return;
    }

    if (!userInfo) {
      setError('Informações do usuário não disponíveis. Por favor, faça login novamente.');
      return;
    }

    const oldEmail = userInfo.email;
    const newEmail = editForm.email;
    
    // Atualizar userInfo no state local e localStorage
    const updatedUserInfo = {
      ...userInfo,
      fullName: editForm.fullName,
      email: editForm.email,
    };
    
    // 1. Atualizar userInfo no localStorage
    localStorage.setItem('userInfo', JSON.stringify(updatedUserInfo));
    setUserInfo(updatedUserInfo);
    
    // 2. Atualizar no contexto de usuários
    const contextUser = getUserByEmail(oldEmail);
    if (contextUser) {
      const updatedContextUser = {
        ...contextUser,
        nome: editForm.fullName,
        email: editForm.email
      };
      
      // Atualizar através do contexto (isso irá acionar todas as sincronizações)
      updateUser(updatedContextUser);
    } else {
      // Se não encontrar no contexto, fazer a sincronização direta
      UserSyncService.updateLoggedUser({
        id: userInfo.id,
        nome: editForm.fullName, 
        email: editForm.email,
        papeis: getRoleToArray(userInfo.role),
        permissoes: getPermissionsFromRole(userInfo.role),
        ativo: true
      });
    }
    
    setIsEditing(false);
    setSuccess('Informações atualizadas com sucesso em todos os sistemas!');
  };

  // Função para converter role para array de papéis
  const getRoleToArray = (role: string): string[] => {
    switch (role) {
      case 'admin': return ['admin'];
      case 'supervisor': return ['supervisor'];
      case 'collector': return ['collector', 'operador'];
      case 'seller': return ['seller', 'vendedor'];
      default: return ['user'];
    }
  };
  
  // Função para obter permissões de acordo com o papel
  const getPermissionsFromRole = (role: string): string[] => {
    switch (role) {
      case 'admin':
        return ['criar_usuario', 'editar_usuario', 'excluir_usuario', 'ver_relatorios', 
                'editar_configuracoes', 'ver_todos_pedidos', 'editar_pedidos'];
      case 'supervisor':
        return ['ver_relatorios', 'ver_todos_pedidos', 'editar_pedidos'];
      case 'collector':
        return ['ver_pedidos_atribuidos', 'editar_pedidos_atribuidos'];
      case 'seller':
        return ['ver_pedidos_proprios', 'criar_pedidos'];
      default:
        return [];
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
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

  if (!userInfo) {
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

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
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
                {userInfo.fullName.charAt(0).toUpperCase()}
              </Avatar>
              <Typography variant="h5" sx={{ fontWeight: 500 }}>
                {userInfo.fullName}
              </Typography>
              <Chip
                label={getRoleName(userInfo.role)}
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
                    secondary={userInfo.email}
                  />
                </ListItem>
                <ListItem>
                  <BadgeIcon sx={{ mr: 2, color: 'text.secondary' }} />
                  <ListItemText
                    primary="ID do Usuário"
                    secondary={userInfo.id}
                  />
                </ListItem>
                <ListItem>
                  {getRoleIcon(userInfo.role)}
                  <Box sx={{ ml: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Função
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {getRoleName(userInfo.role)}
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
                <Tooltip title={isAdmin ? "Editar informações" : "Apenas administradores podem editar"}>
                  <span>
                    <IconButton
                      color="primary"
                      onClick={handleEditClick}
                      disabled={!isAdmin}
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
                    onClick={handleSaveEdit}
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
                    name="fullName"
                    value={editForm.fullName}
                    onChange={handleInputChange}
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Email"
                    name="email"
                    value={editForm.email}
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
                    secondary={userInfo.fullName}
                    primaryTypographyProps={{ color: 'text.secondary', variant: 'body2' }}
                    secondaryTypographyProps={{ color: 'text.primary', variant: 'body1', fontWeight: 500 }}
                  />
                </ListItem>
                <Divider component="li" />
                <ListItem>
                  <ListItemText
                    primary="Email"
                    secondary={userInfo.email}
                    primaryTypographyProps={{ color: 'text.secondary', variant: 'body2' }}
                    secondaryTypographyProps={{ color: 'text.primary', variant: 'body1', fontWeight: 500 }}
                  />
                </ListItem>
                <Divider component="li" />
                <ListItem>
                  <ListItemText
                    primary="Função"
                    secondary={getRoleName(userInfo.role)}
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
