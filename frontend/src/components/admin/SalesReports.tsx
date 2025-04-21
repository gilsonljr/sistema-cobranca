import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  Grid,
  Card,
  CardContent,
  Divider,
  Button,
  Menu,
  MenuItem,
  IconButton,
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import DownloadIcon from '@mui/icons-material/Download';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import { useConversion } from '../../contexts/ConversionContext';
import { formatCurrency } from '../../utils/formatters';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`sales-tabpanel-${index}`}
      aria-labelledby={`sales-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 2 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

// Mock data for sales reports
const mockSalesData = {
  facebook: {
    totalSales: 125,
    revenue: 62500,
    conversionRate: 3.2,
    averageTicket: 500,
    trend: 'up',
    percentChange: 12,
  },
  whatsapp: {
    totalSales: 98,
    revenue: 49000,
    conversionRate: 4.5,
    averageTicket: 550,
    trend: 'up',
    percentChange: 8,
  },
  vendas: {
    totalSales: 223,
    revenue: 111500,
    conversionRate: 3.8,
    averageTicket: 525,
    trend: 'down',
    percentChange: 3,
  },
};

const SalesReports: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const { conversionSettings, applyConversion } = useConversion();

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setMenuAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

  // Apply conversion if enabled
  const getConvertedValue = (value: number, type: 'salesConversion' | 'revenueConversion') => {
    return conversionSettings.enabled
      ? applyConversion(value, type)
      : value;
  };

  // Helper function to render metric cards
  const renderMetricCard = (title: string, value: string | number, subtitle: string, trend?: 'up' | 'down', percentChange?: number) => (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          {title}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'baseline', mb: 1 }}>
          <Typography variant="h5" component="div" sx={{ fontWeight: 'medium' }}>
            {value}
          </Typography>
          {trend && percentChange && (
            <Box sx={{ display: 'flex', alignItems: 'center', ml: 1 }}>
              {trend === 'up' ? (
                <TrendingUpIcon fontSize="small" color="success" />
              ) : (
                <TrendingDownIcon fontSize="small" color="error" />
              )}
              <Typography
                variant="caption"
                color={trend === 'up' ? 'success.main' : 'error.main'}
                sx={{ ml: 0.5 }}
              >
                {percentChange}%
              </Typography>
            </Box>
          )}
        </Box>
        <Typography variant="body2" color="text.secondary">
          {subtitle}
        </Typography>
      </CardContent>
    </Card>
  );

  return (
    <Paper sx={{ p: 2, height: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Relatórios de Vendas</Typography>
        <Box>
          <Button
            startIcon={<DownloadIcon />}
            size="small"
            variant="outlined"
            sx={{ mr: 1 }}
          >
            Exportar
          </Button>
          <IconButton size="small" onClick={handleMenuClick}>
            <MoreVertIcon />
          </IconButton>
          <Menu
            anchorEl={menuAnchorEl}
            open={Boolean(menuAnchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={handleMenuClose}>Últimos 7 dias</MenuItem>
            <MenuItem onClick={handleMenuClose}>Últimos 30 dias</MenuItem>
            <MenuItem onClick={handleMenuClose}>Este mês</MenuItem>
            <MenuItem onClick={handleMenuClose}>Personalizado</MenuItem>
          </Menu>
        </Box>
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="sales report tabs">
          <Tab label="Facebook" />
          <Tab label="WhatsApp" />
          <Tab label="Vendas" />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            {renderMetricCard(
              'Total de Vendas',
              getConvertedValue(mockSalesData.facebook.totalSales, 'salesConversion').toLocaleString(),
              'via Facebook',
              mockSalesData.facebook.trend as 'up' | 'down',
              mockSalesData.facebook.percentChange
            )}
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            {renderMetricCard(
              'Faturamento',
              formatCurrency(getConvertedValue(mockSalesData.facebook.revenue, 'revenueConversion')),
              'via Facebook',
              mockSalesData.facebook.trend as 'up' | 'down',
              mockSalesData.facebook.percentChange
            )}
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            {renderMetricCard(
              'Taxa de Conversão',
              `${mockSalesData.facebook.conversionRate}%`,
              'Leads para Vendas'
            )}
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            {renderMetricCard(
              'Ticket Médio',
              formatCurrency(mockSalesData.facebook.averageTicket),
              'por Venda'
            )}
          </Grid>
        </Grid>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            {renderMetricCard(
              'Total de Vendas',
              getConvertedValue(mockSalesData.whatsapp.totalSales, 'salesConversion').toLocaleString(),
              'via WhatsApp',
              mockSalesData.whatsapp.trend as 'up' | 'down',
              mockSalesData.whatsapp.percentChange
            )}
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            {renderMetricCard(
              'Faturamento',
              formatCurrency(getConvertedValue(mockSalesData.whatsapp.revenue, 'revenueConversion')),
              'via WhatsApp',
              mockSalesData.whatsapp.trend as 'up' | 'down',
              mockSalesData.whatsapp.percentChange
            )}
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            {renderMetricCard(
              'Taxa de Conversão',
              `${mockSalesData.whatsapp.conversionRate}%`,
              'Leads para Vendas'
            )}
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            {renderMetricCard(
              'Ticket Médio',
              formatCurrency(mockSalesData.whatsapp.averageTicket),
              'por Venda'
            )}
          </Grid>
        </Grid>
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            {renderMetricCard(
              'Total de Vendas',
              getConvertedValue(mockSalesData.vendas.totalSales, 'salesConversion').toLocaleString(),
              'Total Geral',
              mockSalesData.vendas.trend as 'up' | 'down',
              mockSalesData.vendas.percentChange
            )}
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            {renderMetricCard(
              'Faturamento',
              formatCurrency(getConvertedValue(mockSalesData.vendas.revenue, 'revenueConversion')),
              'Total Geral',
              mockSalesData.vendas.trend as 'up' | 'down',
              mockSalesData.vendas.percentChange
            )}
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            {renderMetricCard(
              'Taxa de Conversão',
              `${mockSalesData.vendas.conversionRate}%`,
              'Leads para Vendas'
            )}
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            {renderMetricCard(
              'Ticket Médio',
              formatCurrency(mockSalesData.vendas.averageTicket),
              'por Venda'
            )}
          </Grid>
        </Grid>
      </TabPanel>
    </Paper>
  );
};

export default SalesReports;
