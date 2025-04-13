import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Alert,
  CircularProgress,
  Grid,
  Chip,
  Tooltip,
  List,
  ListItem,
  ListItemText,
  Divider,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Snackbar
} from '@mui/material';
import {
  LocalShipping as ShippingIcon,
  Search as SearchIcon,
  Add as AddIcon,
  Check as CheckIcon,
  Warning as WarningIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { Order } from '../types/Order';
import CorreiosService, { TrackingInfo, StatusUpdateResult } from '../services/CorreiosService';

interface CorreiosTrackerProps {
  orders: Order[];
  onOrdersUpdated?: (updatedOrders: Order[]) => void;
  onStatusUpdate?: (updatedOrders: StatusUpdateResult[]) => Promise<void>;
}

const CorreiosTracker: React.FC<CorreiosTrackerProps> = ({ orders, onOrdersUpdated }) => {
  const [trackingOrders, setTrackingOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({ open: false, message: '', severity: 'info' });
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [trackingCode, setTrackingCode] = useState('');
  const [trackingDialog, setTrackingDialog] = useState(false);
  const [trackingDetails, setTrackingDetails] = useState<TrackingInfo | null>(null);
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [detailsDialog, setDetailsDialog] = useState(false);

  useEffect(() => {
    // Filtra apenas pedidos com código de rastreio
    const ordersWithTracking = orders.filter(order =>
      order.codigoRastreio && order.codigoRastreio.trim() !== ''
    );
    setTrackingOrders(ordersWithTracking);
    applyFilters(ordersWithTracking, searchTerm);
  }, [orders]);

  const applyFilters = (ordersList: Order[], search: string) => {
    let filtered = [...ordersList];

    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(order =>
        (order.cliente && order.cliente.toLowerCase().includes(searchLower)) ||
        (order.idVenda && order.idVenda.toString().includes(search)) ||
        (order.codigoRastreio && order.codigoRastreio.toLowerCase().includes(searchLower))
      );
    }

    setFilteredOrders(filtered);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchTerm(value);
    applyFilters(trackingOrders, value);
  };

  const showNotification = (message: string, severity: 'success' | 'error' | 'info' | 'warning') => {
    setNotification({ open: true, message, severity });
  };

  const closeNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  const checkUpdates = async () => {
    if (trackingOrders.length === 0) {
      showNotification('Não há pedidos com código de rastreio para verificar', 'info');
      return;
    }

    setLoading(true);
    try {
      const pedidosMap = trackingOrders.map(order => ({
        idVenda: order.idVenda,
        codigoRastreio: order.codigoRastreio,
        statusCorreios: order.statusCorreios
      }));

      const updates = await CorreiosService.verificarAtualizacoes(pedidosMap);

      if (updates.length === 0) {
        showNotification('Nenhuma atualização encontrada', 'info');
      } else {
        // Atualiza os pedidos com os novos status
        const updatedOrders = orders.map(order => {
          const update = updates.find(u => u.orderId === order.idVenda);
          if (update) {
            return {
              ...order,
              statusCorreios: update.newStatus
            };
          }
          return order;
        });

        if (onOrdersUpdated) {
          onOrdersUpdated(updatedOrders);
        }

        // Notifica sobre atualizações críticas
        const criticalUpdates = updates.filter(update => update.isCritical);
        if (criticalUpdates.length > 0) {
          showNotification(`${criticalUpdates.length} pedidos com status crítico encontrados!`, 'warning');
        } else {
          showNotification(`${updates.length} pedidos atualizados com sucesso`, 'success');
        }
      }
    } catch (error) {
      console.error('Erro ao verificar atualizações:', error);
      showNotification('Erro ao verificar atualizações dos pedidos', 'error');
    } finally {
      setLoading(false);
    }
  };

  const openTrackingDialog = (order: Order) => {
    setSelectedOrder(order);
    setTrackingCode(order.codigoRastreio || '');
    setTrackingDialog(true);
  };

  const closeTrackingDialog = () => {
    setTrackingDialog(false);
    setSelectedOrder(null);
    setTrackingCode('');
  };

  const saveTrackingCode = () => {
    if (!selectedOrder || !trackingCode.trim()) return;

    const updatedOrders = orders.map(order => {
      if (order.idVenda === selectedOrder.idVenda) {
        return {
          ...order,
          codigoRastreio: trackingCode.trim()
        };
      }
      return order;
    });

    if (onOrdersUpdated) {
      onOrdersUpdated(updatedOrders);
    }

    closeTrackingDialog();
    showNotification('Código de rastreio salvo com sucesso', 'success');
  };

  const viewTrackingDetails = async (order: Order) => {
    if (!order.codigoRastreio) return;

    setSelectedOrder(order);
    setTrackingLoading(true);
    setDetailsDialog(true);

    try {
      const details = await CorreiosService.rastrearEncomenda(order.codigoRastreio);
      setTrackingDetails(details);
    } catch (error) {
      console.error('Erro ao obter detalhes do rastreio:', error);
      showNotification('Erro ao obter detalhes do rastreio', 'error');
    } finally {
      setTrackingLoading(false);
    }
  };

  const closeDetailsDialog = () => {
    setDetailsDialog(false);
    setSelectedOrder(null);
    setTrackingDetails(null);
  };

  const getStatusColor = (status?: string): 'default' | 'success' | 'warning' | 'error' | 'info' => {
    if (!status) return 'default';

    const statusLower = status.toLowerCase();

    if (statusLower.includes('entregue') || statusLower.includes('entrega efetuada')) {
      return 'success';
    } else if (CorreiosService.isStatusCritical(status)) {
      return 'error';
    } else if (statusLower.includes('saiu para entrega')) {
      return 'info';
    } else if (statusLower.includes('em trânsito')) {
      return 'warning';
    }

    return 'default';
  };

  return (
    <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
      <Box display="flex" flexDirection="column" height="100%">
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h6" component="h2">
            <ShippingIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Rastreamento Correios
          </Typography>
          <Box>
            <Button
              variant="outlined"
              startIcon={<SearchIcon />}
              onClick={checkUpdates}
              disabled={loading}
              sx={{ mr: 1 }}
            >
              {loading ? <CircularProgress size={24} /> : 'Atualizar Status'}
            </Button>
          </Box>
        </Box>

        <Box mb={3}>
          <TextField
            fullWidth
            variant="outlined"
            size="small"
            placeholder="Buscar por cliente, número do pedido ou código de rastreio"
            value={searchTerm}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1, color: 'action.active' }} />,
            }}
          />
        </Box>

        <Box flexGrow={1} sx={{ overflowY: 'auto' }}>
          {filteredOrders.length === 0 ? (
            <Box display="flex" justifyContent="center" alignItems="center" height="100%">
              <Typography color="textSecondary">
                {trackingOrders.length === 0
                  ? 'Nenhum pedido com código de rastreio encontrado'
                  : 'Nenhum pedido corresponde à sua busca'}
              </Typography>
            </Box>
          ) : (
            <List>
              {filteredOrders.map((order, index) => (
                <React.Fragment key={order.idVenda}>
                  <ListItem
                    alignItems="flex-start"
                    sx={{
                      cursor: 'pointer',
                      '&:hover': { bgcolor: 'action.hover' },
                      bgcolor: CorreiosService.isStatusCritical(order.statusCorreios || '')
                        ? 'rgba(244, 67, 54, 0.1)' // Vermelho claro para alertas
                        : 'transparent'
                    }}
                    onClick={() => viewTrackingDetails(order)}
                  >
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={3}>
                        <ListItemText
                          primary={`Pedido #${order.idVenda}`}
                          secondary={order.cliente}
                        />
                      </Grid>
                      <Grid item xs={12} sm={3}>
                        <ListItemText
                          primary="Código de Rastreio"
                          secondary={
                            <Typography
                              component="span"
                              variant="body2"
                              color="primary"
                              sx={{ fontWeight: 'medium' }}
                            >
                              {order.codigoRastreio}
                            </Typography>
                          }
                        />
                      </Grid>
                      <Grid item xs={12} sm={5}>
                        <ListItemText
                          primary="Status"
                          secondary={
                            order.statusCorreios ? (
                              <Chip
                                size="small"
                                label={order.statusCorreios}
                                color={getStatusColor(order.statusCorreios)}
                                icon={CorreiosService.isStatusCritical(order.statusCorreios) ? <WarningIcon /> : undefined}
                              />
                            ) : (
                              <Typography variant="body2" color="textSecondary">
                                Sem status
                              </Typography>
                            )
                          }
                        />
                      </Grid>
                      <Grid item xs={12} sm={1} container justifyContent="flex-end" alignItems="center">
                        <IconButton size="small" onClick={(e) => {
                          e.stopPropagation();
                          openTrackingDialog(order);
                        }}>
                          <AddIcon fontSize="small" />
                        </IconButton>
                      </Grid>
                    </Grid>
                  </ListItem>
                  {index < filteredOrders.length - 1 && <Divider component="li" />}
                </React.Fragment>
              ))}
            </List>
          )}
        </Box>
      </Box>

      {/* Dialog para adicionar/editar código de rastreio */}
      <Dialog open={trackingDialog} onClose={closeTrackingDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedOrder?.codigoRastreio
            ? 'Editar Código de Rastreio'
            : 'Adicionar Código de Rastreio'}
        </DialogTitle>
        <DialogContent>
          <Box mt={1}>
            <Typography variant="subtitle2" gutterBottom>
              Pedido #{selectedOrder?.idVenda} - {selectedOrder?.cliente}
            </Typography>
            <TextField
              fullWidth
              label="Código de Rastreio"
              value={trackingCode}
              onChange={(e) => setTrackingCode(e.target.value)}
              margin="normal"
              variant="outlined"
              placeholder="Ex: BR123456789BR"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeTrackingDialog}>Cancelar</Button>
          <Button
            onClick={saveTrackingCode}
            variant="contained"
            color="primary"
            disabled={!trackingCode.trim()}
          >
            Salvar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog para mostrar detalhes do rastreamento */}
      <Dialog open={detailsDialog} onClose={closeDetailsDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">
              Detalhes do Rastreamento
            </Typography>
            <IconButton edge="end" color="inherit" onClick={closeDetailsDialog} aria-label="close">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {trackingLoading ? (
            <Box display="flex" justifyContent="center" p={4}>
              <CircularProgress />
            </Box>
          ) : trackingDetails ? (
            <Box>
              <Box mb={3}>
                <Typography variant="subtitle1" gutterBottom>
                  Pedido #{selectedOrder?.idVenda} - {selectedOrder?.cliente}
                </Typography>
                <Typography variant="subtitle2" gutterBottom>
                  Código: <strong>{trackingDetails.codigo}</strong>
                </Typography>
                <Chip
                  icon={trackingDetails.entregue ? <CheckIcon /> : undefined}
                  label={trackingDetails.entregue ? "Entregue" : "Em andamento"}
                  color={trackingDetails.entregue ? "success" : "warning"}
                  sx={{ mt: 1 }}
                />
              </Box>

              <Typography variant="h6" gutterBottom>
                Histórico de eventos
              </Typography>
              <List>
                {trackingDetails.eventos.map((evento, index) => (
                  <React.Fragment key={index}>
                    <ListItem alignItems="flex-start">
                      <ListItemText
                        primary={
                          <Box display="flex" justifyContent="space-between">
                            <Typography variant="subtitle2">
                              {evento.status}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                              {evento.data} {evento.hora}
                            </Typography>
                          </Box>
                        }
                        secondary={
                          <React.Fragment>
                            <Typography variant="body2" component="span" color="textPrimary">
                              {evento.local}
                            </Typography>
                            {evento.subStatus && (
                              <Typography variant="body2" component="p" color="textSecondary">
                                {evento.subStatus}
                              </Typography>
                            )}
                          </React.Fragment>
                        }
                      />
                    </ListItem>
                    {index < trackingDetails.eventos.length - 1 && <Divider component="li" />}
                  </React.Fragment>
                ))}
              </List>
            </Box>
          ) : (
            <Box p={3} textAlign="center">
              <Typography color="textSecondary">
                Nenhuma informação de rastreamento disponível
              </Typography>
            </Box>
          )}
        </DialogContent>
      </Dialog>

      {/* Snackbar para notificações */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={closeNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={closeNotification}
          severity={notification.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Paper>
  );
};

export default CorreiosTracker;