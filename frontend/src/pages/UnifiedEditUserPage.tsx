import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useUnifiedUsers } from '../contexts/UnifiedUserContext';
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
  Grid,
  InputAdornment,
  CircularProgress,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';

const UnifiedEditUserPage: React.FC = () => {
  const navigate = useNavigate();
  const { userId } = useParams<{ userId: string }>();
  const { getUserById, updateUser } = useUnifiedUsers();

  // Estado do formulário
  const [formData, setFormData] = useState({
    id: 0,
    nome: '',
    email: '',
    senha: '',
    confirmarSenha: '',
    papeis: [] as string[],
    permissoes: [] as string[],
    ativo: true
  });

  // Estados de UI
  const [showPassword, setShowPassword] = useState(false);
  const [changePassword, setChangePassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Lista de papéis disponíveis
  const papeisDisponiveis = [
    { id: 'admin', nome: 'Administrador' },
    { id: 'supervisor', nome: 'Supervisor' },
    { id: 'operador', nome: 'Operador' },
    { id: 'vendedor', nome: 'Vendedor' }
  ];

  // Lista de permissões disponíveis
  const permissoesDisponiveis = [
    { id: 'criar_usuario', nome: 'Criar Usuário' },
    { id: 'editar_usuario', nome: 'Editar Usuário' },
    { id: 'excluir_usuario', nome: 'Excluir Usuário' },
    { id: 'ver_relatorios', nome: 'Ver Relatórios' },
    { id: 'editar_configuracoes', nome: 'Editar Configurações' },
    { id: 'ver_todos_pedidos', nome: 'Ver Todos os Pedidos' },
    { id: 'ver_pedidos_proprios', nome: 'Ver Pedidos Próprios' },
    { id: 'ver_pedidos_atribuidos', nome: 'Ver Pedidos Atribuídos' },
    { id: 'criar_pedidos', nome: 'Criar Pedidos' },
    { id: 'editar_pedidos', nome: 'Editar Pedidos' },
    { id: 'editar_pedidos_atribuidos', nome: 'Editar Pedidos Atribuídos' }
  ];

  // Permissões padrão por papel
  const permissoesPorPapel: Record<string, string[]> = {
    'admin': [
      'criar_usuario', 'editar_usuario', 'excluir_usuario',
      'ver_relatorios', 'editar_configuracoes',
      'ver_todos_pedidos', 'criar_pedidos', 'editar_pedidos'
    ],
    'supervisor': [
      'ver_relatorios', 'ver_todos_pedidos', 'editar_pedidos'
    ],
    'operador': [
      'ver_pedidos_atribuidos', 'editar_pedidos_atribuidos'
    ],
    'vendedor': [
      'ver_pedidos_proprios', 'criar_pedidos'
    ]
  };

  // Carregar dados do usuário
  useEffect(() => {
    if (userId) {
      try {
        const id = parseInt(userId);
        const user = getUserById(id);

        if (user) {
          setFormData({
            id: user.id,
            nome: user.nome,
            email: user.email,
            senha: '',
            confirmarSenha: '',
            papeis: user.papeis,
            permissoes: user.permissoes,
            ativo: user.ativo
          });
          setLoading(false);
        } else {
          setError(`Usuário com ID ${userId} não encontrado`);
          setLoading(false);
        }
      } catch (err) {
        console.error('Erro ao carregar usuário:', err);
        setError('Erro ao carregar dados do usuário');
        setLoading(false);
      }
    }
  }, [userId, getUserById]);

  // Lidar com mudanças nos campos de texto
  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Limpar erro quando o campo é alterado
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Lidar com mudanças nos checkboxes de papéis
  const handleRoleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    const papel = name.replace('role_', '');

    setFormData(prev => {
      // Atualizar papéis
      let papeis = [...prev.papeis];

      if (checked) {
        // Adicionar papel
        papeis.push(papel);

        // Adicionar permissões padrão para este papel
        const permissoesPadrao = permissoesPorPapel[papel] || [];
        const novasPermissoes = [...prev.permissoes];

        permissoesPadrao.forEach(permissao => {
          if (!novasPermissoes.includes(permissao)) {
            novasPermissoes.push(permissao);
          }
        });

        return { ...prev, papeis, permissoes: novasPermissoes };
      } else {
        // Remover papel
        papeis = papeis.filter(p => p !== papel);

        return { ...prev, papeis };
      }
    });
  };

  // Lidar com mudanças nos checkboxes de permissões
  const handlePermissionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    const permissao = name.replace('permission_', '');

    setFormData(prev => {
      const permissoes = [...prev.permissoes];

      if (checked) {
        // Adicionar permissão
        if (!permissoes.includes(permissao)) {
          permissoes.push(permissao);
        }
      } else {
        // Remover permissão
        const index = permissoes.indexOf(permissao);
        if (index !== -1) {
          permissoes.splice(index, 1);
        }
      }

      return { ...prev, permissoes };
    });
  };

  // Lidar com mudança no status ativo
  const handleActiveChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, ativo: e.target.checked }));
  };

  // Alternar visibilidade da senha
  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Alternar alteração de senha
  const handleToggleChangePassword = (e: React.ChangeEvent<HTMLInputElement>) => {
    setChangePassword(e.target.checked);
    if (!e.target.checked) {
      setFormData(prev => ({ ...prev, senha: '', confirmarSenha: '' }));
    }
  };

  // Validar formulário
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    // Validar nome
    if (!formData.nome.trim()) {
      newErrors.nome = 'Nome é obrigatório';
      isValid = false;
    }

    // Validar email
    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório';
      isValid = false;
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = 'Email inválido';
        isValid = false;
      }
    }

    // Validar senha se estiver alterando
    if (changePassword) {
      if (!formData.senha) {
        newErrors.senha = 'Senha é obrigatória';
        isValid = false;
      } else if (formData.senha.length < 6) {
        newErrors.senha = 'A senha deve ter pelo menos 6 caracteres';
        isValid = false;
      }

      if (formData.senha !== formData.confirmarSenha) {
        newErrors.confirmarSenha = 'As senhas não coincidem';
        isValid = false;
      }
    }

    // Validar papéis
    if (formData.papeis.length === 0) {
      newErrors.papeis = 'Selecione pelo menos um papel';
      isValid = false;
    }

    // Validar permissões
    if (formData.permissoes.length === 0) {
      newErrors.permissoes = 'Selecione pelo menos uma permissão';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  // Lidar com envio do formulário
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Limpar mensagens
    setError(null);
    setSuccess(null);

    // Validar formulário
    if (!validateForm()) {
      setError('Por favor, corrija os erros no formulário.');
      return;
    }

    try {
      // Criar objeto de usuário atualizado
      const updatedUser = {
        id: formData.id,
        nome: formData.nome,
        email: formData.email,
        papeis: formData.papeis,
        permissoes: formData.permissoes,
        ativo: formData.ativo
      };

      // Atualizar usuário
      const result = updateUser(
        updatedUser,
        changePassword ? formData.senha : undefined
      );

      if (!result) {
        setError('Erro ao atualizar usuário. Verifique se o email já está em uso.');
        return;
      }

      // Mostrar mensagem de sucesso
      setSuccess(`Usuário ${updatedUser.nome} atualizado com sucesso!`);

      // Redirecionar após 2 segundos
      setTimeout(() => {
        navigate('/users');
      }, 2000);
    } catch (err) {
      console.error('Erro ao atualizar usuário:', err);
      setError('Erro ao atualizar usuário. Por favor, tente novamente.');
    }
  };

  // Cancelar e voltar para a lista de usuários
  const handleCancel = () => {
    navigate('/users');
  };

  // Renderizar mensagem de carregamento
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Renderizar mensagem de erro se o usuário não for encontrado
  if (error && !formData.id) {
    return (
      <Box sx={{ p: 3, bgcolor: '#f9fafc' }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
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
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              label="Nome"
              name="nome"
              value={formData.nome}
              onChange={handleTextChange}
              fullWidth
              required
              error={!!errors.nome}
              helperText={errors.nome}
              variant="outlined"
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleTextChange}
              fullWidth
              required
              error={!!errors.email}
              helperText={errors.email}
              variant="outlined"
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
              disabled={formData.email.toLowerCase() === 'admin@sistema.com'}
            />
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        <Box sx={{ mb: 3 }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={changePassword}
                onChange={handleToggleChangePassword}
                name="changePassword"
              />
            }
            label="Alterar senha"
          />
        </Box>

        {changePassword && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                label="Nova Senha"
                name="senha"
                type={showPassword ? 'text' : 'password'}
                value={formData.senha}
                onChange={handleTextChange}
                fullWidth
                required={changePassword}
                error={!!errors.senha}
                helperText={errors.senha}
                variant="outlined"
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={handleTogglePasswordVisibility}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label="Confirmar Nova Senha"
                name="confirmarSenha"
                type={showPassword ? 'text' : 'password'}
                value={formData.confirmarSenha}
                onChange={handleTextChange}
                fullWidth
                required={changePassword}
                error={!!errors.confirmarSenha}
                helperText={errors.confirmarSenha}
                variant="outlined"
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
              />
            </Grid>
          </Grid>
        )}

        <Divider sx={{ my: 3 }} />

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
          <FormControl component="fieldset" sx={{ mb: 3 }}>
            <FormLabel
              component="legend"
              sx={{ fontWeight: 500, color: '#334155', mb: 1 }}
              error={!!errors.papeis}
            >
              Papéis do Usuário
            </FormLabel>
            {errors.papeis && (
              <Typography variant="caption" color="error">
                {errors.papeis}
              </Typography>
            )}
            <FormGroup>
              {papeisDisponiveis.map(papel => (
                <FormControlLabel
                  key={papel.id}
                  control={
                    <Checkbox
                      checked={formData.papeis.includes(papel.id)}
                      onChange={handleRoleChange}
                      name={`role_${papel.id}`}
                      disabled={formData.email.toLowerCase() === 'admin@sistema.com' && papel.id === 'admin'}
                    />
                  }
                  label={papel.nome}
                />
              ))}
            </FormGroup>
          </FormControl>

          <FormControl component="fieldset" sx={{ mb: 3 }}>
            <FormLabel
              component="legend"
              sx={{ fontWeight: 500, color: '#334155', mb: 1 }}
              error={!!errors.permissoes}
            >
              Permissões
            </FormLabel>
            {errors.permissoes && (
              <Typography variant="caption" color="error">
                {errors.permissoes}
              </Typography>
            )}
            <FormGroup>
              {permissoesDisponiveis.map(permissao => (
                <FormControlLabel
                  key={permissao.id}
                  control={
                    <Checkbox
                      checked={formData.permissoes.includes(permissao.id)}
                      onChange={handlePermissionChange}
                      name={`permission_${permissao.id}`}
                    />
                  }
                  label={permissao.nome}
                />
              ))}
            </FormGroup>
          </FormControl>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Box sx={{ mb: 3 }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={formData.ativo}
                onChange={handleActiveChange}
                name="ativo"
                disabled={formData.email.toLowerCase() === 'admin@sistema.com'}
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

export default UnifiedEditUserPage;
