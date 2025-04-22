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
  LocalShipping as LocalShippingIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import { Order } from '../types/Order';
import StatusChip from '../components/StatusChip';

const TrackingManagementPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [trackingCode, setTrackingCode] = useState('');

  // Carregar pedidos do localStorage
  useEffect(() => {
    const loadOrders = () => {
      try {
        setLoading(true);
        const storedOrders = localStorage.getItem('orders');
        if (storedOrders) {
          const parsedOrders = JSON.parse(storedOrders);
          // Filtrar apenas pedidos com status "Em Separação"
          const inProcessingOrders = parsedOrders.filter(
            (order: Order) => 
              order.situacaoVenda && 
              order.situacaoVenda.toLowerCase() === 'em separação'
          );
          setOrders(inProcessingOrders);
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

  // Função para adicionar código de rastreio
  const handleAddTrackingCode = () => {
    if (!selectedOrder || !trackingCode.trim()) return;

    try {
      // Obter todos os pedidos
      const storedOrders = localStorage.getItem('orders');
      if (!storedOrders) {
        setError('Nenhum pedido encontrado no armazenamento local.');
        return;
      }

      const allOrders = JSON.parse(storedOrders);
      
      // Encontrar o pedido selecionado e atualizar seu status e código de rastreio
      const updatedOrders = allOrders.map((order: Order) => {
        if (order.idVenda === selectedOrder.idVenda) {
          return {
            ...order,
            situacaoVenda: 'Em Trânsito',
            codigoRastreio: trackingCode.trim(),
            ultimaAtualizacao: new Date().toLocaleString('pt-BR')
          };
        }
        return order;
      });

      // Salvar os pedidos atualizados no localStorage
      localStorage.setItem('orders', JSON.stringify(updatedOrders));

      // Atualizar a lista de pedidos na página
      const inProcessingOrders = updatedOrders.filter(
        (order: Order) => 
          order.situacaoVenda && 
          order.situacaoVenda.toLowerCase() === 'em separação'
      );
      setOrders(inProcessingOrders);

      // Fechar o diálogo
      setOpenDialog(false);
      setSelectedOrder(null);
      setTrackingCode('');

      // Disparar evento para atualizar a contagem na barra lateral
      window.dispatchEvent(new CustomEvent('order-status-updated'));
    } catch (err) {
      setError('Erro ao adicionar código de rastreio: ' + (err instanceof Error ? err.message : String(err)));
    }
  };

  // Função para atualizar a lista de pedidos
  const refreshOrders = () => {
    try {
      setLoading(true);
      const storedOrders = localStorage.getItem('orders');
      if (storedOrders) {
        const parsedOrders = JSON.parse(storedOrders);
        // Filtrar apenas pedidos com status "Em Separação"
        const inProcessingOrders = parsedOrders.filter(
          (order: Order) => 
            order.situacaoVenda && 
            order.situacaoVenda.toLowerCase() === 'em separação'
        );
        setOrders(inProcessingOrders);
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
        Gerenciamento de Rastreio
      </Typography>
      
      <Paper sx={{ p: 3, mb: 3, borderRadius: '12px' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">
            Pedidos Em Separação
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
            Não há pedidos em separação no momento.
          </Alert>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Data</TableCell>
                  <TableCell>Cliente</TableCell>
                  <TableCell>Valor</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.idVenda}>
                    <TableCell>{order.idVenda}</TableCell>
                    <TableCell>{order.dataVenda}</TableCell>
                    <TableCell>{order.cliente}</TableCell>
                    <TableCell>R$ {order.valorVenda.toFixed(2)}</TableCell>
                    <TableCell>
                      <StatusChip status={order.situacaoVenda} />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title="Adicionar Código de Rastreio">
                          <IconButton 
                            size="small" 
                            color="primary"
                            onClick={() => {
                              setSelectedOrder(order);
                              setTrackingCode(order.codigoRastreio || '');
                              setOpenDialog(true);
                            }}
                          >
                            <LocalShippingIcon fontSize="small" />
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

      {/* Diálogo para adicionar código de rastreio */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
      >
        <DialogTitle>Adicionar Código de Rastreio</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Adicione o código de rastreio para o pedido {selectedOrder?.idVenda}.
            O status será alterado automaticamente para "Em Trânsito".
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="Código de Rastreio"
            fullWidth
            variant="outlined"
            value={trackingCode}
            onChange={(e) => setTrackingCode(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} color="primary">
            Cancelar
          </Button>
          <Button 
            onClick={handleAddTrackingCode} 
            color="primary" 
            variant="contained"
            disabled={!trackingCode.trim()}
          >
            Salvar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TrackingManagementPage;
