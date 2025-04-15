import React, { useState, useEffect } from 'react';
import { 
  Grid, Paper, Typography, Box, 
  Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Card, CardContent,
  FormControl, InputLabel, Select, MenuItem,
  SelectChangeEvent, Chip, Alert, AlertTitle
} from '@mui/material';
import { Order } from '../../types/Order';

interface CashFlowForecastProps {
  orders: Order[];
}

const CashFlowForecastSimple: React.FC<CashFlowForecastProps> = ({ orders }) => {
  const [forecastPeriod, setForecastPeriod] = useState(30); // dias
  const [weeklyForecast, setWeeklyForecast] = useState<any[]>([]);
  const [riskAlerts, setRiskAlerts] = useState<any[]>([]);
  
  useEffect(() => {
    // Gerar previsão semanal
    generateWeeklyForecast();
    // Identificar alertas de risco
    identifyRiskAlerts();
  }, [orders, forecastPeriod]);
  
  const generateWeeklyForecast = () => {
    // Taxas de conversão simuladas
    const conversionRates = {
      optimistic: 0.85,
      realistic: 0.70,
      pessimistic: 0.55
    };
    
    // Agrupar previsão por semana
    const weeklyData = [];
    
    // Número de semanas a considerar
    const weeks = Math.ceil(forecastPeriod / 7);
    
    for (let i = 0; i < weeks; i++) {
      const startDay = i * 7;
      const endDay = Math.min(startDay + 6, forecastPeriod - 1);
      
      // Calcular datas para esta semana
      const now = new Date();
      const startDate = new Date(now);
      startDate.setDate(startDate.getDate() + startDay);
      const endDate = new Date(now);
      endDate.setDate(endDate.getDate() + endDay);
      
      // Filtrar pedidos para esta semana (simulado)
      const weekOrders = orders.filter((_, index) => index % weeks === i);
      const totalValue = weekOrders.reduce((sum, order) => sum + order.valorVenda, 0);
      
      // Calcular valores previstos
      const pessimista = totalValue * conversionRates.pessimistic;
      const realista = totalValue * conversionRates.realistic;
      const otimista = totalValue * conversionRates.optimistic;
      
      weeklyData.push({
        semana: `Semana ${i + 1}`,
        periodo: `${startDate.toLocaleDateString('pt-BR')} a ${endDate.toLocaleDateString('pt-BR')}`,
        pessimista,
        realista,
        otimista
      });
    }
    
    setWeeklyForecast(weeklyData);
  };
  
  const identifyRiskAlerts = () => {
    // Identificar pedidos com alto risco de inadimplência
    const alerts = [];
    
    // Critérios de risco simulados
    for (const order of orders) {
      // Simulação: pedidos com valor alto e sem pagamento parcial são considerados de risco
      const isHighValue = order.valorVenda > 1000;
      const hasNoPartialPayment = !order.pagamentoParcial || order.pagamentoParcial === 0;
      const isOld = new Date().getTime() - new Date(order.dataVenda).getTime() > 15 * 24 * 60 * 60 * 1000; // Mais de 15 dias
      
      let riskLevel = 'Baixo';
      if (isHighValue && hasNoPartialPayment && isOld) {
        riskLevel = 'Alto';
      } else if ((isHighValue && hasNoPartialPayment) || (isHighValue && isOld) || (hasNoPartialPayment && isOld)) {
        riskLevel = 'Médio';
      }
      
      if (riskLevel !== 'Baixo') {
        alerts.push({
          id: order.idVenda,
          cliente: 'Cliente ' + order.idVenda,
          valor: order.valorVenda,
          dataVenda: new Date(order.dataVenda).toLocaleDateString('pt-BR'),
          risco: riskLevel
        });
      }
    }
    
    // Ordenar por nível de risco (Alto primeiro)
    alerts.sort((a, b) => {
      const riskOrder = { 'Alto': 0, 'Médio': 1, 'Baixo': 2 };
      return riskOrder[a.risco as keyof typeof riskOrder] - riskOrder[b.risco as keyof typeof riskOrder];
    });
    
    setRiskAlerts(alerts.slice(0, 10)); // Mostrar apenas os 10 principais alertas
  };
  
  const handlePeriodChange = (event: SelectChangeEvent<number>) => {
    setForecastPeriod(Number(event.target.value));
  };
  
  // Calcular totais
  const totalOptimistic = weeklyForecast.reduce((sum, week) => sum + week.otimista, 0);
  const totalRealistic = weeklyForecast.reduce((sum, week) => sum + week.realista, 0);
  const totalPessimistic = weeklyForecast.reduce((sum, week) => sum + week.pessimista, 0);
  
  return (
    <Box sx={{ p: 3 }}>
      <Alert severity="info" sx={{ mb: 3 }}>
        <AlertTitle>Versão Simplificada</AlertTitle>
        Esta é uma versão simplificada da Previsão de Recebimentos sem gráficos. Para visualizar a versão completa com gráficos, instale a biblioteca Recharts:
        <Box component="pre" sx={{ mt: 1, p: 1, bgcolor: 'background.paper', borderRadius: 1 }}>
          npm install --save recharts @types/recharts
        </Box>
      </Alert>
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5" fontWeight={600}>
          Previsão de Recebimentos
        </Typography>
        
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Período</InputLabel>
          <Select
            value={forecastPeriod}
            label="Período"
            onChange={handlePeriodChange}
          >
            <MenuItem value={7}>7 dias</MenuItem>
            <MenuItem value={15}>15 dias</MenuItem>
            <MenuItem value={30}>30 dias</MenuItem>
            <MenuItem value={90}>90 dias</MenuItem>
          </Select>
        </FormControl>
      </Box>
      
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Projeção de Fluxo de Caixa - Próximos {forecastPeriod} dias
            </Typography>
            <Typography variant="body1" paragraph>
              Para visualizar o gráfico de projeção de fluxo de caixa, instale a biblioteca Recharts.
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Recebimentos Previstos por Semana
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Semana</TableCell>
                    <TableCell>Período</TableCell>
                    <TableCell align="right">Pessimista</TableCell>
                    <TableCell align="right">Realista</TableCell>
                    <TableCell align="right">Otimista</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {weeklyForecast.map((week, index) => (
                    <TableRow key={index}>
                      <TableCell>{week.semana}</TableCell>
                      <TableCell>{week.periodo}</TableCell>
                      <TableCell align="right">R$ {week.pessimista.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</TableCell>
                      <TableCell align="right">R$ {week.realista.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</TableCell>
                      <TableCell align="right">R$ {week.otimista.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Alertas de Risco
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Pedido</TableCell>
                    <TableCell>Cliente</TableCell>
                    <TableCell>Data</TableCell>
                    <TableCell align="right">Valor</TableCell>
                    <TableCell align="right">Risco</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {riskAlerts.length > 0 ? (
                    riskAlerts.map((alert) => (
                      <TableRow key={alert.id}>
                        <TableCell>{alert.id}</TableCell>
                        <TableCell>{alert.cliente}</TableCell>
                        <TableCell>{alert.dataVenda}</TableCell>
                        <TableCell align="right">R$ {alert.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</TableCell>
                        <TableCell align="right">
                          <Chip 
                            label={alert.risco} 
                            color={alert.risco === 'Alto' ? 'error' : alert.risco === 'Médio' ? 'warning' : 'success'} 
                            size="small" 
                          />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        Nenhum alerta de risco encontrado
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
        
        <Grid item xs={12}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Card sx={{ p: 2, height: '100%', borderLeft: '4px solid #4caf50' }}>
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary">
                    Previsão Total (Cenário Otimista)
                  </Typography>
                  <Typography variant="h4" sx={{ color: '#4caf50', fontWeight: 700, my: 1 }}>
                    R$ {totalOptimistic.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Considerando taxa de conversão de 85%
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Card sx={{ p: 2, height: '100%', borderLeft: '4px solid #2196f3' }}>
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary">
                    Previsão Total (Cenário Realista)
                  </Typography>
                  <Typography variant="h4" sx={{ color: '#2196f3', fontWeight: 700, my: 1 }}>
                    R$ {totalRealistic.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Considerando taxa de conversão de 70%
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Card sx={{ p: 2, height: '100%', borderLeft: '4px solid #f44336' }}>
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary">
                    Previsão Total (Cenário Pessimista)
                  </Typography>
                  <Typography variant="h4" sx={{ color: '#f44336', fontWeight: 700, my: 1 }}>
                    R$ {totalPessimistic.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Considerando taxa de conversão de 55%
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CashFlowForecastSimple;
