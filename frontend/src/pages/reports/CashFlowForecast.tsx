import React, { useState, useEffect } from 'react';
import {
  Grid, Paper, Typography, Box,
  Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Card, CardContent,
  FormControl, InputLabel, Select, MenuItem,
  SelectChangeEvent, Chip
} from '@mui/material';
import {
  LineChart, Line, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer
} from 'recharts';
import { Order } from '../../types/Order';

interface CashFlowForecastProps {
  orders: Order[];
  startDate?: Date;
  endDate?: Date;
}

const CashFlowForecast: React.FC<CashFlowForecastProps> = ({ orders, startDate, endDate }) => {
  const [forecastPeriod, setForecastPeriod] = useState(30); // dias
  const [forecastData, setForecastData] = useState<any[]>([]);
  const [weeklyForecast, setWeeklyForecast] = useState<any[]>([]);
  const [riskAlerts, setRiskAlerts] = useState<any[]>([]);
  const [timeFrame, setTimeFrame] = useState('monthly');

  // Filter out deleted orders
  const filteredOrders = orders.filter(order => 
    !order.situacaoVenda || order.situacaoVenda.toLowerCase() !== 'deletado'
  );

  useEffect(() => {
    // Gerar dados de previsão
    generateForecastData();
    // Gerar previsão semanal
    generateWeeklyForecast();
    // Identificar alertas de risco
    identifyRiskAlerts();
  }, [filteredOrders, forecastPeriod, startDate, endDate]);

  const generateForecastData = () => {
    // Taxas de conversão simuladas
    const conversionRates = {
      optimistic: 0.85,
      realistic: 0.70,
      pessimistic: 0.55
    };

    // Filtrar pedidos pelo período selecionado
    let dateFilteredOrders = filteredOrders;

    if (startDate || endDate) {
      const startDateTime = startDate ? new Date(startDate) : new Date(0); // Data mínima se não houver startDate
      const endDateTime = endDate ? new Date(endDate) : new Date(); // Data atual se não houver endDate

      dateFilteredOrders = filteredOrders.filter((order: Order) => {
        if (!order.dataVenda) return false;

        try {
          // Verificar o formato da data (DD/MM/YYYY ou YYYY-MM-DD)
          let orderDate;
          if (order.dataVenda.includes('/')) {
            // Formato brasileiro DD/MM/YYYY
            const parts = order.dataVenda.split('/');
            if (parts.length === 3) {
              // Converter para YYYY-MM-DD para criar o objeto Date
              orderDate = new Date(`${parts[2]}-${parts[1]}-${parts[0]}T00:00:00`);
            } else {
              return false;
            }
          } else {
            // Assumir formato ISO YYYY-MM-DD
            orderDate = new Date(order.dataVenda);
          }

          if (isNaN(orderDate.getTime())) {
            console.warn('Data inválida após conversão:', order.dataVenda);
            return false;
          }

          return orderDate >= startDateTime && orderDate <= endDateTime;
        } catch (error) {
          console.warn('Data inválida encontrada:', order.dataVenda);
          return false;
        }
      });
    }

    // Gerar dados diários
    const data = [];
    const now = new Date();

    for (let i = 0; i < forecastPeriod; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() + i);

      // Filtrar pedidos com data de recebimento prevista para este dia
      // Simulação: distribuir os pedidos ao longo do período
      const dayOrders = dateFilteredOrders.filter((_: Order, index: number) => index % forecastPeriod === i);

      // Calcular valor total previsto para o dia
      const totalValue = dayOrders.reduce((sum: number, order: Order) => sum + order.valorVenda, 0);

      // Calcular previsões com diferentes taxas de conversão
      const previstoOtimista = totalValue * conversionRates.optimistic;
      const previstoRealista = totalValue * conversionRates.realistic;
      const previstoPessimista = totalValue * conversionRates.pessimistic;

      data.push({
        date: date.toLocaleDateString('pt-BR'),
        previstoOtimista,
        previstoRealista,
        previstoPessimista,
        totalPedidos: dayOrders.length
      });
    }

    setForecastData(data);
  };

  const generateWeeklyForecast = () => {
    // Taxas de conversão simuladas
    const conversionRates = {
      optimistic: 0.85,
      realistic: 0.70,
      pessimistic: 0.55
    };

    // Filtrar pedidos pelo período selecionado
    let dateFilteredOrders = filteredOrders;

    if (startDate || endDate) {
      const startDateTime = startDate ? new Date(startDate) : new Date(0); // Data mínima se não houver startDate
      const endDateTime = endDate ? new Date(endDate) : new Date(); // Data atual se não houver endDate

      dateFilteredOrders = filteredOrders.filter((order: Order) => {
        if (!order.dataVenda) return false;

        try {
          // Verificar o formato da data (DD/MM/YYYY ou YYYY-MM-DD)
          let orderDate;
          if (order.dataVenda.includes('/')) {
            // Formato brasileiro DD/MM/YYYY
            const parts = order.dataVenda.split('/');
            if (parts.length === 3) {
              // Converter para YYYY-MM-DD para criar o objeto Date
              orderDate = new Date(`${parts[2]}-${parts[1]}-${parts[0]}T00:00:00`);
            } else {
              return false;
            }
          } else {
            // Assumir formato ISO YYYY-MM-DD
            orderDate = new Date(order.dataVenda);
          }

          if (isNaN(orderDate.getTime())) {
            console.warn('Data inválida após conversão:', order.dataVenda);
            return false;
          }

          return orderDate >= startDateTime && orderDate <= endDateTime;
        } catch (error) {
          console.warn('Data inválida encontrada:', order.dataVenda);
          return false;
        }
      });
    }

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
      const weekOrders = dateFilteredOrders.filter((_: Order, index: number) => index % weeks === i);
      const totalValue = weekOrders.reduce((sum: number, order: Order) => sum + order.valorVenda, 0);

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

    // Filtrar pedidos pelo período selecionado
    let dateFilteredOrders = filteredOrders;

    if (startDate || endDate) {
      const startDateTime = startDate ? new Date(startDate) : new Date(0); // Data mínima se não houver startDate
      const endDateTime = endDate ? new Date(endDate) : new Date(); // Data atual se não houver endDate

      dateFilteredOrders = filteredOrders.filter((order: Order) => {
        if (!order.dataVenda) return false;

        try {
          // Verificar o formato da data (DD/MM/YYYY ou YYYY-MM-DD)
          let orderDate;
          if (order.dataVenda.includes('/')) {
            // Formato brasileiro DD/MM/YYYY
            const parts = order.dataVenda.split('/');
            if (parts.length === 3) {
              // Converter para YYYY-MM-DD para criar o objeto Date
              orderDate = new Date(`${parts[2]}-${parts[1]}-${parts[0]}T00:00:00`);
            } else {
              return false;
            }
          } else {
            // Assumir formato ISO YYYY-MM-DD
            orderDate = new Date(order.dataVenda);
          }

          if (isNaN(orderDate.getTime())) {
            console.warn('Data inválida após conversão:', order.dataVenda);
            return false;
          }

          return orderDate >= startDateTime && orderDate <= endDateTime;
        } catch (error) {
          console.warn('Data inválida encontrada:', order.dataVenda);
          return false;
        }
      });
    }

    // Critérios de risco simulados
    for (const order of dateFilteredOrders) {
      // Simulação: pedidos com valor alto e sem pagamento parcial são considerados de risco
      const isHighValue = order.valorVenda > 1000;
      const hasNoPartialPayment = !order.pagamentoParcial || order.pagamentoParcial === 0;
      // Verificar se a data é válida antes de calcular a diferença
      let isOld = false;
      if (order.dataVenda) {
        try {
          const orderDate = new Date(order.dataVenda);
          if (!isNaN(orderDate.getTime())) {
            isOld = new Date().getTime() - orderDate.getTime() > 15 * 24 * 60 * 60 * 1000; // Mais de 15 dias
          }
        } catch (error) {
          console.warn('Data inválida encontrada:', order.dataVenda);
        }
      }

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
    <Box sx={{ p: 3, bgcolor: '#f9fafc' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 500, color: '#334155' }}>
          Previsão de Recebimentos
        </Typography>

        <FormControl size="small" sx={{ minWidth: 150, '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}>
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
          <Paper sx={{ p: 3, borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.1)' }}>
            <Typography variant="h6" sx={{ fontWeight: 500, color: '#334155', mb: 2 }}>
              Projeção de Fluxo de Caixa - Próximos {forecastPeriod} dias
            </Typography>
            <ResponsiveContainer width="100%" height={400}>
              <AreaChart data={forecastData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value: any) => `R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="previstoOtimista"
                  name="Cenário Otimista"
                  stroke="#4caf50"
                  fill="#4caf50"
                  fillOpacity={0.3}
                />
                <Area
                  type="monotone"
                  dataKey="previstoRealista"
                  name="Cenário Realista"
                  stroke="#2196f3"
                  fill="#2196f3"
                  fillOpacity={0.3}
                />
                <Area
                  type="monotone"
                  dataKey="previstoPessimista"
                  name="Cenário Pessimista"
                  stroke="#f44336"
                  fill="#f44336"
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.1)' }}>
            <Typography variant="h6" sx={{ fontWeight: 500, color: '#334155', mb: 2 }}>
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
          <Paper sx={{ p: 3, borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.1)' }}>
            <Typography variant="h6" sx={{ fontWeight: 500, color: '#334155', mb: 2 }}>
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
              <Card sx={{ p: 3, height: '100%', borderLeft: '4px solid #4caf50', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.1)' }}>
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
              <Card sx={{ p: 3, height: '100%', borderLeft: '4px solid #2196f3', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.1)' }}>
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
              <Card sx={{ p: 3, height: '100%', borderLeft: '4px solid #f44336', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.1)' }}>
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

export default CashFlowForecast;
