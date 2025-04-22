import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Grid,
  Switch,
  FormControlLabel,
  Snackbar,
  Alert,
  SelectChangeEvent,
  Checkbox,
  ListItemText,
  Chip,
  OutlinedInput,
  Divider,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate, useParams } from 'react-router-dom';
import { useUsers } from '../contexts/UserContext';
import { User, UserInput } from '../types/User';
import UserSyncService from '../services/UserSyncService';
import { convertToUserManagerFormat } from '../utils/userUtils';

// Interface para o tipo de usuário já importada do UserContext

const EditUserPage: React.FC = () => {
  // Usar o contexto de usuários
  const { users, updateUser } = useUsers();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const userId = parseInt(id || '0', 10);

  const [formData, setFormData] = useState<UserInput>({
    email: '',
    full_name: '',
    role: 'collector',
    is_active: true,
    password: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Lista de permissões disponíveis
  const permissoesDisponiveis = [
    { id: 'criar_usuario', nome: 'Criar Usuários' },
    { id: 'editar_usuario', nome: 'Editar Usuários' },
    { id: 'excluir_usuario', nome: 'Excluir Usuários' },
    { id: 'ver_relatorios', nome: 'Visualizar Relatórios' },
    { id: 'editar_configuracoes', nome: 'Editar Configurações' },
    { id: 'ver_pedidos_proprios', nome: 'Ver Pedidos Próprios' },
    { id: 'ver_pedidos_atribuidos', nome: 'Ver Pedidos Atribuídos' },
    { id: 'ver_todos_pedidos', nome: 'Ver Todos os Pedidos' },
    { id: 'criar_pedidos', nome: 'Criar Pedidos' },
    { id: 'editar_pedidos', nome: 'Editar Pedidos' },
    { id: 'editar_pedidos_atribuidos', nome: 'Editar Pedidos Atribuídos' },
  ];

  // Permissões pré-definidas por papel
  const permissoesPorPapel = {
    'admin': ['criar_usuario', 'editar_usuario', 'excluir_usuario', 'ver_relatorios', 'editar_configuracoes', 'ver_todos_pedidos', 'criar_pedidos', 'editar_pedidos'],
    'supervisor': ['ver_relatorios', 'ver_todos_pedidos', 'editar_pedidos'],
    'operador': ['ver_pedidos_atribuidos', 'editar_pedidos_atribuidos'],
    'vendedor': ['ver_pedidos_proprios', 'criar_pedidos'],
  };

  const [errors, setErrors] = useState({
    nome: '',
    email: '',
    senha: '',
    confirmarSenha: '',
    papeis: '',
    permissoes: '',
  });

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });

  // Carregar dados do usuário ao iniciar
  useEffect(() => {
    // Encontrar o usuário pelo ID
    const user = users.find(u => u.id === userId);

    if (user) {
      setFormData({
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        is_active: user.is_active,
        password: ''
      });
    } else {
      // Se não encontrar o usuário, redirecione para a página de usuários
      console.error('Usuário não encontrado:', userId);
      console.log('Usuários disponíveis:', users);
      navigate('/users');
    }
  }, [userId, navigate, users]);

  // Atualizar permissões quando os papéis mudarem
  useEffect(() => {
    if (formData.papeis && formData.papeis.length > 0) {
      // Combina todas as permissões de todos os papéis selecionados
      const todasPermissoes = formData.papeis.flatMap(papel =>
        permissoesPorPapel[papel as keyof typeof permissoesPorPapel] || []
      );

      // Remove duplicatas
      const permissoesUnicas = Array.from(new Set(todasPermissoes));

      setFormData(prev => ({
        ...prev,
        permissoes: permissoesUnicas
      }));
    }
  }, [formData.papeis]);

  const handleTextFieldChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name) {
      setFormData({
        ...formData,
        [name]: value,
      });

      // Limpar erro quando o campo é alterado
      if (errors[name as keyof typeof errors]) {
        setErrors({
          ...errors,
          [name]: '',
        });
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement> | SelectChangeEvent<string | string[]>) => {
    const { name, value } = e.target;
    if (name) {
      setFormData({
        ...formData,
        [name]: value,
      });

      // Limpar erro quando o campo é alterado
      if (errors[name as keyof typeof errors]) {
        setErrors({
          ...errors,
          [name]: '',
        });
      }
    }
  };

  const handleSwitchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      is_active: e.target.checked,
    });
  };

  const handlePermissoesChange = (event: SelectChangeEvent<string[]>) => {
    const { value } = event.target;
    setFormData({
      ...formData,
      permissoes: typeof value === 'string' ? value.split(',') : value,
    });
  };

  const handleBack = () => {
    navigate('/users');
  };

  const validateForm = () => {
    let valid = true;
    const newErrors = { ...errors };

    // Validar nome
    if (!formData.full_name.trim()) {
      newErrors.nome = 'Nome é obrigatório';
      valid = false;
    }

    // Validar email
    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório';
      valid = false;
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email)) {
      newErrors.email = 'Email inválido';
      valid = false;
    }

    // Validar senha (apenas se preenchida)
    if (formData.password) {
      if (formData.password.length < 6) {
        newErrors.senha = 'A senha deve ter pelo menos 6 caracteres';
        valid = false;
      }

      // Validar confirmação de senha
      if (formData.password !== formData.confirmarSenha) {
        newErrors.confirmarSenha = 'As senhas não coincidem';
        valid = false;
      }
    }

    // Validar papéis
    if (!formData.papeis || formData.papeis.length === 0) {
      newErrors.papeis = 'Selecione pelo menos um papel';
      valid = false;
    }

    // Validar permissões
    if (!formData.permissoes || formData.permissoes.length === 0) {
      newErrors.permissoes = 'Selecione pelo menos uma permissão';
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const user = users.find(u => u.id === userId);
      if (!user) {
        throw new Error('User not found');
      }

      const oldEmail = user.email;
      const newEmail = formData.email;

      // Update user in UserStore
      await updateUser(userId, formData);

      // Convert to UserManager format for sync
      const userManagerFormat = convertToUserManagerFormat({
        ...user,
        ...formData
      });

      if (formData.password) {
        // If password was changed, sync with password
        UserSyncService.syncSingleUser(userManagerFormat, oldEmail, formData.password);
      } else if (oldEmail !== newEmail) {
        // If only email changed, sync without password
        UserSyncService.syncSingleUser(userManagerFormat, oldEmail);
      }

      // Update logged user if it's the same
      UserSyncService.updateLoggedUser(userManagerFormat);

      // Show success feedback
      setSnackbar({
        open: true,
        message: 'User updated successfully',
        severity: 'success'
      });

      navigate('/users');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to update user');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false,
    });
  };

  return (
    <Box sx={{ p: 3, bgcolor: '#f9fafc' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 500, color: '#334155' }}>
          Editar Usuário
        </Typography>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={handleBack}
          sx={{
            borderRadius: '8px',
            textTransform: 'none',
            borderColor: '#e2e8f0',
            color: '#64748b',
            '&:hover': { borderColor: '#cbd5e1', bgcolor: '#f8fafc' }
          }}
        >
          Voltar
        </Button>
      </Box>

      <Paper
        component="form"
        onSubmit={handleSubmit}
        sx={{
          p: 3,
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.1)'
        }}
      >
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Nome"
              name="full_name"
              value={formData.full_name}
              onChange={handleTextFieldChange}
              error={!!errors.nome}
              helperText={errors.nome}
              variant="outlined"
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleTextFieldChange}
              error={!!errors.email}
              helperText={errors.email}
              variant="outlined"
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Nova Senha (deixe em branco para manter a atual)"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleTextFieldChange}
              error={!!errors.senha}
              helperText={errors.senha}
              variant="outlined"
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Confirmar Nova Senha"
              name="confirmarSenha"
              type="password"
              value={formData.confirmarSenha}
              onChange={handleTextFieldChange}
              error={!!errors.confirmarSenha}
              helperText={errors.confirmarSenha}
              variant="outlined"
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl
              fullWidth
              error={!!errors.papeis}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
            >
              <InputLabel id="papeis-label">Papéis</InputLabel>
              <Select
                labelId="papeis-label"
                name="papeis"
                multiple
                value={formData.papeis}
                onChange={handleChange}
                label="Papéis"
                renderValue={(selected) => {
                  const selectedArray = Array.isArray(selected) ? selected : [selected];
                  return (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selectedArray.map((value) => {
                        const label = value.charAt(0).toUpperCase() + value.slice(1);
                        let color: 'primary' | 'secondary' | 'success' | 'info' | 'default' = 'default';

                        switch(value) {
                          case 'admin':
                            color = 'primary';
                            break;
                          case 'supervisor':
                            color = 'secondary';
                            break;
                          case 'vendedor':
                            color = 'success';
                            break;
                          case 'operador':
                            color = 'info';
                            break;
                        }

                        return (
                          <Chip
                            key={value}
                            label={label}
                            size="small"
                            color={color}
                            sx={{ borderRadius: '6px', fontWeight: 500, fontSize: '0.75rem' }}
                          />
                        );
                      })}
                    </Box>
                  );
                }}
              >
                <MenuItem value="admin">Administrador</MenuItem>
                <MenuItem value="supervisor">Supervisor</MenuItem>
                <MenuItem value="operador">Operador</MenuItem>
                <MenuItem value="vendedor">Vendedor</MenuItem>
              </Select>
              {errors.papeis && <FormHelperText>{errors.papeis}</FormHelperText>}
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.is_active}
                  onChange={handleSwitchChange}
                  name="is_active"
                  color="primary"
                />
              }
              label="Usuário Ativo"
              sx={{ height: '100%', display: 'flex', alignItems: 'center' }}
            />
          </Grid>

          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 500, color: '#334155' }}>
              Permissões de Acesso
            </Typography>
            <FormControl
              fullWidth
              error={!!errors.permissoes}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
            >
              <InputLabel id="permissoes-label">Permissões</InputLabel>
              <Select
                labelId="permissoes-label"
                multiple
                value={formData.permissoes}
                onChange={handlePermissoesChange}
                input={<OutlinedInput label="Permissões" />}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => {
                      const permissao = permissoesDisponiveis.find(p => p.id === value);
                      return (
                        <Chip
                          key={value}
                          label={permissao ? permissao.nome : value}
                          size="small"
                          sx={{
                            borderRadius: '6px',
                            bgcolor: 'rgba(59, 130, 246, 0.1)',
                            color: '#3b82f6',
                            fontWeight: 500
                          }}
                        />
                      );
                    })}
                  </Box>
                )}
              >
                {permissoesDisponiveis.map((permissao) => (
                  <MenuItem key={permissao.id} value={permissao.id}>
                    <Checkbox checked={formData.permissoes ? formData.permissoes.indexOf(permissao.id) > -1 : false} />
                    <ListItemText primary={permissao.nome} />
                  </MenuItem>
                ))}
              </Select>
              {errors.permissoes && <FormHelperText>{errors.permissoes}</FormHelperText>}
            </FormControl>
          </Grid>

          <Grid item xs={12} sx={{ mt: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                startIcon={<SaveIcon />}
                sx={{
                  borderRadius: '8px',
                  textTransform: 'none',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                  bgcolor: '#3b82f6',
                  '&:hover': { bgcolor: '#2563eb' }
                }}
              >
                Salvar Alterações
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%', borderRadius: '10px' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default EditUserPage;
