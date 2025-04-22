import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useUsers } from '../contexts/NewUserContext';
import { User } from '../types/User';
import { convertToUserType } from '../utils/typeAdapters';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  FormControl,
  FormLabel,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Divider,
  Alert,
  IconButton,
  Chip,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';

const EditUserPageNew: React.FC = () => {
  const navigate = useNavigate();
  const { userId } = useParams<{ userId: string }>();
  const { users, updateUser } = useUsers();
  const [formData, setFormData] = useState<Partial<User>>({
    nome: '',
    email: '',
    papeis: [],
    permissoes: [],
    ativo: true
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Carregar dados do usuário
  useEffect(() => {
    if (userId) {
      const id = parseInt(userId);
      const user = users.find(u => u.id === id);

      if (user) {
        setFormData({
          id: user.id,
          nome: user.nome,
          email: user.email,
          papeis: user.papeis,
          permissoes: user.permissoes,
          ativo: user.ativo
        });
        setLoading(false);
      } else {
        setError(`Usuário com ID ${userId} não encontrado`);
        setLoading(false);
      }
    }
  }, [userId, users]);

  // Lidar com mudanças nos campos de texto
  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Lidar com mudanças nos checkboxes de papéis
  const handleRoleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    const papel = name.replace('role_', '');

    setFormData(prev => {
      const papeis = prev.papeis || [];
      if (checked) {
        return { ...prev, papeis: [...papeis, papel] };
      } else {
        return { ...prev, papeis: papeis.filter(p => p !== papel) };
      }
    });
  };

  // Lidar com mudanças nos checkboxes de permissões
  const handlePermissionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    const permissao = name.replace('permission_', '');

    setFormData(prev => {
      const permissoes = prev.permissoes || [];
      if (checked) {
        return { ...prev, permissoes: [...permissoes, permissao] };
      } else {
        return { ...prev, permissoes: permissoes.filter(p => p !== permissao) };
      }
    });
  };

  // Lidar com mudança no status ativo
  const handleActiveChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, ativo: e.target.checked }));
  };

  // Lidar com envio do formulário
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validar campos obrigatórios
    if (!formData.nome || !formData.email) {
      setError('Nome e email são obrigatórios');
      return;
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email || '')) {
      setError('Email inválido');
      return;
    }

    try {
      // Verificar se o ID existe
      if (!formData.id) {
        setError('ID do usuário não encontrado');
        return;
      }

      // Atualizar usuário
      const updatedUser = {
        id: formData.id,
        nome: formData.nome || '',
        email: formData.email || '',
        papeis: formData.papeis || [],
        permissoes: formData.permissoes || [],
        ativo: formData.ativo === undefined ? true : formData.ativo
      };

      // Atualizar usuário no UserStore
      const convertedUser = convertToUserType(updatedUser as any);
      updateUser(convertedUser);

      // Atualizar usuário no default_users
      const defaultUsersStr = localStorage.getItem('default_users');
      const defaultUsers = defaultUsersStr ? JSON.parse(defaultUsersStr) : {};

      // Mapear papel para role
      let role = 'user';
      if (updatedUser.papeis && updatedUser.papeis.includes('admin')) role = 'admin';
      else if (updatedUser.papeis && updatedUser.papeis.includes('supervisor')) role = 'supervisor';
      else if (updatedUser.papeis && updatedUser.papeis.includes('operador')) role = 'collector';
      else if (updatedUser.papeis && updatedUser.papeis.includes('vendedor')) role = 'seller';

      // Obter senha existente ou usar padrão
      const passwordsStr = localStorage.getItem('user_passwords');
      const passwords = passwordsStr ? JSON.parse(passwordsStr) : {};
      const password = passwords[updatedUser.email.toLowerCase()] || 'senha123';

      defaultUsers[updatedUser.email.toLowerCase()] = {
        id: updatedUser.id,
        email: updatedUser.email.toLowerCase(),
        fullName: updatedUser.nome,
        role: role,
        password: password
      };

      localStorage.setItem('default_users', JSON.stringify(defaultUsers));

      // Mostrar mensagem de sucesso
      setSuccess(`Usuário ${updatedUser.nome} atualizado com sucesso!`);
      setError(null);

      // Redirecionar após 2 segundos
      setTimeout(() => {
        navigate('/users');
      }, 2000);
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      setError('Erro ao atualizar usuário. Por favor, tente novamente.');
    }
  };

  // Cancelar e voltar para a lista de usuários
  const handleCancel = () => {
    navigate('/users');
  };

  if (loading) {
    return (
      <Box sx={{ p: 3, bgcolor: '#f9fafc' }}>
        <Typography>Carregando...</Typography>
      </Box>
    );
  }

  if (error && !formData.id) {
    return (
      <Box sx={{ p: 3, bgcolor: '#f9fafc' }}>
        <Alert severity="error">{error}</Alert>
        <Button
          variant="contained"
          onClick={() => navigate('/users')}
          sx={{ mt: 2 }}
        >
          Voltar para Lista de Usuários
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, bgcolor: '#f9fafc' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton
          onClick={() => navigate('/users')}
          sx={{ mr: 2 }}
        >
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h5" sx={{ fontWeight: 500, color: '#334155' }}>
          Editar Usuário
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {success}
        </Alert>
      )}

      <Paper
        component="form"
        onSubmit={handleSubmit}
        sx={{
          p: 3,
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.1)'
        }}
      >
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3, mb: 3 }}>
          <TextField
            label="Nome"
            name="nome"
            value={formData.nome || ''}
            onChange={handleTextChange}
            fullWidth
            required
            variant="outlined"
            sx={{ mb: 2 }}
          />

          <TextField
            label="Email"
            name="email"
            type="email"
            value={formData.email || ''}
            onChange={handleTextChange}
            fullWidth
            required
            variant="outlined"
            sx={{ mb: 2 }}
          />
        </Box>

        <Divider sx={{ my: 3 }} />

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
          <FormControl component="fieldset" sx={{ mb: 3 }}>
            <FormLabel component="legend" sx={{ fontWeight: 500, color: '#334155', mb: 1 }}>
              Papéis do Usuário
            </FormLabel>
            <FormGroup>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={(formData.papeis || []).includes('admin')}
                    onChange={handleRoleChange}
                    name="role_admin"
                  />
                }
                label="Administrador"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={(formData.papeis || []).includes('supervisor')}
                    onChange={handleRoleChange}
                    name="role_supervisor"
                  />
                }
                label="Supervisor"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={(formData.papeis || []).includes('operador')}
                    onChange={handleRoleChange}
                    name="role_operador"
                  />
                }
                label="Operador"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={(formData.papeis || []).includes('vendedor')}
                    onChange={handleRoleChange}
                    name="role_vendedor"
                  />
                }
                label="Vendedor"
              />
            </FormGroup>
          </FormControl>

          <FormControl component="fieldset" sx={{ mb: 3 }}>
            <FormLabel component="legend" sx={{ fontWeight: 500, color: '#334155', mb: 1 }}>
              Permissões
            </FormLabel>
            <FormGroup>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={(formData.permissoes || []).includes('criar_usuario')}
                    onChange={handlePermissionChange}
                    name="permission_criar_usuario"
                  />
                }
                label="Criar Usuário"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={(formData.permissoes || []).includes('editar_usuario')}
                    onChange={handlePermissionChange}
                    name="permission_editar_usuario"
                  />
                }
                label="Editar Usuário"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={(formData.permissoes || []).includes('excluir_usuario')}
                    onChange={handlePermissionChange}
                    name="permission_excluir_usuario"
                  />
                }
                label="Excluir Usuário"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={(formData.permissoes || []).includes('ver_relatorios')}
                    onChange={handlePermissionChange}
                    name="permission_ver_relatorios"
                  />
                }
                label="Ver Relatórios"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={(formData.permissoes || []).includes('editar_configuracoes')}
                    onChange={handlePermissionChange}
                    name="permission_editar_configuracoes"
                  />
                }
                label="Editar Configurações"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={(formData.permissoes || []).includes('ver_todos_pedidos')}
                    onChange={handlePermissionChange}
                    name="permission_ver_todos_pedidos"
                  />
                }
                label="Ver Todos os Pedidos"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={(formData.permissoes || []).includes('editar_pedidos')}
                    onChange={handlePermissionChange}
                    name="permission_editar_pedidos"
                  />
                }
                label="Editar Pedidos"
              />
            </FormGroup>
          </FormControl>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Box sx={{ mb: 3 }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={formData.ativo === undefined ? true : formData.ativo}
                onChange={handleActiveChange}
                name="ativo"
              />
            }
            label="Usuário Ativo"
          />
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
          <Button
            variant="outlined"
            color="inherit"
            onClick={handleCancel}
            startIcon={<CancelIcon />}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            startIcon={<SaveIcon />}
            sx={{
              bgcolor: '#3b82f6',
              '&:hover': { bgcolor: '#2563eb' }
            }}
          >
            Salvar Alterações
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default EditUserPageNew;
