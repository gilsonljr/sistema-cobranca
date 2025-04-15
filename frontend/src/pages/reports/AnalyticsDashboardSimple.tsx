import React from 'react';
import { 
  Grid, Paper, Typography, Box, 
  Card, CardContent, Tabs, Tab,
  FormControl, InputLabel, Select, MenuItem,
  SelectChangeEvent, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Alert, AlertTitle
} from '@mui/material';
import { Order } from '../../types/Order';

interface AnalyticsDashboardProps {
  orders: Order[];
  startDate?: Date;
  endDate?: Date;
}

const AnalyticsDashboardSimple: React.FC<AnalyticsDashboardProps> = ({ 
  orders, startDate, endDate 
}) => {
  const [timeFrame, setTimeFrame] = React.useState('daily');
  const [viewType, setViewType] = React.useState('performance');
  
  // Filter out deleted orders
  const filteredOrders = orders.filter(order => 
    !order.situacaoVenda || order.situacaoVenda.toLowerCase() !== 'deletado'
  );
  
  // Calcular estatísticas básicas
  const totalOrders = filteredOrders.length;
  const totalValue = filteredOrders.reduce((sum, order) => sum + order.valorVenda, 0);
  const receivedValue = filteredOrders.reduce((sum, order) => sum + order.valorRecebido, 0);
  const conversionRate = totalValue > 0 ? (receivedValue / totalValue) * 100 : 0;
  
  // Calcular distribuição por status
  const statusCounts: Record<string, number> = {};
  filteredOrders.forEach(order => {
    const status = order.situacaoVenda || 'Desconhecido';
    statusCounts[status] = (statusCounts[status] || 0) + 1;
  });
  
  const statusDistribution = Object.entries(statusCounts).map(([status, count]) => ({
    status,
    count,
    percentage: (count / totalOrders) * 100
  }));
  
  const handleTimeFrameChange = (event: SelectChangeEvent) => {
    setTimeFrame(event.target.value);
  };
  
  const handleViewTypeChange = (_event: React.SyntheticEvent, newValue: string) => {
    setViewType(newValue);
  };
  
  return (
    <Box sx={{ p: 3 }}>
      <Alert severity="info" sx={{ mb: 3 }}>
        <AlertTitle>Versão Simplificada</AlertTitle>
        Esta é uma versão simplificada do Dashboard Analítico sem gráficos. Para visualizar a versão completa com gráficos, instale a biblioteca Recharts:
        <Box component="pre" sx={{ mt: 1, p: 1, bgcolor: 'background.paper', borderRadius: 1 }}>
          npm install --save recharts @types/recharts
        </Box>
      </Alert>
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5" fontWeight={600}>
          Dashboard Analítico
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Período</InputLabel>
            <Select
              value={timeFrame}
              label="Período"
              onChange={handleTimeFrameChange}
            >
              <MenuItem value="daily">Diário</MenuItem>
              <MenuItem value="weekly">Semanal</MenuItem>
              <MenuItem value="monthly">Mensal</MenuItem>
              <MenuItem value="quarterly">Trimestral</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>
      
      <Tabs
        value={viewType}
        onChange={handleViewTypeChange}
        sx={{ mb: 3 }}
      >
        <Tab label="Performance" value="performance" />
        <Tab label="Conversão" value="conversion" />
        <Tab label="Operadores" value="operators" />
      </Tabs>
      
      {viewType === 'performance' && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Resumo de Performance
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Total de Pedidos
                      </Typography>
                      <Typography variant="h4" color="primary">
                        {totalOrders}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Valor Total
                      </Typography>
                      <Typography variant="h4" color="primary">
                        R$ {totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Valor Recebido
                      </Typography>
                      <Typography variant="h4" color="success.main">
                        R$ {receivedValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Taxa de Conversão
                      </Typography>
                      <Typography variant="h4" color="info.main">
                        {conversionRate.toFixed(2)}%
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2, height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                Distribuição por Status
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Status</TableCell>
                      <TableCell align="right">Quantidade</TableCell>
                      <TableCell align="right">Percentual</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {statusDistribution.map((item) => (
                      <TableRow key={item.status}>
                        <TableCell>{item.status}</TableCell>
                        <TableCell align="right">{item.count}</TableCell>
                        <TableCell align="right">{item.percentage.toFixed(2)}%</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>
        </Grid>
      )}
      
      {viewType === 'conversion' && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Análise de Conversão
              </Typography>
              <Typography variant="body1" paragraph>
                A taxa de conversão geral do sistema é de <strong>{conversionRate.toFixed(2)}%</strong>.
              </Typography>
              <Typography variant="body1">
                Para visualizar gráficos detalhados de conversão, instale a biblioteca Recharts.
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      )}
      
      {viewType === 'operators' && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Performance de Operadores
              </Typography>
              <Typography variant="body1">
                Para visualizar dados detalhados de performance dos operadores, instale a biblioteca Recharts.
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default AnalyticsDashboardSimple;
