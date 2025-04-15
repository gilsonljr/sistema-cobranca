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
  Card,
  CardContent,
  Grid
} from '@mui/material';
import { Order } from '../types/Order';

interface StatusSummaryPageProps {
  orders: Order[];
}

const StatusSummaryPage: React.FC<StatusSummaryPageProps> = ({ orders }) => {
  // Filter out deleted orders
  const filteredOrders = orders.filter(order => 
    !order.situacaoVenda || order.situacaoVenda.toLowerCase() !== 'deletado'
  );

  // Calcular estatísticas de status
  const statusCounts = filteredOrders.reduce((acc: Record<string, number>, order) => {
    const status = order.situacaoVenda || 'Desconhecido';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});

  // Converter para array para exibir
  const statusCountsArray = Object.entries(statusCounts)
    .map(([status, count]) => ({ status, count }))
    .sort((a, b) => b.count - a.count);

  // Calcular estatísticas de vendedores
  const vendedorStats = filteredOrders.reduce((acc: Record<string, { count: number, value: number }>, order) => {
    const vendedor = order.vendedor || 'Desconhecido';
    if (!acc[vendedor]) {
      acc[vendedor] = { count: 0, value: 0 };
    }
    acc[vendedor].count += 1;
    acc[vendedor].value += order.valorVenda || 0;
    return acc;
  }, {});

  // Converter para array para exibir
  const vendedorStatsArray = Object.entries(vendedorStats)
    .map(([vendedor, stats]) => ({
      vendedor,
      count: stats.count,
      value: stats.value,
      average: stats.value / stats.count
    }))
    .sort((a, b) => b.count - a.count);

  // Calcular estatísticas de operadores
  const operadorStats = filteredOrders.reduce((acc: Record<string, { count: number, value: number }>, order) => {
    const operador = order.operador || 'Desconhecido';
    if (!acc[operador]) {
      acc[operador] = { count: 0, value: 0 };
    }
    acc[operador].count += 1;
    acc[operador].value += order.valorVenda || 0;
    return acc;
  }, {});

  // Converter para array para exibir
  const operadorStatsArray = Object.entries(operadorStats)
    .map(([operador, stats]) => ({
      operador,
      count: stats.count,
      value: stats.value,
      average: stats.value / stats.count
    }))
    .sort((a, b) => b.count - a.count);

  // Calcular totais
  const totalOrders = filteredOrders.length;
  const totalValue = filteredOrders.reduce((sum, order) => sum + (order.valorVenda || 0), 0);
  const totalReceived = filteredOrders.reduce((sum, order) => sum + (order.valorRecebido || 0), 0);
  const conversionRate = totalValue > 0 ? (totalReceived / totalValue) * 100 : 0;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Resumo de Status
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: '#f5f5f5', height: '100%' }}>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">
                Total de Pedidos
              </Typography>
              <Typography variant="h4" sx={{ mt: 1, mb: 1, fontWeight: 600 }}>
                {totalOrders}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: '#f5f5f5', height: '100%' }}>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">
                Valor Total
              </Typography>
              <Typography variant="h4" sx={{ mt: 1, mb: 1, fontWeight: 600 }}>
                R$ {totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: '#f5f5f5', height: '100%' }}>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">
                Valor Recebido
              </Typography>
              <Typography variant="h4" sx={{ mt: 1, mb: 1, fontWeight: 600 }}>
                R$ {totalReceived.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: '#f5f5f5', height: '100%' }}>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">
                Taxa de Conversão
              </Typography>
              <Typography variant="h4" sx={{ mt: 1, mb: 1, fontWeight: 600 }}>
                {conversionRate.toFixed(2)}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Distribuição por Status
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Quantidade</TableCell>
                    <TableCell align="right">Porcentagem</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {statusCountsArray.map((item) => (
                    <TableRow key={item.status}>
                      <TableCell>{item.status}</TableCell>
                      <TableCell align="right">{item.count}</TableCell>
                      <TableCell align="right">
                        {totalOrders > 0 ? ((item.count / totalOrders) * 100).toFixed(2) : 0}%
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Estatísticas por Vendedor
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Vendedor</TableCell>
                    <TableCell align="right">Pedidos</TableCell>
                    <TableCell align="right">Valor Total</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {vendedorStatsArray.slice(0, 10).map((item) => (
                    <TableRow key={item.vendedor}>
                      <TableCell>{item.vendedor}</TableCell>
                      <TableCell align="right">{item.count}</TableCell>
                      <TableCell align="right">
                        R$ {item.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </TableCell>
                    </TableRow>
                  ))}
                  {vendedorStatsArray.length > 10 && (
                    <TableRow>
                      <TableCell colSpan={3} align="center">
                        <Typography variant="caption">
                          Mostrando 10 de {vendedorStatsArray.length} vendedores
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Estatísticas por Operador
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Operador</TableCell>
                    <TableCell align="right">Pedidos</TableCell>
                    <TableCell align="right">Valor Total</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {operadorStatsArray.slice(0, 10).map((item) => (
                    <TableRow key={item.operador}>
                      <TableCell>{item.operador}</TableCell>
                      <TableCell align="right">{item.count}</TableCell>
                      <TableCell align="right">
                        R$ {item.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </TableCell>
                    </TableRow>
                  ))}
                  {operadorStatsArray.length > 10 && (
                    <TableRow>
                      <TableCell colSpan={3} align="center">
                        <Typography variant="caption">
                          Mostrando 10 de {operadorStatsArray.length} operadores
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default StatusSummaryPage;
