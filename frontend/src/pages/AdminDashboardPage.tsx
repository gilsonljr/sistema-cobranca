import React, { useState, useEffect } from 'react';
import {
  CircularProgress,
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Chip,
  Tabs,
  Tab,
  Divider,
  Button,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useConversion } from '../contexts/ConversionContext';
import { formatCurrency } from '../utils/formatters';
import RecentComments from '../components/admin/RecentComments';
import CorreiosUpdates from '../components/admin/CorreiosUpdates';
import SalesReports from '../components/admin/SalesReports';
import SalesPerformance from '../components/admin/SalesPerformance';
import { Order } from '../types/Order';
import { useAuth } from '../contexts/AuthContext';

const AdminDashboardPage: React.FC = () => {
  const { conversionSettings, applyConversion } = useConversion();
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);

  // Fetch orders data
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        // Use the mock data for now
        const mockOrdersStr = localStorage.getItem('orders');
        if (mockOrdersStr) {
          const mockOrders = JSON.parse(mockOrdersStr);
          setOrders(mockOrders);
        } else {
          console.error('No orders found in localStorage');
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // Calculate metrics from orders
  const salesCount = orders.length;
  const revenue = orders.reduce((sum, order) => sum + order.valorVenda, 0);

  // For completed sales with empty valor recebido, use the valor venda as the valor recebido
  const receivedValue = orders.reduce((sum, order) => {
    // Check if the order is complete and has empty valor recebido
    if (
      typeof order.situacaoVenda === 'string' &&
      order.situacaoVenda.toLowerCase() === 'completo' &&
      (!order.valorRecebido || order.valorRecebido === 0)
    ) {
      // Use the valor venda as the valor recebido
      return sum + order.valorVenda;
    } else {
      // Otherwise use the actual valor recebido
      return sum + order.valorRecebido;
    }
  }, 0);

  // Calculate the actual conversion rate based on completed orders
  const completedOrders = orders.filter(o =>
    typeof o.situacaoVenda === 'string' &&
    o.situacaoVenda.toLowerCase() === 'completo'
  ).length;

  const conversionRate = Math.round((completedOrders / Math.max(salesCount, 1)) * 100);

  // Apply conversion rates if enabled, otherwise use real values
  const displayedSalesCount = conversionSettings.enabled
    ? Math.round(applyConversion(salesCount, 'salesConversion'))
    : salesCount;

  const displayedRevenue = conversionSettings.enabled
    ? revenue
    : revenue;

  const displayedReceivedValue = conversionSettings.enabled
    ? applyConversion(displayedRevenue, 'revenueConversion')
    : receivedValue;

  const displayedConversionRate = conversionSettings.enabled
    ? conversionSettings.revenueConversion
    : conversionRate;

  // Fix the event parameter warning
  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  return loading ? (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <CircularProgress />
    </Box>
  ) : (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4" gutterBottom>
          Home Dashboard
        </Typography>
        {conversionSettings.enabled && (
          <Chip
            label="Conversão Ativada"
            color="primary"
            variant="outlined"
            sx={{ fontWeight: 'bold' }}
          />
        )}
      </Box>

      <Grid container spacing={3}>
        {/* Summary Cards */}
        <Grid item xs={12} md={6} lg={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Total de Vendas
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'baseline' }}>
                <Typography variant="h4">
                  {displayedSalesCount.toLocaleString()}
                </Typography>
                {conversionSettings.enabled && conversionSettings.salesConversion !== 100 && (
                  <Typography variant="caption" color="primary" sx={{ ml: 1 }}>
                    ({conversionSettings.salesConversion}%)
                  </Typography>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6} lg={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Valor Total
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'baseline' }}>
                <Typography variant="h4">
                  {formatCurrency(displayedRevenue)}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6} lg={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Valor Recebido
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'baseline' }}>
                <Typography variant="h4" color="success.main">
                  {formatCurrency(displayedReceivedValue)}
                </Typography>
                {conversionSettings.enabled && (
                  <Typography variant="caption" color="primary" sx={{ ml: 1 }}>
                    ({conversionSettings.revenueConversion}%)
                  </Typography>
                )}
              </Box>
              <Typography variant="caption" color="text.secondary">
                {Math.round((displayedReceivedValue / displayedRevenue) * 100)}% do total de vendas
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6} lg={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Taxa de Conversão
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'baseline' }}>
                <Typography variant="h4">
                  {displayedConversionRate}%
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Sales Reports Section */}
        <Grid item xs={12}>
          <SalesReports />
        </Grid>

        {/* Tabs for different sections */}
        <Grid item xs={12}>
          <Paper sx={{ mt: 3 }}>
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              indicatorColor="primary"
              textColor="primary"
              variant="fullWidth"
            >
              <Tab label="Desempenho de Vendas" />
              <Tab label="Atualizações Correios" />
              <Tab label="Comentários Recentes" />
            </Tabs>
            <Divider />

            {/* Tab Content */}
            <Box sx={{ p: 0 }}>
              {activeTab === 0 && (
                <SalesPerformance />
              )}

              {activeTab === 1 && (
                <CorreiosUpdates />
              )}

              {activeTab === 2 && (
                <RecentComments />
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminDashboardPage;