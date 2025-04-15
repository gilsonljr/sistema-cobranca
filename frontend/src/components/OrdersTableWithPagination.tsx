import React, { useState } from 'react';
import {
  Box,
  TablePagination,
  Paper,
  Typography,
  Button,
  FormControlLabel,
  Switch,
} from '@mui/material';
import { Order } from '../types/Order';
import OrdersTable from './OrdersTable';

interface OrdersTableWithPaginationProps {
  orders: Order[];
  onOrderUpdate?: (updatedOrder: Order) => void;
}

const OrdersTableWithPagination: React.FC<OrdersTableWithPaginationProps> = ({ orders, onOrderUpdate }) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [showAllOrders, setShowAllOrders] = useState(false);

  // Função para lidar com a mudança de página
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  // Função para lidar com a mudança de linhas por página
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Função para alternar entre mostrar todos os pedidos ou usar paginação
  const handleToggleShowAll = () => {
    setShowAllOrders(!showAllOrders);
  };

  // Aplicar paginação aos pedidos
  const paginatedOrders = showAllOrders
    ? orders
    : orders.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="body2" color="text.secondary">
          {orders.length} pedidos encontrados
        </Typography>
        <FormControlLabel
          control={
            <Switch
              checked={showAllOrders}
              onChange={handleToggleShowAll}
              color="primary"
            />
          }
          label="Mostrar todos os pedidos"
        />
      </Box>

      <OrdersTable orders={paginatedOrders} onOrderUpdate={onOrderUpdate} />

      {!showAllOrders && (
        <TablePagination
          rowsPerPageOptions={[10, 25, 50, 100]}
          component="div"
          count={orders.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Linhas por página:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
        />
      )}
    </Box>
  );
};

export default OrdersTableWithPagination;
