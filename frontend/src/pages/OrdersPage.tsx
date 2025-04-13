import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Typography,
  Chip,
  TextField,
  InputAdornment,
  Tabs,
  Tab,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Search as SearchIcon,
  Assignment as AssignmentIcon,
  Payment as PaymentIcon,
  LocalShipping as ShippingIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';

interface Order {
  id: string;
  customerName: string;
  orderDate: string;
  amount: number;
  status: 'pending' | 'in_progress' | 'delivered' | 'paid' | 'cancelled';
  trackingCode: string;
  lastUpdate: string;
  assignedTo: string;
}

const OrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTab, setSelectedTab] = useState(0);

  const statusTabs = [
    { label: 'Todos', value: 'all' },
    { label: 'Pendentes', value: 'pending' },
    { label: 'Em Andamento', value: 'in_progress' },
    { label: 'Entregues', value: 'delivered' },
    { label: 'Pagas', value: 'paid' },
    { label: 'Canceladas', value: 'cancelled' },
  ];

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'in_progress':
        return 'info';
      case 'delivered':
        return 'success';
      case 'paid':
        return 'success';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return <AssignmentIcon />;
      case 'in_progress':
        return <ShippingIcon />;
      case 'delivered':
        return <CheckCircleIcon />;
      case 'paid':
        return <PaymentIcon />;
      case 'cancelled':
        return <CancelIcon />;
      default:
        return <AssignmentIcon />;
    }
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
    setPage(0);
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch = order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.trackingCode.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTab = selectedTab === 0 || order.status === statusTabs[selectedTab].value;
    return matchesSearch && matchesTab;
  });

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Pedidos
      </Typography>
      
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <TextField
          placeholder="Buscar por cliente ou código de rastreio"
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ width: '300px' }}
        />
      </Box>

      <Paper sx={{ width: '100%', mb: 2 }}>
        <Tabs
          value={selectedTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          {statusTabs.map((tab) => (
            <Tab key={tab.value} label={tab.label} />
          ))}
        </Tabs>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Cliente</TableCell>
                <TableCell>Data</TableCell>
                <TableCell>Valor</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Código de Rastreio</TableCell>
                <TableCell>Última Atualização</TableCell>
                <TableCell>Atribuído a</TableCell>
                <TableCell>Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredOrders
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>{order.id}</TableCell>
                    <TableCell>{order.customerName}</TableCell>
                    <TableCell>{order.orderDate}</TableCell>
                    <TableCell>R$ {order.amount.toFixed(2)}</TableCell>
                    <TableCell>
                      <Chip
                        icon={getStatusIcon(order.status)}
                        label={order.status}
                        color={getStatusColor(order.status)}
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>{order.trackingCode}</TableCell>
                    <TableCell>{order.lastUpdate}</TableCell>
                    <TableCell>{order.assignedTo}</TableCell>
                    <TableCell>
                      <Tooltip title="Detalhes">
                        <IconButton size="small">
                          <AssignmentIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredOrders.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
    </Box>
  );
};

export default OrdersPage; 