import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  CardHeader,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Button,
  CircularProgress,
  Alert,
  useTheme
} from '@mui/material';
import {
  WarningAmber as WarningIcon,
  Inventory as InventoryIcon,
  MonetizationOn as MoneyIcon,
  ShoppingCart as CartIcon,
  LocalShipping as ShippingIcon,
  TrendingUp as TrendingUpIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import NutraService from '../../services/NutraService';
import {
  ProductStockStatus,
  SalesAnalytics,
  InventorySummary,
  Order,
  OrderStatus,
  ProductType
} from '../../types/NutraTypes';
import { formatCurrency } from '../../utils/formatters';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';

const NutraDashboardPage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lowStockProducts, setLowStockProducts] = useState<ProductStockStatus[]>([]);
  const [salesAnalytics, setSalesAnalytics] = useState<SalesAnalytics | null>(null);
  const [inventorySummary, setInventorySummary] = useState<InventorySummary | null>(null);
  const [pendingOrders, setPendingOrders] = useState<Order[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch real data from the API
        try {
          const [lowStock, sales, inventory, orders] = await Promise.all([
            NutraService.getLowStockProducts(),
            NutraService.getSalesAnalytics(30),
            NutraService.getInventorySummary(),
            NutraService.getOrders(OrderStatus.PENDENTE)
          ]);

          setLowStockProducts(lowStock);
          setSalesAnalytics(sales);
          setInventorySummary(inventory);
          setPendingOrders(orders);
        } catch (apiError) {
          console.error('API error:', apiError);
          // Initialize with empty data if API fails
          setLowStockProducts([]);
          setSalesAnalytics({
            total_sales: 0,
            total_revenue: 0,
            products_sold: {},
            kits_sold: {}
          });
          setInventorySummary({
            total_products: 0,
            low_stock_count: 0,
            out_of_stock_count: 0,
            total_inventory_value: 0,
            low_stock_items: []
          });
          setPendingOrders([]);
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Prepare data for stock status pie chart
  const prepareStockStatusData = () => {
    if (!inventorySummary) return [];

    return [
      { name: 'Normal', value: inventorySummary.total_products - inventorySummary.low_stock_count - inventorySummary.out_of_stock_count, color: theme.palette.success.main },
      { name: 'Baixo', value: inventorySummary.low_stock_count, color: theme.palette.warning.main },
      { name: 'Esgotado', value: inventorySummary.out_of_stock_count, color: theme.palette.error.main }
    ].filter(item => item.value > 0);
  };

  // Prepare data for sales by product chart
  const prepareSalesData = () => {
    if (!salesAnalytics) return [];

    return Object.entries(salesAnalytics.products_sold)
      .map(([name, quantity]) => ({ name, quantity }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5); // Top 5 products
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box m={3}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        ZenCaps Dashboard
      </Typography>

      {/* Summary Cards */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <InventoryIcon color="primary" sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography variant="subtitle2" color="textSecondary">
                    Total de Produtos
                  </Typography>
                  <Typography variant="h5">
                    {inventorySummary?.total_products || 0}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <MoneyIcon sx={{ fontSize: 40, mr: 2, color: theme.palette.success.main }} />
                <Box>
                  <Typography variant="subtitle2" color="textSecondary">
                    Valor do Inventário
                  </Typography>
                  <Typography variant="h5">
                    {formatCurrency(inventorySummary?.total_inventory_value || 0)}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <CartIcon sx={{ fontSize: 40, mr: 2, color: theme.palette.info.main }} />
                <Box>
                  <Typography variant="subtitle2" color="textSecondary">
                    Vendas (30 dias)
                  </Typography>
                  <Typography variant="h5">
                    {salesAnalytics?.total_sales || 0}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <ShippingIcon sx={{ fontSize: 40, mr: 2, color: theme.palette.warning.main }} />
                <Box>
                  <Typography variant="subtitle2" color="textSecondary">
                    Pedidos Pendentes
                  </Typography>
                  <Typography variant="h5">
                    {pendingOrders.length}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main Content */}
      <Grid container spacing={3}>
        {/* Low Stock Alert */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Box display="flex" alignItems="center" mb={2}>
              <WarningIcon color="warning" sx={{ mr: 1 }} />
              <Typography variant="h6">Produtos com Estoque Baixo</Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />

            {lowStockProducts.length === 0 ? (
              <Alert severity="success">Todos os produtos estão com estoque adequado!</Alert>
            ) : (
              <List>
                {lowStockProducts.slice(0, 5).map((product) => (
                  <ListItem key={product.id} divider>
                    <ListItemText
                      primary={product.name}
                      secondary={`Estoque: ${product.current_stock} / Mínimo: ${product.minimum_stock}`}
                    />
                    <Chip
                      label={product.status === 'out' ? 'Esgotado' : 'Baixo'}
                      color={product.status === 'out' ? 'error' : 'warning'}
                      size="small"
                    />
                  </ListItem>
                ))}
                {lowStockProducts.length > 5 && (
                  <Box mt={1} textAlign="center">
                    <Button
                      size="small"
                      onClick={() => navigate('/nutra/products')}
                    >
                      Ver todos ({lowStockProducts.length})
                    </Button>
                  </Box>
                )}
              </List>
            )}
          </Paper>
        </Grid>

        {/* Stock Status Chart */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Status do Estoque
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <Box height={250} display="flex" flexDirection="column" justifyContent="center">
              {inventorySummary && (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={prepareStockStatusData()}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {prepareStockStatusData().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} produtos`, 'Quantidade']} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </Box>
          </Paper>
        </Grid>

        {/* Recent Sales */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Box display="flex" alignItems="center" mb={2}>
              <TrendingUpIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6">Produtos Mais Vendidos (30 dias)</Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />

            <Box height={300}>
              {salesAnalytics && (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={prepareSalesData()}
                    margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
                  >
                    <XAxis
                      dataKey="name"
                      angle={-45}
                      textAnchor="end"
                      height={70}
                    />
                    <YAxis />
                    <Tooltip formatter={(value) => [`${value} unidades`, 'Quantidade']} />
                    <Bar dataKey="quantity" fill={theme.palette.primary.main} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </Box>
          </Paper>
        </Grid>

        {/* Pending Orders */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Box display="flex" alignItems="center" mb={2}>
              <ShippingIcon color="info" sx={{ mr: 1 }} />
              <Typography variant="h6">Pedidos Pendentes</Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />

            {pendingOrders.length === 0 ? (
              <Alert severity="info">Não há pedidos pendentes no momento.</Alert>
            ) : (
              <List>
                {pendingOrders.slice(0, 5).map((order) => (
                  <ListItem key={order.id} divider>
                    <ListItemIcon>
                      <ShippingIcon color="action" />
                    </ListItemIcon>
                    <ListItemText
                      primary={`Pedido #${order.id}`}
                      secondary={`Distribuidor: ${order.distributor?.name || 'N/A'}`}
                    />
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => navigate(`/nutra/orders/${order.id}`)}
                    >
                      Detalhes
                    </Button>
                  </ListItem>
                ))}
                {pendingOrders.length > 5 && (
                  <Box mt={1} textAlign="center">
                    <Button
                      size="small"
                      onClick={() => navigate('/nutra/orders')}
                    >
                      Ver todos ({pendingOrders.length})
                    </Button>
                  </Box>
                )}
              </List>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Quick Actions */}
      <Box mt={3}>
        <Grid container spacing={2}>
          <Grid item>
            <Button
              variant="contained"
              color="primary"
              onClick={() => navigate('/nutra/products')}
            >
              Gerenciar Produtos
            </Button>
          </Grid>
          <Grid item>
            <Button
              variant="contained"
              color="secondary"
              onClick={() => navigate('/nutra/kits')}
            >
              Gerenciar Kits
            </Button>
          </Grid>
          <Grid item>
            <Button
              variant="contained"
              color="info"
              onClick={() => navigate('/nutra/orders/new')}
            >
              Novo Pedido
            </Button>
          </Grid>
          <Grid item>
            <Button
              variant="contained"
              color="success"
              onClick={() => navigate('/nutra/sales/new')}
            >
              Registrar Venda
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default NutraDashboardPage;
