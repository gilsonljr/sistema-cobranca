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
  Chip,
  IconButton,
  Alert,
  CircularProgress,
  Tooltip,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Visibility as VisibilityIcon,
  Phone as PhoneIcon,
} from '@mui/icons-material';
import { Order } from '../types/Order';
import StatusChip from '../components/StatusChip';
import UnifiedAuthService from '../services/UnifiedAuthService';

const ApprovalPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [openRejectDialog, setOpenRejectDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  // Carregar pedidos do localStorage
  useEffect(() => {
    const loadOrders = () => {
      try {
        setLoading(true);
        const storedOrders = localStorage.getItem('orders');
        if (storedOrders) {
          const parsedOrders = JSON.parse(storedOrders);
          // Filtrar apenas pedidos com status "Liberação"
          const pendingApprovalOrders = parsedOrders.filter(
            (order: Order) => 
              order.situacaoVenda && 
              order.situacaoVenda.toLowerCase() === 'liberação'
          );
          setOrders(pendingApprovalOrders);
        } else {
          setError('Nenhum pedido encontrado no armazenamento local.');
        }
      } catch (err) {
        setError('Erro ao carregar pedidos: ' + (err instanceof Error ? err.message : String(err)));
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, []);

  // Função para aprovar um pedido
  const handleApproveOrder = () => {
    if (!selectedOrder) return;

    try {
      // Obter todos os pedidos
      const storedOrders = localStorage.getItem('orders');
      if (!storedOrders) {
        setError('Nenhum pedido encontrado no armazenamento local.');
        return;
      }

      const allOrders = JSON.parse(storedOrders);
      
      // Encontrar o pedido selecionado e atualizar seu status
      const updatedOrders = allOrders.map((order: Order) => {
        if (order.idVenda === selectedOrder.idVenda) {
          return {
            ...order,
            situacaoVenda: 'Em Separação',
            ultimaAtualizacao: new Date().toLocaleString('pt-BR')
          };
        }
        return order;
      });

      // Salvar os pedidos atualizados no localStorage
      localStorage.setItem('orders', JSON.stringify(updatedOrders));

      // Atualizar a lista de pedidos na página
      const pendingApprovalOrders = updatedOrders.filter(
        (order: Order) => 
          order.situacaoVenda && 
          order.situacaoVenda.toLowerCase() === 'liberação'
      );
      setOrders(pendingApprovalOrders);

      // Fechar o diálogo
      setOpenDialog(false);
      setSelectedOrder(null);

      // Disparar evento para atualizar a contagem na barra lateral
      window.dispatchEvent(new CustomEvent('order-status-updated'));
    } catch (err) {
      setError('Erro ao aprovar pedido: ' + (err instanceof Error ? err.message : String(err)));
    }
  };

  // Função para rejeitar um pedido
  const handleRejectOrder = () => {
    if (!selectedOrder) return;

    try {
      // Obter todos os pedidos
      const storedOrders = localStorage.getItem('orders');
      if (!storedOrders) {
        setError('Nenhum pedido encontrado no armazenamento local.');
        return;
      }

      const allOrders = JSON.parse(storedOrders);
      
      // Encontrar o pedido selecionado e atualizar seu status
      const updatedOrders = allOrders.map((order: Order) => {
        if (order.idVenda === selectedOrder.idVenda) {
          // Adicionar motivo da rejeição ao histórico
          const newHistoryEntry = `${new Date().toLocaleString('pt-BR')}: Pedido rejeitado - ${rejectReason}`;
          const updatedHistorico = order.historico 
            ? `${order.historico}\n${newHistoryEntry}` 
            : newHistoryEntry;

          return {
            ...order,
            situacaoVenda: 'Cancelado',
            historico: updatedHistorico,
            ultimaAtualizacao: new Date().toLocaleString('pt-BR')
          };
        }
        return order;
      });

      // Salvar os pedidos atualizados no localStorage
      localStorage.setItem('orders', JSON.stringify(updatedOrders));

      // Atualizar a lista de pedidos na página
      const pendingApprovalOrders = updatedOrders.filter(
        (order: Order) => 
          order.situacaoVenda && 
          order.situacaoVenda.toLowerCase() === 'liberação'
      );
      setOrders(pendingApprovalOrders);

      // Fechar o diálogo
      setOpenRejectDialog(false);
      setSelectedOrder(null);
      setRejectReason('');

      // Disparar evento para atualizar a contagem na barra lateral
      window.dispatchEvent(new CustomEvent('order-status-updated'));
    } catch (err) {
      setError('Erro ao rejeitar pedido: ' + (err instanceof Error ? err.message : String(err)));
    }
  };

  // Função para atualizar a lista de pedidos
  const refreshOrders = () => {
    try {
      setLoading(true);
      const storedOrders = localStorage.getItem('orders');
      if (storedOrders) {
        const parsedOrders = JSON.parse(storedOrders);
        // Filtrar apenas pedidos com status "Liberação"
        const pendingApprovalOrders = parsedOrders.filter(
          (order: Order) => 
            order.situacaoVenda && 
            order.situacaoVenda.toLowerCase() === 'liberação'
        );
        setOrders(pendingApprovalOrders);
      } else {
        setError('Nenhum pedido encontrado no armazenamento local.');
      }
    } catch (err) {
      setError('Erro ao carregar pedidos: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Aprovação de Pedidos
      </Typography>
      
      <Paper sx={{ p: 3, mb: 3, borderRadius: '12px' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">
            Pedidos Aguardando Aprovação
          </Typography>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={refreshOrders}
            disabled={loading}
          >
            Atualizar
          </Button>
        </Box>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : orders.length === 0 ? (
          <Alert severity="info">
            Não há pedidos aguardando aprovação no momento.
          </Alert>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Data</TableCell>
                  <TableCell>Cliente</TableCell>
                  <TableCell>Telefone</TableCell>
                  <TableCell>Valor</TableCell>
                  <TableCell>Vendedor</TableCell>
                  <TableCell>Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.idVenda}>
                    <TableCell>{order.idVenda}</TableCell>
                    <TableCell>{order.dataVenda}</TableCell>
                    <TableCell>{order.cliente}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {order.telefone}
                        <IconButton size="small" color="primary" href={`https://wa.me/55${order.telefone.replace(/\D/g, '')}`} target="_blank">
                          <PhoneIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </TableCell>
                    <TableCell>R$ {order.valorVenda.toFixed(2)}</TableCell>
                    <TableCell>{order.vendedor || '-'}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title="Aprovar">
                          <IconButton 
                            size="small" 
                            color="success"
                            onClick={() => {
                              setSelectedOrder(order);
                              setOpenDialog(true);
                            }}
                          >
                            <CheckCircleIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Rejeitar">
                          <IconButton 
                            size="small" 
                            color="error"
                            onClick={() => {
                              setSelectedOrder(order);
                              setOpenRejectDialog(true);
                            }}
                          >
                            <CancelIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Ver detalhes">
                          <IconButton 
                            size="small" 
                            color="primary"
                            onClick={() => {
                              // Navegar para a página de detalhes do pedido
                              // Implementar posteriormente
                            }}
                          >
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Diálogo de confirmação para aprovação */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
      >
        <DialogTitle>Confirmar Aprovação</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Tem certeza que deseja aprovar o pedido {selectedOrder?.idVenda}?
            O status será alterado para "Em Separação".
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} color="primary">
            Cancelar
          </Button>
          <Button onClick={handleApproveOrder} color="success" variant="contained">
            Aprovar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo de confirmação para rejeição */}
      <Dialog
        open={openRejectDialog}
        onClose={() => setOpenRejectDialog(false)}
      >
        <DialogTitle>Confirmar Rejeição</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Tem certeza que deseja rejeitar o pedido {selectedOrder?.idVenda}?
            O status será alterado para "Cancelado".
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="Motivo da rejeição"
            fullWidth
            variant="outlined"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenRejectDialog(false)} color="primary">
            Cancelar
          </Button>
          <Button 
            onClick={handleRejectOrder} 
            color="error" 
            variant="contained"
            disabled={!rejectReason.trim()}
          >
            Rejeitar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ApprovalPage;
