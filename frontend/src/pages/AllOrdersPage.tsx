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
} from '@mui/material';
import { Order } from '../types/Order';
import StatusChip from '../components/StatusChip';

const AllOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  
  useEffect(() => {
    // Carregar todos os pedidos do localStorage
    const storedOrders = localStorage.getItem('orders');
    if (storedOrders) {
      setOrders(JSON.parse(storedOrders));
    }
  }, []);
  
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Todos os Pedidos ({orders.length})
      </Typography>
      
      <Paper sx={{ p: 3, mb: 3, borderRadius: '12px' }}>
        <Typography variant="body1" paragraph>
          Esta página mostra todos os pedidos do sistema sem paginação ou limitação.
        </Typography>
        
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Data</TableCell>
                <TableCell>Cliente</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Vendedor</TableCell>
                <TableCell>Operador</TableCell>
                <TableCell>Valor</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.idVenda}>
                  <TableCell>{order.idVenda}</TableCell>
                  <TableCell>{order.dataVenda}</TableCell>
                  <TableCell>{order.cliente}</TableCell>
                  <TableCell>
                    <StatusChip status={order.situacaoVenda} />
                  </TableCell>
                  <TableCell>{order.vendedor || '-'}</TableCell>
                  <TableCell>{order.operador || '-'}</TableCell>
                  <TableCell>R$ {order.valorVenda.toFixed(2)}</TableCell>
                </TableRow>
              ))}
              {orders.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    Nenhum pedido encontrado
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
      
      <Button
        variant="outlined"
        color="primary"
        href="/"
        sx={{ mt: 2 }}
      >
        Voltar para a Página Principal
      </Button>
    </Box>
  );
};

export default AllOrdersPage;
