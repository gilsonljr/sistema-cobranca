import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Button, CircularProgress, TextField, Paper, Grid } from '@mui/material';
import PageHeader from '../components/PageHeader';
import TrackingDashboard from '../components/TrackingDashboard';
import OrdersTable from '../components/OrdersTable';
import TrackingHistory from '../components/TrackingHistory';
import { Order } from '../types/Order';
import api from '../services/api';
import CorreiosService from '../services/CorreiosService';

const TrackingPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [loadingStatus, setLoadingStatus] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Carregar pedidos do servidor
  useEffect(() => {
    fetchOrders();
  }, []);

  // Filtrar pedidos quando o termo de busca mudar
  useEffect(() => {
    filterOrders();
  }, [searchTerm, orders]);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.get('/orders');

      // Filtrar apenas pedidos com código de rastreio
      const ordersWithTracking = response.data.filter(
        (order: Order) => !!order.codigoRastreio
      );

      setOrders(ordersWithTracking);
      setFilteredOrders(ordersWithTracking);
    } catch (err) {
      console.error('Erro ao buscar pedidos:', err);
      setError('Não foi possível carregar os pedidos. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };

  const filterOrders = () => {
    if (!searchTerm.trim()) {
      setFilteredOrders(orders);
      return;
    }

    const lowercaseTerm = searchTerm.toLowerCase();
    const filtered = orders.filter(order =>
      order.cliente.toLowerCase().includes(lowercaseTerm) ||
      order.idVenda.toLowerCase().includes(lowercaseTerm) ||
      order.codigoRastreio.toLowerCase().includes(lowercaseTerm) ||
      (order.statusCorreios && order.statusCorreios.toLowerCase().includes(lowercaseTerm))
    );

    setFilteredOrders(filtered);
  };

  const updateTrackingStatuses = async () => {
    if (orders.length === 0) return;

    setLoadingStatus(true);
    setError(null);

    try {
      // Preparar lista de pedidos para verificação de rastreio
      const trackingRequests = orders
        .filter(order => !!order.codigoRastreio)
        .map(order => ({
          idVenda: order.idVenda,
          codigoRastreio: order.codigoRastreio,
          statusCorreios: order.statusCorreios
        }));

      // Realizar verificações de rastreio em lote
      const updates = await CorreiosService.verificarAtualizacoes(trackingRequests);

      if (updates.length > 0) {
        // Se houve atualizações, refletir no estado local
        const updatedOrders = [...orders];

        for (const update of updates) {
          const index = updatedOrders.findIndex(o => o.idVenda === update.orderId);
          if (index !== -1) {
            updatedOrders[index] = {
              ...updatedOrders[index],
              statusCorreios: update.newStatus,
              statusCritico: update.isCritical,
              atualizacaoCorreios: update.formattedTimestamp || ''
            };
          }
        }

        setOrders(updatedOrders);

        // Em um caso real, também enviaríamos essas atualizações para o servidor
        try {
          await api.post('/orders/tracking-updates', updates);
        } catch (err) {
          console.error('Erro ao salvar atualizações no servidor:', err);
        }
      }
    } catch (err) {
      console.error('Erro ao atualizar status de rastreio:', err);
      setError('Falha ao atualizar os status de rastreio. Tente novamente.');
    } finally {
      setLoadingStatus(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <PageHeader title="Rastreamento de Pedidos" />

      {error && (
        <Box mb={4}>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              bgcolor: 'error.light',
              color: 'error.dark',
              borderRadius: 2
            }}
          >
            <Typography>{error}</Typography>
          </Paper>
        </Box>
      )}

      {loading ? (
        <Box display="flex" justifyContent="center" my={6}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Box mb={4}>
            <TrackingDashboard
              orders={orders}
              onRefresh={updateTrackingStatuses}
            />
          </Box>

          <Box mb={4}>
            <TrackingHistory orders={orders} maxEntries={10} />
          </Box>

          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
              mb: 4
            }}
          >
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h6">
                Pedidos com Rastreio ({filteredOrders.length})
              </Typography>

              <Box display="flex" gap={2}>
                <TextField
                  placeholder="Buscar pedido..."
                  variant="outlined"
                  size="small"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Button
                  variant="contained"
                  onClick={updateTrackingStatuses}
                  disabled={loadingStatus}
                  startIcon={loadingStatus ? <CircularProgress size={20} /> : undefined}
                >
                  {loadingStatus ? 'Atualizando...' : 'Atualizar Status'}
                </Button>
              </Box>
            </Box>

            <OrdersTable
              orders={filteredOrders}
              onOrderUpdate={(updatedOrder) => {
                // Update the order in the orders array
                const updatedOrders = [...orders];
                const index = updatedOrders.findIndex(order => order.idVenda === updatedOrder.idVenda);
                if (index !== -1) {
                  updatedOrders[index] = updatedOrder;
                  setOrders(updatedOrders);
                }
              }}
            />
          </Paper>
        </>
      )}
    </Container>
  );
};

export default TrackingPage;