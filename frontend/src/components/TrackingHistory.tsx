import React from 'react';
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
  Chip,
  Tooltip,
  Link
} from '@mui/material';
import { Order } from '../types/Order';
import WarningIcon from '@mui/icons-material/Warning';
import InfoIcon from '@mui/icons-material/Info';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';

interface TrackingHistoryProps {
  orders: Order[];
  maxEntries?: number;
}

const TrackingHistory: React.FC<TrackingHistoryProps> = ({ 
  orders, 
  maxEntries = 10 
}) => {
  // Filter orders with tracking code and atualizacaoCorreios
  const ordersWithTrackingUpdates = orders.filter(
    order => order.codigoRastreio && order.atualizacaoCorreios
  );

  // Sort by most recent tracking update
  const sortedOrders = [...ordersWithTrackingUpdates].sort((a, b) => {
    // If atualizacaoCorreios is in format dd/mm/yyyy - hh:mm:ss, convert to Date
    const dateA = a.atualizacaoCorreios ? parseDateTime(a.atualizacaoCorreios) : new Date(0);
    const dateB = b.atualizacaoCorreios ? parseDateTime(b.atualizacaoCorreios) : new Date(0);
    
    // Sort in descending order (most recent first)
    return dateB.getTime() - dateA.getTime();
  });

  // Take only the most recent updates
  const recentUpdates = sortedOrders.slice(0, maxEntries);

  // Helper function to parse date in format dd/mm/yyyy - hh:mm:ss
  function parseDateTime(dateTimeStr: string): Date {
    try {
      const [datePart, timePart] = dateTimeStr.split(' - ');
      if (!datePart || !timePart) return new Date();
      
      const [day, month, year] = datePart.split('/').map(Number);
      const [hour, minute, second] = timePart.split(':').map(Number);
      
      return new Date(year, month - 1, day, hour, minute, second);
    } catch (error) {
      console.error('Error parsing date:', error);
      return new Date();
    }
  }

  // Helper function to get status chip color
  const getStatusColor = (status: string, isCritical?: boolean): string => {
    if (isCritical) return 'error';
    
    const statusLower = status.toLowerCase();
    if (statusLower.includes('entregue')) return 'success';
    if (statusLower.includes('trânsito') || statusLower.includes('transito')) return 'info';
    if (statusLower.includes('aguardando')) return 'warning';
    if (statusLower.includes('postado')) return 'primary';
    
    return 'default';
  };

  return (
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
          Histórico Recente de Rastreamento
        </Typography>
        <Chip 
          icon={<InfoIcon />} 
          label={`${recentUpdates.length} atualizações recentes`} 
          color="primary" 
          variant="outlined"
          size="small"
        />
      </Box>

      {recentUpdates.length > 0 ? (
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Data/Hora</TableCell>
                <TableCell>Pedido</TableCell>
                <TableCell>Cliente</TableCell>
                <TableCell>Código de Rastreio</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {recentUpdates.map((order) => (
                <TableRow key={order.idVenda}>
                  <TableCell>{order.atualizacaoCorreios}</TableCell>
                  <TableCell>{order.idVenda}</TableCell>
                  <TableCell>{order.cliente}</TableCell>
                  <TableCell>
                    <Link 
                      href={`https://rastreamento.correios.com.br/app/index.php?objeto=${order.codigoRastreio}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {order.codigoRastreio}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Tooltip title={order.statusCorreios}>
                      <Chip
                        size="small"
                        label={order.statusCorreios.length > 30 
                          ? `${order.statusCorreios.substring(0, 30)}...` 
                          : order.statusCorreios
                        }
                        color={getStatusColor(order.statusCorreios, order.statusCritico) as any}
                        icon={order.statusCritico ? <WarningIcon /> : <LocalShippingIcon />}
                      />
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Box textAlign="center" py={3}>
          <Typography color="text.secondary">
            Nenhuma atualização de rastreamento recente encontrada.
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default TrackingHistory;
