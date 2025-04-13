import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Container,
  Paper,
  Divider,
  Button,
  TextField,
  InputAdornment,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
  CircularProgress
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import RefreshIcon from '@mui/icons-material/Refresh';
import { Order } from '../types/Order';
import CorreiosTracker from '../components/CorreiosTracker';
import OrderService from '../services/OrderService';
import CorreiosService, { StatusUpdateResult } from '../services/CorreiosService';
import PageHeader from '../components/PageHeader';

// Estender a interface Order para incluir metodoPagamento
interface ExtendedOrder extends Order {
  metodoPagamento?: string;
}

const CorreiosTrackingPage: React.FC = () => {
  const [orders, setOrders] = useState<ExtendedOrder[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<ExtendedOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'info' | 'warning' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'info'
  });
  const [selectedOrder, setSelectedOrder] = useState<ExtendedOrder | null>(null);
  const [trackingCodeInput, setTrackingCodeInput] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);

  // Carrega os pedidos
  const loadOrders = async () => {
    try {
      setLoading(true);
      const response = await OrderService.getOrders();

      // Filtra apenas pedidos enviados por Correios
      const correiosOrders = response.filter((order: ExtendedOrder) =>
        order.metodoPagamento?.toLowerCase?.()?.includes('correios') ||
        order.codigoRastreio
      );

      setOrders(correiosOrders);
      setFilteredOrders(correiosOrders);
    } catch (error) {
      console.error('Erro ao carregar pedidos:', error);
      showNotification('Erro ao carregar pedidos', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Carrega os pedidos ao montar o componente
  useEffect(() => {
    loadOrders();
  }, []);

  // Filtra os pedidos com base no termo de busca
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredOrders(orders);
      return;
    }

    const lowerSearchTerm = searchTerm.toLowerCase();
    const filtered = orders.filter(order =>
      order.cliente.toLowerCase().includes(lowerSearchTerm) ||
      order.idVenda.toString().includes(lowerSearchTerm) ||
      (order.codigoRastreio && order.codigoRastreio.toLowerCase().includes(lowerSearchTerm)) ||
      (order.statusCorreios && order.statusCorreios.toLowerCase().includes(lowerSearchTerm))
    );

    setFilteredOrders(filtered);
  }, [searchTerm, orders]);

  // Exibe notificação
  const showNotification = (message: string, severity: 'success' | 'info' | 'warning' | 'error') => {
    setNotification({
      open: true,
      message,
      severity
    });
  };

  // Fecha notificação
  const handleCloseNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  // Atualiza o status do pedido
  const handleStatusUpdate = async (updatedOrders: StatusUpdateResult[]) => {
    try {
      // Aqui você pode implementar a chamada à API para atualizar o status no banco de dados

      // Atualiza o estado local com os novos status
      setOrders(prevOrders => {
        const newOrders = [...prevOrders];

        updatedOrders.forEach(update => {
          const index = newOrders.findIndex(order => String(order.idVenda) === String(update.orderId));
          if (index !== -1) {
            newOrders[index] = {
              ...newOrders[index],
              statusCorreios: update.newStatus,
              statusCritico: update.isCritical
            };
          }
        });

        return newOrders;
      });

      const criticalUpdates = updatedOrders.filter(update => update.isCritical);

      if (criticalUpdates.length > 0) {
        showNotification(`${criticalUpdates.length} pedidos com status crítico detectados!`, 'warning');
      } else if (updatedOrders.length > 0) {
        showNotification(`${updatedOrders.length} pedidos atualizados com sucesso`, 'success');
      } else {
        showNotification('Nenhuma atualização encontrada', 'info');
      }
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      showNotification('Erro ao atualizar status dos pedidos', 'error');
    }
  };

  // Abre diálogo para adicionar código de rastreio
  const handleOpenDialog = (order: ExtendedOrder) => {
    setSelectedOrder(order);
    setTrackingCodeInput(order.codigoRastreio || '');
    setDialogOpen(true);
  };

  // Fecha diálogo
  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedOrder(null);
    setTrackingCodeInput('');
  };

  // Salva código de rastreio
  const handleSaveTrackingCode = async () => {
    if (!selectedOrder) return;

    try {
      setLoading(true);

      // Chama o serviço para atualizar o código de rastreio
      await OrderService.updateTrackingCode(selectedOrder.idVenda, trackingCodeInput);

      // Atualiza o estado local
      setOrders(prevOrders => {
        return prevOrders.map(order => {
          if (order.idVenda === selectedOrder.idVenda) {
            return {
              ...order,
              codigoRastreio: trackingCodeInput
            };
          }
          return order;
        });
      });

      handleCloseDialog();
      showNotification('Código de rastreio salvo com sucesso', 'success');

      // Atualiza o status imediatamente
      if (trackingCodeInput) {
        const trackingInfo = await CorreiosService.rastrearEncomenda(trackingCodeInput);
        if (trackingInfo && trackingInfo.eventos && trackingInfo.eventos.length > 0) {
          const newStatus = trackingInfo.eventos[0].status;
          const isCritical = CorreiosService.isStatusCritical(newStatus);

          // Atualiza o pedido com o novo status
          setOrders(prevOrders => {
            return prevOrders.map(order => {
              if (order.idVenda === selectedOrder.idVenda) {
                return {
                  ...order,
                  statusCorreios: newStatus,
                  statusCritico: isCritical
                };
              }
              return order;
            });
          });
        }
      }
    } catch (error) {
      console.error('Erro ao salvar código de rastreio:', error);
      showNotification('Erro ao salvar código de rastreio', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ p: 3 }}>
      <PageHeader title="Rastreamento de Pedidos" />

      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">
            Gerenciamento de Envios
          </Typography>

          <Box>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={loadOrders}
              sx={{ mr: 2 }}
              disabled={loading}
            >
              Atualizar Lista
            </Button>

            <Button
              variant="contained"
              startIcon={<UploadFileIcon />}
              onClick={() => showNotification('Funcionalidade de importação em desenvolvimento', 'info')}
              disabled={loading}
            >
              Importar Códigos
            </Button>
          </Box>
        </Box>

        <Divider sx={{ mb: 3 }} />

        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Buscar por cliente, ID de venda ou código de rastreio..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        {loading && <LinearProgress sx={{ mb: 2 }} />}

        <Typography variant="subtitle1" sx={{ mb: 2 }}>
          {filteredOrders.length} pedidos encontrados
        </Typography>

        {!loading ? (
          <>
            <CorreiosTracker
              orders={filteredOrders as Order[]}
              onOrdersUpdated={(updatedOrders) => {
                setOrders(updatedOrders as ExtendedOrder[]);
              }}
            />

            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Pedidos sem Código de Rastreio
              </Typography>

              {orders.filter(order => !order.codigoRastreio).length === 0 ? (
                <Alert severity="success">Todos os pedidos possuem código de rastreio</Alert>
              ) : (
                <Paper variant="outlined" sx={{ p: 2 }}>
                  {orders.filter(order => !order.codigoRastreio).map(order => (
                    <Box
                      key={order.idVenda}
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        p: 1,
                        mb: 1,
                        '&:hover': { bgcolor: 'action.hover' }
                      }}
                    >
                      <Box>
                        <Typography variant="subtitle2">
                          {order.cliente} - ID: {order.idVenda}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Data: {new Date(order.dataVenda).toLocaleDateString()}
                        </Typography>
                      </Box>

                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => handleOpenDialog(order as ExtendedOrder)}
                      >
                        Adicionar Código
                      </Button>
                    </Box>
                  ))}
                </Paper>
              )}
            </Box>
          </>
        ) : (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        )}
      </Paper>

      {/* Diálogo para adicionar código de rastreio */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
      >
        <DialogTitle>
          {selectedOrder ? 'Editar Código de Rastreio' : 'Adicionar Código de Rastreio'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Código de Rastreio"
            fullWidth
            value={trackingCodeInput}
            onChange={(e) => setTrackingCodeInput(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button onClick={handleSaveTrackingCode} color="primary">
            Salvar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notificação */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseNotification} severity={notification.severity}>
          {notification.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default CorreiosTrackingPage;