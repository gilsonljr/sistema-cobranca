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
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Visibility as VisibilityIcon,
  Phone as PhoneIcon,
} from '@mui/icons-material';
import { Order } from '../types/Order';
import OrderService from '../services/OrderService';

const DuplicateOrdersPage: React.FC = () => {
  const [duplicateOrders, setDuplicateOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  console.log("DuplicateOrdersPage mounted");

  // Agrupar pedidos duplicados por telefone
  const groupedOrders = duplicateOrders.reduce((groups, order) => {
    const phone = order.telefone || 'unknown';
    if (!groups[phone]) {
      groups[phone] = [];
    }
    groups[phone].push(order);
    return groups;
  }, {} as Record<string, Order[]>);

  // Carregar pedidos duplicados
  const loadDuplicateOrders = async () => {
    console.log("Loading duplicate orders...");
    try {
      setLoading(true);
      setError(null);
      
      // Get mock mode status
      const mockMode = process.env.REACT_APP_MOCK_API === 'true';
      console.log("Mock mode:", mockMode);
      
      // If in mock mode, check localStorage directly first
      if (mockMode) {
        const savedOrders = localStorage.getItem('orders');
        console.log("Orders in localStorage:", savedOrders ? JSON.parse(savedOrders).length : 0);
      }
      
      const orders = await OrderService.getDuplicateOrders();
      console.log("Duplicate orders loaded:", orders.length, orders);
      setDuplicateOrders(orders);
    } catch (err: any) {
      console.error('Erro ao carregar pedidos duplicados:', err);
      setError('Erro ao carregar pedidos duplicados. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  // Executar detecção de duplicados
  const runDuplicateDetection = async () => {
    console.log("Running duplicate detection...");
    try {
      setLoading(true);
      setError(null);

      // Aqui você chamaria a API para executar a detecção de duplicados
      const duplicates = await OrderService.detectDuplicates();
      console.log("Detected duplicates:", duplicates.length, duplicates);
      setDuplicateOrders(duplicates);

      setSuccess('Detecção de duplicados executada com sucesso.');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      console.error('Erro ao executar detecção de duplicados:', err);
      setError('Erro ao executar detecção de duplicados. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  // Marcar pedido como não duplicado
  const markAsNotDuplicate = async (orderId: string) => {
    console.log("Marking order as not duplicate:", orderId);
    try {
      setLoading(true);

      // Atualizar o pedido para não ser mais considerado duplicado
      await OrderService.updateOrder(orderId, { situacaoVenda: 'Liberação' });

      // Remover o pedido da lista local
      setDuplicateOrders(prev => prev.filter(order => order.idVenda !== orderId));

      setSuccess('Pedido marcado como não duplicado.');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      console.error('Erro ao marcar pedido como não duplicado:', err);
      setError('Erro ao marcar pedido como não duplicado. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  // Carregar pedidos ao montar o componente
  useEffect(() => {
    console.log("DuplicateOrdersPage useEffect");
    loadDuplicateOrders();
  }, []);

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          Pedidos Duplicados
        </Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={loadDuplicateOrders}
            sx={{ mr: 2 }}
            disabled={loading}
          >
            Atualizar
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={runDuplicateDetection}
            disabled={loading}
          >
            Executar Detecção
          </Button>
        </Box>
      </Box>

      {loading && <CircularProgress sx={{ display: 'block', mx: 'auto', my: 4 }} />}

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {success}
        </Alert>
      )}

      {!loading && Object.keys(groupedOrders).length === 0 && (
        <Alert severity="info" sx={{ mb: 3 }}>
          Não foram encontrados pedidos duplicados.
        </Alert>
      )}

      {Object.entries(groupedOrders).map(([phone, orders]) => (
        <Paper key={phone} sx={{ width: '100%', overflow: 'hidden', mb: 4 }}>
          <Box sx={{ p: 2, bgcolor: 'primary.main', color: 'white' }}>
            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
              <PhoneIcon sx={{ mr: 1 }} />
              Telefone: {phone} ({orders.length} pedidos)
            </Typography>
          </Box>
          <TableContainer>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>ID do Pedido</TableCell>
                  <TableCell>Cliente</TableCell>
                  <TableCell>Data</TableCell>
                  <TableCell>Valor</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.idVenda}>
                    <TableCell>{order.idVenda}</TableCell>
                    <TableCell>{order.cliente}</TableCell>
                    <TableCell>{order.dataVenda}</TableCell>
                    <TableCell>R$ {order.valorVenda.toFixed(2)}</TableCell>
                    <TableCell>
                      <Chip
                        label={order.situacaoVenda}
                        color={
                          order.situacaoVenda === 'Pago' ? 'success' :
                          order.situacaoVenda === 'Parcialmente Pago' ? 'info' :
                          order.situacaoVenda === 'Possíveis Duplicados' ? 'warning' :
                          order.situacaoVenda === 'Cancelado' ? 'error' :
                          'default'
                        }
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Tooltip title="Ver detalhes">
                        <IconButton size="small" color="primary">
                          <VisibilityIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Marcar como não duplicado">
                        <IconButton
                          size="small"
                          color="success"
                          onClick={() => markAsNotDuplicate(order.idVenda)}
                        >
                          <CheckCircleIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      ))}

      {/* Debug section */}
      {process.env.NODE_ENV === 'development' && (
        <Paper sx={{ mt: 4, p: 2 }}>
          <Typography variant="h6">Debug Information</Typography>
          <Box sx={{ mt: 1 }}>
            <Typography variant="body2">
              REACT_APP_MOCK_API: {process.env.REACT_APP_MOCK_API === 'true' ? 'true' : 'false'}
            </Typography>
            <Typography variant="body2">
              Total duplicate orders: {duplicateOrders.length}
            </Typography>
            <Typography variant="body2">
              Grouped by phone: {Object.keys(groupedOrders).length} groups
            </Typography>
            <Button 
              variant="outlined" 
              size="small" 
              sx={{ mt: 1 }}
              onClick={() => {
                // Test to add a duplicate order to localStorage
                const savedOrders = localStorage.getItem('orders');
                const orders = savedOrders ? JSON.parse(savedOrders) : [];
                console.log("Current orders in localStorage:", orders.length);
              }}
            >
              Check localStorage
            </Button>
          </Box>
        </Paper>
      )}
    </Box>
  );
};

export default DuplicateOrdersPage;