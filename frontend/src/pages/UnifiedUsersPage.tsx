import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUnifiedUsers } from '../contexts/UnifiedUserContext';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  IconButton,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  InputAdornment,
  Tabs,
  Tab,
  Tooltip,
  CircularProgress,
  Alert,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import RefreshIcon from '@mui/icons-material/Refresh';

const UnifiedUsersPage: React.FC = () => {
  const navigate = useNavigate();
  const { users, loading, error, deleteUser, resetToAdmin } = useUnifiedUsers();

  // Estados locais
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'todos' | 'ativos' | 'inativos'>('todos');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<number | null>(null);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Filtrar usuários com base nos filtros aplicados
  const filteredUsers = users.filter(user => {
    // Filtro por status
    if (filterStatus === 'ativos' && !user.ativo) return false;
    if (filterStatus === 'inativos' && user.ativo) return false;

    // Filtro por termo de busca
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        user.nome.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower) ||
        user.papeis.some(papel => papel.toLowerCase().includes(searchLower))
      );
    }

    return true;
  });

  // Navegar para a página de criação de usuário
  const handleCreateUser = () => {
    navigate('/new-user');
  };

  // Navegar para a página de edição de usuário
  const handleEditUser = (userId: number) => {
    navigate(`/edit-user/${userId}`);
  };

  // Abrir diálogo de confirmação de exclusão
  const handleDeleteClick = (userId: number) => {
    // Verificar se é o admin
    const userToDelete = users.find(user => user.id === userId);
    if (userToDelete?.email.toLowerCase() === 'admin@sistema.com') {
      setErrorMessage('Não é possível excluir o usuário Admin.');
      setErrorDialogOpen(true);
      return;
    }

    setUserToDelete(userId);
    setDeleteDialogOpen(true);
  };

  // Confirmar exclusão de usuário
  const handleDeleteConfirm = () => {
    if (userToDelete !== null) {
      const user = users.find(u => u.id === userToDelete);
      const success = deleteUser(userToDelete);

      if (success && user) {
        setSuccessMessage(`Usuário ${user.nome} excluído com sucesso.`);
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        setErrorMessage('Erro ao excluir usuário. Por favor, tente novamente.');
        setErrorDialogOpen(true);
      }
    }

    setDeleteDialogOpen(false);
    setUserToDelete(null);
  };

  // Cancelar exclusão
  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setUserToDelete(null);
  };

  // Abrir diálogo de confirmação de reset
  const handleResetClick = () => {
    setResetDialogOpen(true);
  };

  // Confirmar reset para admin
  const handleResetConfirm = () => {
    resetToAdmin();
    setSuccessMessage('Sistema resetado para apenas o usuário Admin.');
    setTimeout(() => setSuccessMessage(null), 3000);
    setResetDialogOpen(false);
  };

  // Cancelar reset
  const handleResetCancel = () => {
    setResetDialogOpen(false);
  };

  // Renderizar mensagem de carregamento
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Renderizar mensagem de erro
  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button
          variant="contained"
          startIcon={<RefreshIcon />}
          onClick={() => window.location.reload()}
        >
          Recarregar Página
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, bgcolor: '#f9fafc' }}>
      {/* Cabeçalho */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 500, color: '#334155' }}>
          Gerenciamento de Usuários
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<PersonAddIcon />}
          onClick={handleCreateUser}
          sx={{
            borderRadius: '8px',
            textTransform: 'none',
            boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
            bgcolor: '#3b82f6',
            '&:hover': { bgcolor: '#2563eb' }
          }}
        >
          Novo Usuário
        </Button>
      </Box>

      {/* Mensagem de sucesso */}
      {successMessage && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {successMessage}
        </Alert>
      )}

      {/* Filtros e Pesquisa */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Tabs
          value={filterStatus}
          onChange={(_, newValue) => setFilterStatus(newValue)}
          sx={{
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 500,
              minHeight: '40px',
              color: '#64748b',
              '&.Mui-selected': { color: '#3b82f6' }
            },
            '& .MuiTabs-indicator': { backgroundColor: '#3b82f6', height: '3px', borderRadius: '3px' }
          }}
        >
          <Tab value="todos" label="Todos" />
          <Tab value="ativos" label="Ativos" />
          <Tab value="inativos" label="Inativos" />
        </Tabs>

        <TextField
          placeholder="Buscar usuários..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          size="small"
          sx={{
            width: 250,
            '& .MuiOutlinedInput-root': { borderRadius: '8px' }
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" sx={{ color: '#94a3b8' }} />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {/* Tabela de Usuários */}
      <Paper sx={{ borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.1)' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Nome</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Papéis</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Permissões</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                    <Typography variant="body1" color="text.secondary">
                      Nenhum usuário encontrado com os filtros aplicados.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map(user => (
                  <TableRow key={user.id}>
                    <TableCell>{user.nome}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {user.papeis.map(papel => {
                          let color: 'primary' | 'secondary' | 'success' | 'info' | 'default' = 'default';

                          switch(papel) {
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
                            default:
                              color = 'default';
                          }

                          return (
                            <Chip
                              key={papel}
                              label={papel.charAt(0).toUpperCase() + papel.slice(1)}
                              size="small"
                              color={color}
                              sx={{
                                borderRadius: '6px',
                                fontWeight: 500,
                                fontSize: '0.75rem'
                              }}
                            />
                          );
                        })}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={user.ativo ? 'Ativo' : 'Inativo'}
                        size="small"
                        color={user.ativo ? 'success' : 'error'}
                        sx={{
                          borderRadius: '6px',
                          fontWeight: 500,
                          fontSize: '0.75rem'
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Tooltip title={user.permissoes.join(', ')}>
                        <Chip
                          label={`${user.permissoes.length} permissões`}
                          size="small"
                          color="default"
                          sx={{
                            borderRadius: '6px',
                            fontWeight: 500,
                            fontSize: '0.75rem',
                            bgcolor: 'rgba(100, 116, 139, 0.1)',
                            color: '#64748b'
                          }}
                        />
                      </Tooltip>
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleEditUser(user.id)}
                        sx={{ mr: 1 }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDeleteClick(user.id)}
                        disabled={user.email.toLowerCase() === 'admin@sistema.com'}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Diálogo de confirmação para exclusão */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          Confirmar exclusão
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Tem certeza que deseja excluir este usuário? Esta ação não pode ser desfeita.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} color="primary">
            Cancelar
          </Button>
          <Button onClick={handleDeleteConfirm} color="error" autoFocus>
            Excluir
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo de erro */}
      <Dialog
        open={errorDialogOpen}
        onClose={() => setErrorDialogOpen(false)}
        aria-labelledby="error-dialog-title"
        aria-describedby="error-dialog-description"
      >
        <DialogTitle id="error-dialog-title" sx={{ color: 'error.main' }}>
          Erro
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="error-dialog-description">
            {errorMessage}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setErrorDialogOpen(false)} color="primary" autoFocus>
            Entendi
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo de confirmação para reset */}
      <Dialog
        open={resetDialogOpen}
        onClose={handleResetCancel}
        aria-labelledby="reset-dialog-title"
        aria-describedby="reset-dialog-description"
      >
        <DialogTitle id="reset-dialog-title" sx={{ color: 'error.main' }}>
          Resetar para Admin
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="reset-dialog-description">
            <strong>ATENÇÃO:</strong> Esta ação irá remover TODOS os usuários do sistema, exceto o usuário Admin.
            Esta ação é IRREVERSÍVEL e afetará todas as áreas do sistema.
          </DialogContentText>
          <DialogContentText sx={{ mt: 2 }}>
            Tem certeza que deseja continuar?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleResetCancel} color="primary">
            Cancelar
          </Button>
          <Button onClick={handleResetConfirm} color="error" autoFocus>
            Resetar para Admin
          </Button>
        </DialogActions>
      </Dialog>

      {/* Botão para resetar para admin (escondido no canto inferior direito) */}
      <Box sx={{ position: 'fixed', bottom: 20, right: 20 }}>
        <Button
          variant="contained"
          color="error"
          size="small"
          onClick={handleResetClick}
          sx={{ textTransform: 'none', fontSize: '0.75rem' }}
        >
          Resetar para Admin
        </Button>
      </Box>
    </Box>
  );
};

export default UnifiedUsersPage;
