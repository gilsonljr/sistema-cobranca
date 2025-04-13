import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemText,
  Divider,
  Box,
  Typography,
  Chip,
  Alert,
  CircularProgress,
  IconButton,
  Badge,
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import ErrorIcon from '@mui/icons-material/Error';
import RefreshIcon from '@mui/icons-material/Refresh';
import CorreiosService, { StatusUpdateResult } from '../services/CorreiosService';
import { Order } from '../types/Order';

interface CorreiosMonitorProps {
  orders: Order[];
  onOrdersUpdate: (orders: Order[]) => void;
}

// Interface para as atualizações de rastreio
interface TrackingUpdate {
  codigo: string;
  status: string;
  critico: boolean;
  atualizado: boolean;
  pedido: Order;
}

const CorreiosMonitor: React.FC<CorreiosMonitorProps> = ({ orders, onOrdersUpdate }) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);
  const [trackingUpdates, setTrackingUpdates] = useState<TrackingUpdate[]>([]);

  // Contador de alertas críticos
  const criticalCount = trackingUpdates.filter(update => update.critico).length;

  // Abrir o monitor
  const handleOpen = () => {
    setOpen(true);
  };

  // Fechar o monitor
  const handleClose = () => {
    setOpen(false);
  };

  // Verificar atualizações de rastreio
  const checkTrackingUpdates = async () => {
    setLoading(true);

    try {
      // Filtrar pedidos com código de rastreio
      const trackableOrders = orders.filter(order =>
        order.codigoRastreio && order.codigoRastreio.trim() !== ''
      );

      // Preparar dados para consulta
      const trackingData = trackableOrders.map(order => ({
        idVenda: order.idVenda,
        codigoRastreio: order.codigoRastreio,
        statusCorreios: order.statusCorreios || ''
      }));

      // Consultar status atualizado
      if (trackingData.length > 0) {
        const updates = await CorreiosService.verificarAtualizacoes(trackingData);

        // Associar pedidos aos resultados e garantir que todos os campos estejam presentes
        const updatesWithOrders: TrackingUpdate[] = updates.map((update: StatusUpdateResult, index: number) => ({
          codigo: update.trackingCode,
          status: update.newStatus,
          critico: update.isCritical,
          atualizado: true, // Consideramos que todas as atualizações são novas
          pedido: trackableOrders[index]
        }));

        // Atualizar o estado
        setTrackingUpdates(updatesWithOrders);
        setLastCheck(new Date());

        // Atualizar automaticamente os pedidos com novos status
        const updatedOrders = [...orders];
        updatesWithOrders.forEach(update => {
          if (update.atualizado) {
            const index = updatedOrders.findIndex(o =>
              o.codigoRastreio === update.codigo
            );

            if (index !== -1) {
              updatedOrders[index] = {
                ...updatedOrders[index],
                statusCorreios: update.status
              };
            }
          }
        });

        // Se houver atualizações, atualizar os pedidos
        if (updatesWithOrders.some(u => u.atualizado)) {
          onOrdersUpdate(updatedOrders);
        }
      }
    } catch (error) {
      console.error('Erro ao verificar atualizações de rastreio:', error);
    } finally {
      setLoading(false);
    }
  };

  // Verificar atualizações periodicamente
  useEffect(() => {
    // Verificar na primeira vez
    checkTrackingUpdates();

    // Configurar verificação a cada 30 minutos
    const interval = setInterval(() => {
      checkTrackingUpdates();
    }, 30 * 60 * 1000);

    return () => clearInterval(interval);
  }, [orders]);

  return (
    <>
      <IconButton
        color="primary"
        onClick={handleOpen}
        aria-label="Monitor dos Correios"
      >
        <Badge badgeContent={criticalCount} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>

      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6">Monitor de Rastreamento dos Correios</Typography>
            <Box>
              <Button
                startIcon={<RefreshIcon />}
                onClick={checkTrackingUpdates}
                disabled={loading}
                size="small"
              >
                Atualizar
              </Button>
            </Box>
          </Box>
        </DialogTitle>

        <DialogContent>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              {trackingUpdates.length === 0 ? (
                <Alert severity="info" sx={{ mb: 2 }}>
                  Nenhum pedido com código de rastreio encontrado.
                </Alert>
              ) : (
                <>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Última verificação: {lastCheck ? lastCheck.toLocaleString('pt-BR') : 'Nunca'}
                  </Typography>

                  {trackingUpdates.filter(update => update.critico).length > 0 && (
                    <Alert severity="warning" sx={{ mb: 2 }}>
                      <Typography variant="subtitle2">
                        Atenção! Existem {trackingUpdates.filter(update => update.critico).length} pedidos que precisam de atenção.
                      </Typography>
                    </Alert>
                  )}

                  <List>
                    {trackingUpdates.map((update, index) => (
                      <React.Fragment key={update.codigo}>
                        <ListItem
                          sx={{
                            bgcolor: update.critico ? 'rgba(255, 152, 0, 0.12)' : 'transparent',
                            borderLeft: update.critico ? '4px solid #f57c00' : 'none',
                          }}
                        >
                          <ListItemText
                            primary={
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Typography fontWeight={500}>
                                  {update.pedido.cliente} - {update.codigo}
                                </Typography>
                                {update.critico && (
                                  <ErrorIcon color="warning" sx={{ ml: 1 }} />
                                )}
                              </Box>
                            }
                            secondary={
                              <>
                                <Typography variant="body2" component="span">
                                  ID Venda: {update.pedido.idVenda}
                                </Typography>
                                <Box sx={{ mt: 1 }}>
                                  <Chip
                                    label={update.status}
                                    size="small"
                                    color={update.critico ? 'warning' : 'default'}
                                    sx={{ mr: 1 }}
                                  />
                                  {update.atualizado && (
                                    <Chip
                                      label="Atualizado"
                                      size="small"
                                      color="info"
                                    />
                                  )}
                                </Box>
                              </>
                            }
                          />
                        </ListItem>
                        {index < trackingUpdates.length - 1 && <Divider />}
                      </React.Fragment>
                    ))}
                  </List>
                </>
              )}
            </>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose}>Fechar</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default CorreiosMonitor;