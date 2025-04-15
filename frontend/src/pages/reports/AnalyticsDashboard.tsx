import React, { useState, useEffect } from 'react';
import {
  Grid, Paper, Typography, Box,
  Card, CardContent, Tabs, Tab,
  FormControl, InputLabel, Select, MenuItem,
  SelectChangeEvent
} from '@mui/material';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, Cell
} from 'recharts';
import { Order } from '../../types/Order';

// Cores para os gráficos
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#FF6B6B'];

interface AnalyticsDashboardProps {
  orders: Order[];
  startDate?: Date;
  endDate?: Date;
}

// Função para renderizar o label do gráfico de pizza
const renderCustomizedLabel = (props: any) => {
  const { cx, cy, midAngle, innerRadius, outerRadius, status, value, percent } = props;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
  const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);

  return (
    <text
      x={x}
      y={y}
      fill="#fff"
      textAnchor="middle"
      dominantBaseline="central"
    >
      {`${props.status}: ${value}`}
    </text>
  );
};

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  orders, startDate, endDate
}) => {
  const [timeFrame, setTimeFrame] = useState('daily');
  const [viewType, setViewType] = useState('performance');

  // Filter out deleted orders
  const filteredOrders = orders.filter(order => 
    !order.situacaoVenda || order.situacaoVenda.toLowerCase() !== 'deletado'
  );

  // Dados processados para os gráficos
  const [performanceData, setPerformanceData] = useState<any[]>([]);
  const [conversionData, setConversionData] = useState<any[]>([]);
  const [operatorData, setOperatorData] = useState<any[]>([]);
  const [statusDistribution, setStatusDistribution] = useState<any[]>([]);

  // Processar dados com base no timeFrame selecionado
  useEffect(() => {
    processPerformanceData();
    processConversionData();
    processOperatorData();
    processStatusDistribution();
  }, [filteredOrders, timeFrame, startDate, endDate]);

  const processPerformanceData = () => {
    // Simulação de dados para o gráfico de performance
    const data = [];

    // Usar as datas de filtro se disponíveis, ou usar datas padrão
    const endDateTime = endDate ? new Date(endDate) : new Date();
    let startDateTime: Date;

    if (startDate) {
      startDateTime = new Date(startDate);
    } else {
      // Gerar dados para os últimos 7, 30 ou 90 dias dependendo do timeFrame
      startDateTime = new Date(endDateTime);
      let days = 7;
      if (timeFrame === 'weekly') days = 7;
      else if (timeFrame === 'monthly') days = 30;
      else if (timeFrame === 'quarterly') days = 90;
      startDateTime.setDate(startDateTime.getDate() - days + 1);
    }

    // Calcular o número de dias entre as datas
    const diffTime = Math.abs(endDateTime.getTime() - startDateTime.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1; // Evitar divisão por zero

    // Filtrar pedidos pelo período selecionado
    const periodFilteredOrders = filteredOrders.filter(order => {
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

    // Gerar dados para cada dia no período selecionado
    for (let i = 0; i < diffDays; i++) {
      const date = new Date(startDateTime);
      date.setDate(date.getDate() + i);

      // Filtrar pedidos para esta data específica
      const dateStr = date.toISOString().split('T')[0];
      const dayOrders = periodFilteredOrders.filter(order => {
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

          if (isNaN(orderDate.getTime())) return false;

          return orderDate.toISOString().split('T')[0] === dateStr;
        } catch (error) {
          return false;
        }
      });

      // Calcular valores para o dia
      const vendas = dayOrders.reduce((sum, order) => sum + order.valorVenda, 0);
      const recebimentos = dayOrders.reduce((sum, order) => sum + order.valorRecebido, 0);

      data.push({
        date: date.toLocaleDateString('pt-BR'),
        vendas,
        recebimentos,
        pedidos: dayOrders.length
      });
    }

    setPerformanceData(data);
  };

  const processConversionData = () => {
    // Simulação de dados para o gráfico de conversão
    const data = [];

    // Usar as datas de filtro se disponíveis, ou usar datas padrão
    const endDateTime = endDate ? new Date(endDate) : new Date();
    let startDateTime: Date;

    if (startDate) {
      startDateTime = new Date(startDate);
    } else {
      // Gerar dados para os últimos 7, 30 ou 90 dias dependendo do timeFrame
      startDateTime = new Date(endDateTime);
      let days = 7;
      if (timeFrame === 'weekly') days = 7;
      else if (timeFrame === 'monthly') days = 30;
      else if (timeFrame === 'quarterly') days = 90;
      startDateTime.setDate(startDateTime.getDate() - days + 1);
    }

    // Calcular o número de dias entre as datas
    const diffTime = Math.abs(endDateTime.getTime() - startDateTime.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1; // Evitar divisão por zero

    // Filtrar pedidos pelo período selecionado
    const periodFilteredOrders = filteredOrders.filter(order => {
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

    for (let i = 0; i < diffDays; i++) {
      const date = new Date(startDateTime);
      date.setDate(date.getDate() + i);

      // Filtrar pedidos para esta data específica
      const dateStr = date.toISOString().split('T')[0];
      const dayOrders = periodFilteredOrders.filter(order => {
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

          if (isNaN(orderDate.getTime())) return false;

          return orderDate.toISOString().split('T')[0] === dateStr;
        } catch (error) {
          return false;
        }
      });

      // Calcular taxas de conversão
      const total = dayOrders.length || 1; // Evitar divisão por zero
      const completos = dayOrders.filter(o => o.situacaoVenda?.toLowerCase() === 'completo').length;
      const parciais = dayOrders.filter(o => o.situacaoVenda?.toLowerCase() === 'parcial').length;
      const pendentes = dayOrders.filter(o => o.situacaoVenda?.toLowerCase() === 'pendente').length;

      data.push({
        date: date.toLocaleDateString('pt-BR'),
        taxaCompleto: (completos / total) * 100,
        taxaParcial: (parciais / total) * 100,
        taxaPendente: (pendentes / total) * 100,
        total
      });
    }

    setConversionData(data);
  };

  const processOperatorData = () => {
    // Filtrar e processar dados para o gráfico de operadores
    interface OperatorStat {
      totalPedidos: number;
      valorTotal: number;
      valorRecebido: number;
      taxaConversao: number;
    }
    
    const operatorStats: Record<string, OperatorStat> = {};
    
    // Usar pedidos filtrados para calcular estatísticas por operador
    filteredOrders.forEach(order => {
      const operator = order.operador || 'Desconhecido';
      if (!operatorStats[operator]) {
        operatorStats[operator] = {
          totalPedidos: 0,
          valorTotal: 0,
          valorRecebido: 0,
          taxaConversao: 0
        };
      }
      operatorStats[operator].totalPedidos++;
      operatorStats[operator].valorTotal += order.valorVenda;
      operatorStats[operator].valorRecebido += order.valorRecebido;
    });

    const data = Object.entries(operatorStats).map(([operator, stats]) => ({
      nome: operator,
      totalPedidos: stats.totalPedidos,
      valorTotal: stats.valorTotal,
      valorRecebido: stats.valorRecebido,
      taxaConversao: Math.round((stats.valorRecebido / stats.valorTotal) * 100)
    }));

    setOperatorData(data);
  };

  const processStatusDistribution = () => {
    // Calcular a distribuição de status dos pedidos
    const statusCounts: Record<string, number> = {};
    
    // Contar pedidos por status
    filteredOrders.forEach(order => {
      const status = order.situacaoVenda || 'Desconhecido';
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    });

    const data = Object.entries(statusCounts).map(([status, count]) => ({
      status,
      value: count
    }));

    setStatusDistribution(data);
  };

  const handleTimeFrameChange = (event: SelectChangeEvent) => {
    setTimeFrame(event.target.value);
  };

  const handleViewTypeChange = (_event: React.SyntheticEvent, newValue: string) => {
    setViewType(newValue);
  };

  return (
    <Box sx={{ p: 3, bgcolor: '#f9fafc' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 500, color: '#334155' }}>
          Dashboard Analítico
        </Typography>

        <Box sx={{ display: 'flex', gap: 2 }}>
          <FormControl size="small" sx={{ minWidth: 150, '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}>
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
        sx={{
          mb: 3,
          '& .MuiTab-root': {
            textTransform: 'none',
            fontWeight: 500,
            fontSize: '0.95rem',
            minHeight: '48px',
            color: '#64748b',
            '&.Mui-selected': { color: '#3b82f6' }
          },
          '& .MuiTabs-indicator': { backgroundColor: '#3b82f6', height: '3px', borderRadius: '3px' }
        }}
      >
        <Tab label="Performance" value="performance" />
        <Tab label="Conversão" value="conversion" />
        <Tab label="Operadores" value="operators" />
      </Tabs>

      {viewType === 'performance' && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3, height: '100%', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.1)' }}>
              <Typography variant="h6" sx={{ fontWeight: 500, color: '#334155', mb: 2 }}>
                Tendência de Vendas e Recebimentos
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={(value: any) => `R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} />
                  <Legend />
                  <Line type="monotone" dataKey="vendas" name="Vendas" stroke="#8884d8" />
                  <Line type="monotone" dataKey="recebimentos" name="Recebimentos" stroke="#82ca9d" />
                </LineChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, height: '100%', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.1)' }}>
              <Typography variant="h6" sx={{ fontWeight: 500, color: '#334155', mb: 2 }}>
                Distribuição por Status
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusDistribution}
                    dataKey="value"
                    nameKey="status"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    labelLine={false}
                    label={renderCustomizedLabel}
                  >
                    {statusDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any) => Number(value).toLocaleString('pt-BR')} />
                </PieChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          <Grid item xs={12}>
            <Paper sx={{ p: 3, borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.1)' }}>
              <Typography variant="h6" sx={{ fontWeight: 500, color: '#334155', mb: 2 }}>
                Volume de Pedidos
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis yAxisId="left" orientation="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip formatter={(value: any, name: any) => {
                    if (name === 'Valor de Vendas (R$)') return `R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
                    return Number(value).toLocaleString('pt-BR');
                  }} />
                  <Legend />
                  <Bar dataKey="pedidos" name="Número de Pedidos" fill="#8884d8" yAxisId="left" />
                  <Bar dataKey="vendas" name="Valor de Vendas (R$)" fill="#82ca9d" yAxisId="right" />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
        </Grid>
      )}

      {viewType === 'conversion' && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper sx={{ p: 3, borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.1)' }}>
              <Typography variant="h6" sx={{ fontWeight: 500, color: '#334155', mb: 2 }}>
                Taxa de Conversão por Dia
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={conversionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={(value: any) => `${Number(value).toFixed(2)}%`} />
                  <Legend />
                  <Bar dataKey="taxaCompleto" name="Completos" stackId="a" fill="#4caf50" />
                  <Bar dataKey="taxaParcial" name="Parciais" stackId="a" fill="#ff9800" />
                  <Bar dataKey="taxaPendente" name="Pendentes" stackId="a" fill="#f44336" />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, height: '100%', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.1)' }}>
              <Typography variant="h6" sx={{ fontWeight: 500, color: '#334155', mb: 2 }}>
                Evolução da Taxa de Conversão
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={conversionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={(value: any) => `${Number(value).toFixed(2)}%`} />
                  <Legend />
                  <Line type="monotone" dataKey="taxaCompleto" name="Taxa de Conversão" stroke="#4caf50" />
                </LineChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, height: '100%', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.1)' }}>
              <Typography variant="h6" sx={{ fontWeight: 500, color: '#334155', mb: 2 }}>
                Volume de Pedidos por Dia
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={conversionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={(value: any) => Number(value).toLocaleString('pt-BR')} />
                  <Legend />
                  <Bar dataKey="total" name="Total de Pedidos" fill="#2196f3" />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
        </Grid>
      )}

      {viewType === 'operators' && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper sx={{ p: 3, borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.1)' }}>
              <Typography variant="h6" sx={{ fontWeight: 500, color: '#334155', mb: 2 }}>
                Performance por Operador
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={operatorData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="nome" />
                  <YAxis />
                  <Tooltip formatter={(value: any, name: any) => {
                    if (name === 'taxaConversao') return `${value}%`;
                    return `R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
                  }} />
                  <Legend />
                  <Bar dataKey="valorTotal" name="Valor Total" fill="#8884d8" />
                  <Bar dataKey="valorRecebido" name="Valor Recebido" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, height: '100%', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.1)' }}>
              <Typography variant="h6" sx={{ fontWeight: 500, color: '#334155', mb: 2 }}>
                Taxa de Conversão por Operador
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={operatorData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="nome" />
                  <YAxis />
                  <Tooltip formatter={(value: any) => `${value}%`} />
                  <Legend />
                  <Bar dataKey="taxaConversao" name="Taxa de Conversão" fill="#ff9800" />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, height: '100%', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.1)' }}>
              <Typography variant="h6" sx={{ fontWeight: 500, color: '#334155', mb: 2 }}>
                Volume de Pedidos por Operador
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={operatorData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="nome" />
                  <YAxis />
                  <Tooltip formatter={(value: any) => Number(value).toLocaleString('pt-BR')} />
                  <Legend />
                  <Bar dataKey="totalPedidos" name="Total de Pedidos" fill="#2196f3" />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default AnalyticsDashboard;
