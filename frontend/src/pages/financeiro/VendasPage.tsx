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
  Tabs,
  Tab,
} from '@mui/material';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { formatCurrency } from '../../utils/formatters';
import { Order } from '../../types/Order';

// Interface for Vendor performance data
interface VendorPerformance {
  vendorName: string;
  totalSales: number;
  totalValue: number;
  receivedValue: number;
  conversionRate: number;
  averageTicket: number;
}

// Interface for daily sales data
interface DailySales {
  date: string;
  sales: number;
  value: number;
  received: number;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

const VendasPage: React.FC<{ orders?: Order[] }> = ({ orders = [] }) => {
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [vendorPerformance, setVendorPerformance] = useState<VendorPerformance[]>([]);
  const [dailySales, setDailySales] = useState<DailySales[]>([]);
  const [selectedMetric, setSelectedMetric] = useState('totalSales');
  const [tabValue, setTabValue] = useState(0);

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

  // Calculate vendor performance metrics
  useEffect(() => {
    // Group orders by vendor
    const vendorGroups = filteredOrders.reduce((groups, order) => {
      const vendorName = order.vendedor || 'Não informado';
      if (!groups[vendorName]) {
        groups[vendorName] = [];
      }
      groups[vendorName].push(order);
      return groups;
    }, {} as Record<string, Order[]>);

    // Calculate performance metrics for each vendor
    const performance = Object.entries(vendorGroups).map(([vendorName, vendorOrders]) => {
      const totalSales = vendorOrders.length;
      const totalValue = vendorOrders.reduce((sum, order) => sum + order.valorVenda, 0);
      const receivedValue = vendorOrders.reduce((sum, order) => sum + order.valorRecebido, 0);
      const conversionRate = totalValue > 0 ? (receivedValue / totalValue) * 100 : 0;
      const averageTicket = totalSales > 0 ? totalValue / totalSales : 0;

      return {
        vendorName,
        totalSales,
        totalValue,
        receivedValue,
        conversionRate,
        averageTicket,
      };
    });

    // Sort by total sales descending
    performance.sort((a, b) => b.totalSales - a.totalSales);
    
    setVendorPerformance(performance);

    // Calculate daily sales
    const salesByDate = filteredOrders.reduce((acc, order) => {
      const date = order.dataVenda;
      if (!acc[date]) {
        acc[date] = {
          date,
          sales: 0,
          value: 0,
          received: 0,
        };
      }
      acc[date].sales += 1;
      acc[date].value += order.valorVenda;
      acc[date].received += order.valorRecebido;
      return acc;
    }, {} as Record<string, DailySales>);

    // Convert to array and sort by date
    const dailySalesArray = Object.values(salesByDate).sort((a, b) => {
      const dateA = new Date(a.date.split('/').reverse().join('-'));
      const dateB = new Date(b.date.split('/').reverse().join('-'));
      return dateA.getTime() - dateB.getTime();
    });

    setDailySales(dailySalesArray);
  }, [filteredOrders]);

  // Calculate totals
  const totalSales = vendorPerformance.reduce((sum, item) => sum + item.totalSales, 0);
  const totalValue = vendorPerformance.reduce((sum, item) => sum + item.totalValue, 0);
  const totalReceived = vendorPerformance.reduce((sum, item) => sum + item.receivedValue, 0);
  const overallConversionRate = totalValue > 0 ? (totalReceived / totalValue) * 100 : 0;

  // Prepare data for charts
  const barChartData = vendorPerformance.slice(0, 10).map(item => ({
    name: item.vendorName,
    vendas: item.totalSales,
    valor: item.totalValue,
    recebido: item.receivedValue,
    conversao: item.conversionRate,
    ticket: item.averageTicket,
  }));

  const pieChartData = vendorPerformance.slice(0, 10).map(item => ({
    name: item.vendorName,
    value: item[selectedMetric as keyof VendorPerformance] as number,
  }));

  // Handle filter application
  const handleApplyFilter = () => {
    // Filters are already applied via useEffect
  };

  // Handle filter reset
  const handleResetFilter = () => {
    setDateFrom('');
    setDateTo('');
  };

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Relatório Financeiro de Vendas
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
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Total de Vendas
              </Typography>
              <Typography variant="h4" color="primary">
                {totalSales}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {vendorPerformance.length} vendedor(es)
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
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
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Valor Recebido
              </Typography>
              <Typography variant="h4" color="info.main">
                {formatCurrency(totalReceived)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {overallConversionRate.toFixed(2)}% do valor total
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                A Receber
              </Typography>
              <Typography variant="h4" color="warning.main">
                {formatCurrency(totalValue - totalReceived)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {(100 - overallConversionRate).toFixed(2)}% do valor total
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs for different views */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          centered
        >
          <Tab label="Por Vendedor" />
          <Tab label="Evolução Diária" />
        </Tabs>
      </Paper>

      {/* Charts based on selected tab */}
      {tabValue === 0 ? (
        // Vendor Performance View
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Desempenho por Vendedor (Top 10)
              </Typography>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={barChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value, name) => {
                    if (name === 'valor' || name === 'recebido' || name === 'ticket') return formatCurrency(Number(value));
                    if (name === 'conversao') return `${Number(value).toFixed(2)}%`;
                    return value;
                  }} />
                  <Legend />
                  <Bar dataKey="vendas" name="Vendas" fill="#8884d8" />
                  <Bar dataKey="valor" name="Valor Total" fill="#82ca9d" />
                  <Bar dataKey="recebido" name="Valor Recebido" fill="#ffc658" />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2, height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                Distribuição por Vendedor
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
                  <MenuItem value="receivedValue">Valor Recebido</MenuItem>
                  <MenuItem value="conversionRate">Taxa de Conversão</MenuItem>
                  <MenuItem value="averageTicket">Ticket Médio</MenuItem>
                </Select>
              </FormControl>
              <ResponsiveContainer width="100%" height={300}>
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
                      if (selectedMetric === 'totalValue' || selectedMetric === 'receivedValue' || selectedMetric === 'averageTicket') {
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
      ) : (
        // Daily Evolution View
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Evolução Diária de Vendas
              </Typography>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={dailySales}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis yAxisId="left" orientation="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip formatter={(value, name) => {
                    if (name === 'value' || name === 'received') return formatCurrency(Number(value));
                    return value;
                  }} />
                  <Legend />
                  <Line yAxisId="left" type="monotone" dataKey="sales" name="Quantidade de Vendas" stroke="#8884d8" />
                  <Line yAxisId="right" type="monotone" dataKey="value" name="Valor Total" stroke="#82ca9d" />
                  <Line yAxisId="right" type="monotone" dataKey="received" name="Valor Recebido" stroke="#ffc658" />
                </LineChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* Table */}
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer sx={{ maxHeight: 440 }}>
          <Table stickyHeader aria-label="sticky table">
            <TableHead>
              <TableRow>
                <TableCell>Vendedor</TableCell>
                <TableCell align="right">Total de Vendas</TableCell>
                <TableCell align="right">Valor Total</TableCell>
                <TableCell align="right">Valor Recebido</TableCell>
                <TableCell align="right">Taxa de Conversão</TableCell>
                <TableCell align="right">Ticket Médio</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {vendorPerformance.map((item) => (
                <TableRow key={item.vendorName} hover>
                  <TableCell>{item.vendorName}</TableCell>
                  <TableCell align="right">{item.totalSales}</TableCell>
                  <TableCell align="right">{formatCurrency(item.totalValue)}</TableCell>
                  <TableCell align="right">{formatCurrency(item.receivedValue)}</TableCell>
                  <TableCell align="right">{item.conversionRate.toFixed(2)}%</TableCell>
                  <TableCell align="right">{formatCurrency(item.averageTicket)}</TableCell>
                </TableRow>
              ))}
              {vendorPerformance.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center">
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

export default VendasPage;
