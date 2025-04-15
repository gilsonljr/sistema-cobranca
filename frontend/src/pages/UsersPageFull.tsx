import React, { useState, useEffect, useRef } from 'react';
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
import PeopleIcon from '@mui/icons-material/People';
import { useNavigate } from 'react-router-dom';
import { useUsers, User } from '../contexts/UserContext';

// Interface para o tipo de usuário já importada do UserContext

interface UsersPageFullProps {
  orders: any[];
}

const UsersPageFull: React.FC<UsersPageFullProps> = ({ orders = [] }) => {
  const navigate = useNavigate();
  // Usar o contexto de usuários
  const { users, setUsers } = useUsers();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<number | null>(null);
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [deactivateDialogOpen, setDeactivateDialogOpen] = useState(false);
  const [userToDeactivate, setUserToDeactivate] = useState<number | null>(null);

  // Simulação de pedidos atribuídos a vendedores e operadores
  const [assignedOrders, setAssignedOrders] = useState<{[key: string]: number}>({});

  // Referência para controlar atualizações de usuários
  const usersUpdated = useRef(false);

  // Extrai vendedores e operadores únicos dos pedidos e atualiza a lista de usuários
  useEffect(() => {
    if (!orders || orders.length === 0) return;

    console.log('Processando pedidos para extrair usuários:', orders.length);

    // Desabilitando a criação automática de usuários a partir de pedidos
    console.log('Criação automática de usuários desabilitada. Use a página de padronização para vincular vendedores/operadores a usuários existentes.');
    
    // Apenas atualiza contagem de pedidos por usuário (sem criar novos usuários)
    const orderCounts: {[key: string]: number} = {};

    // Conta pedidos por vendedor
    orders.forEach(order => {
      if (order.vendedor && order.vendedor.trim() !== '') {
        const email = `${order.vendedor.toLowerCase().replace(/\s+/g, '.')}@default.com`;
        orderCounts[email] = (orderCounts[email] || 0) + 1;
      }
    });

    // Conta pedidos por operador
    orders.forEach(order => {
      if (order.operador && order.operador.trim() !== '') {
        const email = `${order.operador.toLowerCase().replace(/\s+/g, '.')}@default.com`;
        orderCounts[email] = (orderCounts[email] || 0) + 1;
      }
    });

    console.log('Contagem de pedidos por usuário:', orderCounts);
    setAssignedOrders(orderCounts);
  }, [orders, setAssignedOrders]);

  // Função auxiliar para obter permissões com base nos papéis
  const getPermissoesByPapeis = (papeis: string[]): string[] => {
    const permissoes: string[] = [];

    if (papeis.includes('vendedor')) {
      permissoes.push('ver_pedidos_proprios', 'criar_pedidos');
    }

    if (papeis.includes('operador')) {
      permissoes.push('ver_pedidos_atribuidos', 'editar_pedidos_atribuidos');
    }

    return Array.from(new Set(permissoes)); // Remove duplicatas
  };

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
        user.papeis.some(papel => papel.toLowerCase().includes(searchLower))
      );
    }

    return true;
  });

  const handleEditUser = (userId: number) => {
    navigate(`/edit-user/${userId}`);
  };

  const handleDeleteClick = (userId: number) => {
    const userToDelete = users.find(user => user.id === userId);

    if (!userToDelete) return;

    // Regra: Administradores não podem excluir usuários com vendas associadas
    // Verifica se o usuário tem pedidos associados (como vendedor ou operador)
    if (assignedOrders[userToDelete.email] && assignedOrders[userToDelete.email] > 0) {
      // Usuário tem pedidos associados - não pode ser excluído, apenas desativado
      const papeis = [];
      if (userToDelete.papeis.includes('vendedor')) papeis.push('Vendedor');
      if (userToDelete.papeis.includes('operador')) papeis.push('Operador');

      const papeisTexto = papeis.join(' e ');

      setErrorMessage(
        `Não é possível excluir o usuário ${userToDelete.nome} porque possui ${assignedOrders[userToDelete.email]} ` +
        `pedido(s) associado(s) como ${papeisTexto}. \n\n` +
        `Usuários com vendas associadas não podem ser excluídos. ` +
        `Deseja desativar este usuário em vez de excluí-lo?`
      );
      setUserToDeactivate(userId);
      setDeactivateDialogOpen(true);
      return;
    }

    // Se não tiver pedidos associados, prossegue com a exclusão
    setUserToDelete(userId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (userToDelete !== null) {
      setUsers(users.filter(user => user.id !== userToDelete));
    }
    setDeleteDialogOpen(false);
    setUserToDelete(null);
  };

  const handleDeactivateConfirm = () => {
    if (userToDeactivate !== null) {
      // Atualiza o status do usuário para inativo
      setUsers(users.map(user =>
        user.id === userToDeactivate ? { ...user, ativo: false } : user
      ));
    }
    setDeactivateDialogOpen(false);
    setUserToDeactivate(null);
  };

  const handleDeactivateCancel = () => {
    setDeactivateDialogOpen(false);
    setUserToDeactivate(null);
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setUserToDelete(null);
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

      {/* Tabela de Usuários Unificada */}
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
                          let icon;

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

      {/* Diálogo de erro para usuários com pedidos atribuídos */}
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

      {/* Diálogo para desativar usuários com pedidos associados */}
      <Dialog
        open={deactivateDialogOpen}
        onClose={handleDeactivateCancel}
        aria-labelledby="deactivate-dialog-title"
        aria-describedby="deactivate-dialog-description"
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle id="deactivate-dialog-title" sx={{ color: 'warning.main', fontWeight: 500 }}>
          Restrição de Exclusão - Desativar Usuário
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, py: 1 }}>
            <DialogContentText id="deactivate-dialog-description">
              {errorMessage}
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
    </Box>
  );
};

export default UsersPageFull;
