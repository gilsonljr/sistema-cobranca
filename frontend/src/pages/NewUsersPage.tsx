import React, { useState, useEffect } from 'react';
import { useUsers } from '../contexts/NewUserContext';
import { User } from '../services/UserStore';
import { useNavigate } from 'react-router-dom';
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
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import PersonAddIcon from '@mui/icons-material/PersonAdd';

const NewUsersPage: React.FC = () => {
  const navigate = useNavigate();
  const { users, addUser, updateUser, deleteUser, resetToAdmin } = useUsers();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'todos' | 'ativos' | 'inativos'>('todos');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<number | null>(null);
  const [deactivateDialogOpen, setDeactivateDialogOpen] = useState(false);
  const [userToDeactivate, setUserToDeactivate] = useState<number | null>(null);
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Filtrar usuários com base nos filtros aplicados
  const filteredUsers = users.filter(user => {
    // Filtro por status
    if (filterStatus === 'ativos' && !user.ativo) return false;
    if (filterStatus === 'inativos' && user.ativo) return false;

    // Filtro por termo de busca
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        (user.nome ? user.nome.toLowerCase().includes(searchLower) : false) ||
        (user.email ? user.email.toLowerCase().includes(searchLower) : false) ||
        (user.papeis ? user.papeis.some(papel => papel.toLowerCase().includes(searchLower)) : false)
      );
    }

    return true;
  });

  const handleCreateUser = () => {
    navigate('/new-user');
  };

  const handleEditUser = (userId: number) => {
    navigate(`/edit-user/${userId}`);
  };

  const handleDeleteClick = (userId: number) => {
    // Verificar se é o admin
    const userToDelete = users.find(user => user.id === userId);
    if (userToDelete?.email === 'admin@sistema.com') {
      setErrorMessage('Não é possível excluir o usuário Admin.');
      setErrorDialogOpen(true);
      return;
    }

    setUserToDelete(userId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (userToDelete !== null) {
      deleteUser(userToDelete);
    }
    setDeleteDialogOpen(false);
    setUserToDelete(null);
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setUserToDelete(null);
  };

  const handleDeactivateConfirm = () => {
    if (userToDeactivate !== null) {
      // Atualiza o status do usuário para inativo
      const userToUpdate = users.find(user => user.id === userToDeactivate);
      if (userToUpdate) {
        updateUser({ ...userToUpdate, ativo: false });
      }
    }
    setDeactivateDialogOpen(false);
    setUserToDeactivate(null);
  };

  const handleDeactivateCancel = () => {
    setDeactivateDialogOpen(false);
    setUserToDeactivate(null);
  };

  // Resetar para apenas o admin
  const handleResetToAdmin = () => {
    if (window.confirm('ATENÇÃO: Esta ação irá remover TODOS os usuários exceto o Admin. Tem certeza que deseja continuar?')) {
      if (window.confirm('Confirme novamente: Todos os usuários serão REMOVIDOS. Apenas o Admin permanecerá. Tem certeza absoluta?')) {
        resetToAdmin();
      }
    }
  };

  return (
    <Box sx={{ p: 3, bgcolor: '#f9fafc' }}>
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
                        {user.papeis && user.papeis.map(papel => {
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
                      <Tooltip title={user.permissoes ? user.permissoes.join(', ') : ''}>
                        <Chip
                          label={`${user.permissoes ? user.permissoes.length : 0} permissões`}
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
                        disabled={user.email === 'admin@sistema.com'}
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
          Não é possível excluir
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

      {/* Diálogo para desativar usuários */}
      <Dialog
        open={deactivateDialogOpen}
        onClose={handleDeactivateCancel}
        aria-labelledby="deactivate-dialog-title"
        aria-describedby="deactivate-dialog-description"
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle id="deactivate-dialog-title" sx={{ color: 'warning.main', fontWeight: 500 }}>
          Desativar Usuário
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, py: 1 }}>
            <DialogContentText id="deactivate-dialog-description">
              Deseja desativar este usuário em vez de excluí-lo?
            </DialogContentText>

            <Typography variant="body2" sx={{ mt: 1, fontWeight: 500, color: 'text.secondary' }}>
              Ao desativar o usuário:
            </Typography>

            <Box component="ul" sx={{ pl: 2, mt: 0 }}>
              <Typography component="li" variant="body2" color="text.secondary">
                O usuário não poderá mais acessar o sistema
              </Typography>
              <Typography component="li" variant="body2" color="text.secondary">
                Os pedidos associados a este usuário serão mantidos
              </Typography>
              <Typography component="li" variant="body2" color="text.secondary">
                O usuário poderá ser reativado no futuro se necessário
              </Typography>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleDeactivateCancel} color="primary" variant="outlined">
            Cancelar
          </Button>
          <Button onClick={handleDeactivateConfirm} color="warning" variant="contained" autoFocus>
            Desativar Usuário
          </Button>
        </DialogActions>
      </Dialog>

      {/* Botão para resetar para admin (escondido no canto inferior direito) */}
      <Box sx={{ position: 'fixed', bottom: 20, right: 20 }}>
        <Button
          variant="contained"
          color="error"
          size="small"
          onClick={handleResetToAdmin}
          sx={{ textTransform: 'none', fontSize: '0.75rem' }}
        >
          Resetar para Admin
        </Button>
      </Box>
    </Box>
  );
};

export default NewUsersPage;
