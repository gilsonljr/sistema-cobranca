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
import { useNavigate } from 'react-router-dom';
import { useUsers, User } from '../contexts/UserContext';

const NewUserPage: React.FC = () => {
  const navigate = useNavigate();
  const { users, setUsers } = useUsers();
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    senha: '',
    confirmarSenha: '',
    perfil: '',
    permissoes: [] as string[],
    ativo: true,
  });

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

  // Permissões pré-definidas por perfil
  const permissoesPorPerfil = {
    'Administrador': ['criar_usuario', 'editar_usuario', 'excluir_usuario', 'ver_relatorios', 'editar_configuracoes', 'ver_todos_pedidos', 'criar_pedidos', 'editar_pedidos'],
    'Supervisor': ['ver_relatorios', 'ver_todos_pedidos', 'editar_pedidos'],
    'Operador': ['ver_pedidos_atribuidos', 'editar_pedidos_atribuidos'],
    'Vendedor': ['ver_pedidos_proprios', 'criar_pedidos'],
  };

  const [errors, setErrors] = useState({
    nome: '',
    email: '',
    senha: '',
    confirmarSenha: '',
    perfil: '',
    permissoes: '',
  });

  // Atualizar permissões quando o perfil mudar
  useEffect(() => {
    if (formData.perfil && permissoesPorPerfil[formData.perfil as keyof typeof permissoesPorPerfil]) {
      setFormData(prev => ({
        ...prev,
        permissoes: permissoesPorPerfil[formData.perfil as keyof typeof permissoesPorPerfil]
      }));
    }
  }, [formData.perfil]);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement> | SelectChangeEvent) => {
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

  const handleTextFieldChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleChange(e);
  };

  const handleSwitchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      ativo: e.target.checked,
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
    if (!formData.nome.trim()) {
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

    // Validar senha
    if (!formData.senha) {
      newErrors.senha = 'Senha é obrigatória';
      valid = false;
    } else if (formData.senha.length < 6) {
      newErrors.senha = 'A senha deve ter pelo menos 6 caracteres';
      valid = false;
    }

    // Validar confirmação de senha
    if (formData.senha !== formData.confirmarSenha) {
      newErrors.confirmarSenha = 'As senhas não coincidem';
      valid = false;
    }

    // Validar perfil
    if (!formData.perfil) {
      newErrors.perfil = 'Perfil é obrigatório';
      valid = false;
    }

    // Validar permissões
    if (formData.permissoes.length === 0) {
      newErrors.permissoes = 'Selecione pelo menos uma permissão';
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      // Criar novo ID para o usuário
      const newId = Date.now();

      // Mapear perfil para papéis
      let papeis: string[] = [];
      switch(formData.perfil) {
        case 'Administrador':
          papeis = ['admin'];
          break;
        case 'Supervisor':
          papeis = ['supervisor'];
          break;
        case 'Operador':
          papeis = ['collector'];
          break;
        case 'Vendedor':
          papeis = ['seller'];
          break;
        default:
          papeis = ['user'];
      }

      // Criar novo usuário para o contexto
      const newUser: User = {
        id: newId,
        nome: formData.nome,
        email: formData.email,
        papeis: papeis,
        permissoes: formData.permissoes,
        ativo: formData.ativo
      };

      // 1. Adicionar ao contexto de usuários
      setUsers([...users, newUser]);

      // 2. Sincronizar em todos os locais de armazenamento

      // Adicionar em users (localStorage)
      const usersStr = localStorage.getItem('users');
      const storedUsers = usersStr ? JSON.parse(usersStr) : [];
      storedUsers.push(newUser);
      localStorage.setItem('users', JSON.stringify(storedUsers));

      // Adicionar em default_users
      const defaultUsersStr = localStorage.getItem('default_users');
      const defaultUsers = defaultUsersStr ? JSON.parse(defaultUsersStr) : {};

      // Mapear papel para role
      let role = 'user';
      if (papeis.includes('admin')) role = 'admin';
      else if (papeis.includes('supervisor')) role = 'supervisor';
      else if (papeis.includes('collector')) role = 'collector';
      else if (papeis.includes('seller')) role = 'seller';

      defaultUsers[formData.email] = {
        id: newId,
        email: formData.email,
        fullName: formData.nome,
        role: role,
        password: formData.senha
      };
      localStorage.setItem('default_users', JSON.stringify(defaultUsers));

      // Adicionar em user_passwords
      if (formData.senha) {
        const passwordsStr = localStorage.getItem('user_passwords');
        const passwords = passwordsStr ? JSON.parse(passwordsStr) : {};
        passwords[formData.email] = formData.senha;
        localStorage.setItem('user_passwords', JSON.stringify(passwords));
      }

      // Adicionar em mockUsers
      const mockUsersStr = localStorage.getItem('mockUsers');
      const mockUsers = mockUsersStr ? JSON.parse(mockUsersStr) : [];
      mockUsers.push({
        id: newId,
        nome: formData.nome,
        email: formData.email,
        perfil: formData.perfil,
        ativo: formData.ativo
      });
      localStorage.setItem('mockUsers', JSON.stringify(mockUsers));

      console.log('Usuário criado e sincronizado em todos os sistemas:', formData);

      // Mostrar mensagem de sucesso
      setSnackbar({
        open: true,
        message: 'Usuário criado com sucesso em todos os sistemas!',
        severity: 'success',
      });

      // Redirecionar após 2 segundos
      setTimeout(() => {
        navigate('/users');
      }, 2000);
    } else {
      setSnackbar({
        open: true,
        message: 'Por favor, corrija os erros no formulário.',
        severity: 'error',
      });
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
          Criar Novo Usuário
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
              name="nome"
              value={formData.nome}
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
              label="Senha"
              name="senha"
              type="password"
              value={formData.senha}
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
              label="Confirmar Senha"
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
              error={!!errors.perfil}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
            >
              <InputLabel id="perfil-label">Perfil</InputLabel>
              <Select
                labelId="perfil-label"
                name="perfil"
                value={formData.perfil}
                onChange={handleChange}
                label="Perfil"
              >
                <MenuItem value="Administrador">Administrador</MenuItem>
                <MenuItem value="Supervisor">Supervisor</MenuItem>
                <MenuItem value="Operador">Operador</MenuItem>
                <MenuItem value="Vendedor">Vendedor</MenuItem>
              </Select>
              {errors.perfil && <FormHelperText>{errors.perfil}</FormHelperText>}
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.ativo}
                  onChange={handleSwitchChange}
                  name="ativo"
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
                    <Checkbox checked={formData.permissoes.indexOf(permissao.id) > -1} />
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
                Salvar Usuário
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

export default NewUserPage;
