import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
} from '@mui/material';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { formatCurrency } from '../../utils/formatters';
import { Order } from '../../types/Order';

// Interface for WhatsApp performance data
interface WhatsAppPerformance {
  zapId: string;
  totalSales: number;
  totalValue: number;
  conversionRate: number;
  averageTicket: number;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

const WhatsAppPage: React.FC<{ orders?: Order[] }> = ({ orders = [] }) => {
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [whatsappPerformance, setWhatsappPerformance] = useState<WhatsAppPerformance[]>([]);
  const [selectedMetric, setSelectedMetric] = useState('totalSales');

  // Filter orders by date range
  useEffect(() => {
    let filtered = [...orders];

    if (dateFrom) {
      const fromDate = new Date(dateFrom);
      filtered = filtered.filter(order => {
        const orderDate = new Date(order.dataVenda.split('/').reverse().join('-'));
        return orderDate >= fromDate;
      });
    }

    if (dateTo) {
      const toDate = new Date(dateTo);
      toDate.setHours(23, 59, 59, 999); // End of the day
      filtered = filtered.filter(order => {
        const orderDate = new Date(order.dataVenda.split('/').reverse().join('-'));
        return orderDate <= toDate;
      });
    }

    setFilteredOrders(filtered);
  }, [orders, dateFrom, dateTo]);

  // Calculate WhatsApp performance metrics
  useEffect(() => {
    // Group orders by WhatsApp ID (zap field)
    const whatsappGroups = filteredOrders.reduce((groups, order) => {
      const zapId = order.zap || 'Não informado';
      if (!groups[zapId]) {
        groups[zapId] = [];
      }
      groups[zapId].push(order);
      return groups;
    }, {} as Record<string, Order[]>);

    // Calculate performance metrics for each WhatsApp
    const performance = Object.entries(whatsappGroups).map(([zapId, zapOrders]) => {
      const totalSales = zapOrders.length;
      const totalValue = zapOrders.reduce((sum, order) => sum + order.valorVenda, 0);
      const receivedValue = zapOrders.reduce((sum, order) => sum + order.valorRecebido, 0);
      const conversionRate = totalValue > 0 ? (receivedValue / totalValue) * 100 : 0;
      const averageTicket = totalSales > 0 ? totalValue / totalSales : 0;

      return {
        zapId,
        totalSales,
        totalValue,
        conversionRate,
        averageTicket,
      };
    });

    // Sort by total sales descending
    performance.sort((a, b) => b.totalSales - a.totalSales);
    
    setWhatsappPerformance(performance);
  }, [filteredOrders]);

  // Calculate totals
  const totalSales = whatsappPerformance.reduce((sum, item) => sum + item.totalSales, 0);
  const totalValue = whatsappPerformance.reduce((sum, item) => sum + item.totalValue, 0);
  const averageConversion = whatsappPerformance.length > 0
    ? whatsappPerformance.reduce((sum, item) => sum + item.conversionRate, 0) / whatsappPerformance.length
    : 0;

  // Prepare data for charts
  const barChartData = whatsappPerformance.map(item => ({
    name: formatWhatsAppNumber(item.zapId),
    vendas: item.totalSales,
    valor: item.totalValue,
    conversao: item.conversionRate,
    ticket: item.averageTicket,
  }));

  const pieChartData = whatsappPerformance.map(item => ({
    name: formatWhatsAppNumber(item.zapId),
    value: item[selectedMetric as keyof WhatsAppPerformance] as number,
  }));

  // Format WhatsApp number for display
  function formatWhatsAppNumber(number: string): string {
    if (number === 'Não informado') return number;
    
    // If it's already a short format or not a valid number, return as is
    if (number.length <= 5 || !/^\d+$/.test(number.replace(/\D/g, ''))) {
      return number;
    }
    
    // Format as (XX) XXXXX-XXXX if it's a full number
    const digits = number.replace(/\D/g, '');
    if (digits.length >= 10) {
      const ddd = digits.substring(0, 2);
      const prefix = digits.substring(2, 7);
      const suffix = digits.substring(7, 11);
      return `(${ddd}) ${prefix}-${suffix}`;
    }
    
    return number;
  }

  // Handle filter application
  const handleApplyFilter = () => {
    // Filters are already applied via useEffect
  };

  // Handle filter reset
  const handleResetFilter = () => {
    setDateFrom('');
    setDateTo('');
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Desempenho de WhatsApp
      </Typography>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={3}>
            <TextField
              label="Data Inicial"
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField
              label="Data Final"
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <Button
              variant="contained"
              onClick={handleApplyFilter}
              fullWidth
            >
              Aplicar Filtro
            </Button>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Button
              variant="outlined"
              onClick={handleResetFilter}
              fullWidth
            >
              Limpar Filtro
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Total de Vendas
              </Typography>
              <Typography variant="h4" color="primary">
                {totalSales}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {whatsappPerformance.length} WhatsApp(s) ativos
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Valor Total
              </Typography>
              <Typography variant="h4" color="success.main">
                {formatCurrency(totalValue)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Ticket médio: {formatCurrency(totalSales > 0 ? totalValue / totalSales : 0)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Taxa de Conversão Média
              </Typography>
              <Typography variant="h4" color="info.main">
                {averageConversion.toFixed(2)}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Pagamentos recebidos / Valor total
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Desempenho por WhatsApp
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value, name) => {
                  if (name === 'valor' || name === 'ticket') return formatCurrency(Number(value));
                  if (name === 'conversao') return `${Number(value).toFixed(2)}%`;
                  return value;
                }} />
                <Legend />
                <Bar dataKey="vendas" name="Vendas" fill="#8884d8" />
                <Bar dataKey="valor" name="Valor Total" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Distribuição por WhatsApp
            </Typography>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Métrica</InputLabel>
              <Select
                value={selectedMetric}
                label="Métrica"
                onChange={(e) => setSelectedMetric(e.target.value)}
              >
                <MenuItem value="totalSales">Total de Vendas</MenuItem>
                <MenuItem value="totalValue">Valor Total</MenuItem>
                <MenuItem value="conversionRate">Taxa de Conversão</MenuItem>
                <MenuItem value="averageTicket">Ticket Médio</MenuItem>
              </Select>
            </FormControl>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => {
                    if (selectedMetric === 'totalValue' || selectedMetric === 'averageTicket') {
                      return formatCurrency(Number(value));
                    }
                    if (selectedMetric === 'conversionRate') {
                      return `${Number(value).toFixed(2)}%`;
                    }
                    return value;
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* Table */}
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer sx={{ maxHeight: 440 }}>
          <Table stickyHeader aria-label="sticky table">
            <TableHead>
              <TableRow>
                <TableCell>WhatsApp</TableCell>
                <TableCell align="right">Total de Vendas</TableCell>
                <TableCell align="right">Valor Total</TableCell>
                <TableCell align="right">Taxa de Conversão</TableCell>
                <TableCell align="right">Ticket Médio</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {whatsappPerformance.map((item) => (
                <TableRow key={item.zapId} hover>
                  <TableCell>{formatWhatsAppNumber(item.zapId)}</TableCell>
                  <TableCell align="right">{item.totalSales}</TableCell>
                  <TableCell align="right">{formatCurrency(item.totalValue)}</TableCell>
                  <TableCell align="right">{item.conversionRate.toFixed(2)}%</TableCell>
                  <TableCell align="right">{formatCurrency(item.averageTicket)}</TableCell>
                </TableRow>
              ))}
              {whatsappPerformance.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    Nenhum dado disponível
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default WhatsAppPage;
