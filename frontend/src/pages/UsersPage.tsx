import React, { useState, useEffect } from 'react';
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
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import VisibilityIcon from '@mui/icons-material/Visibility';
import SecurityIcon from '@mui/icons-material/Security';
import { useNavigate } from 'react-router-dom';
import { useUsers, User } from '../contexts/UserContext';

const UsersPage = () => {
  const navigate = useNavigate();
  const { users, deleteUser } = useUsers();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<number | null>(null);

  // Estado para controle de filtros
  const [filterStatus, setFilterStatus] = useState<'todos' | 'ativos' | 'inativos'>('todos');
  const [searchTerm, setSearchTerm] = useState('');

  const handleCreateUser = () => {
    navigate('/new-user');
  };

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
        getPerfilFromPapeis(user.papeis).toLowerCase().includes(searchLower)
      );
    }

    return true;
  });

  // Função para obter o perfil a partir dos papéis
  const getPerfilFromPapeis = (papeis: string[]): string => {
    if (papeis.includes('admin')) return 'Administrador';
    if (papeis.includes('supervisor')) return 'Supervisor';
    if (papeis.includes('collector') || papeis.includes('operador')) return 'Operador';
    if (papeis.includes('seller') || papeis.includes('vendedor')) return 'Vendedor';
    return 'Usuário';
  };

  const handleEditUser = (userId: number) => {
    navigate(`/edit-user/${userId}`);
  };

  const handleDeleteClick = (userId: number) => {
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

  // Estado para o menu de ações
  const [actionMenuAnchor, setActionMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

  const handleOpenActionMenu = (event: React.MouseEvent<HTMLElement>, userId: number) => {
    setActionMenuAnchor(event.currentTarget);
    setSelectedUserId(userId);
  };

  const handleCloseActionMenu = () => {
    setActionMenuAnchor(null);
    setSelectedUserId(null);
  };

  const handleViewUser = (userId: number) => {
    // Implementar visualização detalhada do usuário
    console.log('Visualizar usuário:', userId);
    handleCloseActionMenu();
  };

  const handleManagePermissions = (userId: number) => {
    // Implementar gerenciamento de permissões
    console.log('Gerenciar permissões:', userId);
    handleCloseActionMenu();
  };

  const handleDeleteFromMenu = () => {
    if (selectedUserId) {
      handleDeleteClick(selectedUserId);
      handleCloseActionMenu();
    }
  };

  const handleEditFromMenu = () => {
    if (selectedUserId) {
      handleEditUser(selectedUserId);
      handleCloseActionMenu();
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

      <Paper sx={{ borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.1)' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Nome</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Perfil</TableCell>
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
                filteredUsers.map(user => {
                  return (
                    <TableRow key={user.id}>
                      <TableCell>{user.nome}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Chip
                          label={getPerfilFromPapeis(user.papeis)}
                          size="small"
                          color={
                            getPerfilFromPapeis(user.papeis) === 'Administrador' ? 'primary' :
                            getPerfilFromPapeis(user.papeis) === 'Supervisor' ? 'secondary' :
                            getPerfilFromPapeis(user.papeis) === 'Vendedor' ? 'success' : 'info'
                          }
                          sx={{
                            borderRadius: '6px',
                            fontWeight: 500,
                            fontSize: '0.75rem'
                          }}
                        />
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
                        <Tooltip title={user.papeis.join(', ')}>
                          <Chip
                            label={`${user.papeis.length} permissões`}
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
                          onClick={(e) => handleOpenActionMenu(e, user.id)}
                        >
                          <MoreVertIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Menu de ações para cada usuário */}
      <Menu
        anchorEl={actionMenuAnchor}
        open={Boolean(actionMenuAnchor)}
        onClose={handleCloseActionMenu}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        sx={{ mt: 1 }}
      >
        <MenuItem onClick={handleEditFromMenu} sx={{ py: 1, px: 2 }}>
          <ListItemIcon>
            <EditIcon fontSize="small" sx={{ color: '#3b82f6' }} />
          </ListItemIcon>
          <ListItemText primary="Editar Usuário" />
        </MenuItem>

        <MenuItem onClick={() => selectedUserId && handleViewUser(selectedUserId)} sx={{ py: 1, px: 2 }}>
          <ListItemIcon>
            <VisibilityIcon fontSize="small" sx={{ color: '#64748b' }} />
          </ListItemIcon>
          <ListItemText primary="Visualizar Detalhes" />
        </MenuItem>

        <MenuItem onClick={() => selectedUserId && handleManagePermissions(selectedUserId)} sx={{ py: 1, px: 2 }}>
          <ListItemIcon>
            <SecurityIcon fontSize="small" sx={{ color: '#0891b2' }} />
          </ListItemIcon>
          <ListItemText primary="Gerenciar Permissões" />
        </MenuItem>

        <MenuItem onClick={handleDeleteFromMenu} sx={{ py: 1, px: 2 }}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" sx={{ color: '#ef4444' }} />
          </ListItemIcon>
          <ListItemText primary="Excluir Usuário" />
        </MenuItem>
      </Menu>

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
    </Box>
  );
};

export default UsersPage;
