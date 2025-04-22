import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Tabs,
  Tab,
  Typography,
  Paper,
  Alert,
  AlertTitle,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  Divider,
  Button,
  TextField,
  InputAdornment,
  IconButton,
  Snackbar
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import {
  BarChart as BarChartIcon,
  Timeline as TimelineIcon,
  PieChart as PieChartIcon,
  People as PeopleIcon,
  CalendarToday as CalendarIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Print as PrintIcon,
  GetApp as DownloadIcon
} from '@mui/icons-material';
import { Order } from '../types/Order';
// Importar componentes de relatórios
import AnalyticsDashboard from './reports/AnalyticsDashboard';
import CashFlowForecast from './reports/CashFlowForecast';
import OperatorPerformance from './reports/OperatorPerformance';
import SellerPerformance from './reports/SellerPerformance';
import AuthService from '../services/AuthService';

// Update interface for date types
interface AdvancedReportsPageProps {
  orders: Order[];
}

// Update the component prop types to allow null dates
interface ReportComponentProps {
  orders: Order[];
  startDate: Date | null;
  endDate: Date | null;
}

const AdvancedReportsPage: React.FC<AdvancedReportsPageProps> = ({ orders }) => {
  const [tabValue, setTabValue] = useState<string>("analytics");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [filterApplied, setFilterApplied] = useState(false);
  
  // Role-based access
  const isAdmin = AuthService.isAdmin();
  const isSupervisor = AuthService.isSupervisor();
  
  // Filter out deleted orders
  const filteredOrders = useMemo(() => {
    return orders.filter(order => 
      !order.situacaoVenda || order.situacaoVenda.toLowerCase() !== 'deletado'
    );
  }, [orders]);
  
  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
    setTabValue(newValue);
  };
  
  // Apply date filter
  const applyDateFilter = () => {
    setFilterApplied(true);
  };
  
  // Clear date filter
  const clearDateFilter = () => {
    setStartDate(null);
    setEndDate(null);
    setFilterApplied(false);
  };
  
  return (
    <Box sx={{ py: 3, px: 4 }}>
      <Typography variant="h4" gutterBottom>
        Relatórios Avançados
      </Typography>
      
      <Paper sx={{ mt: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}
        >
          <Tab label="Dashboard Analítico" value="analytics" icon={<BarChartIcon />} iconPosition="start" />
          <Tab label="Previsão de Fluxo de Caixa" value="cashflow" icon={<TimelineIcon />} iconPosition="start" />
          <Tab label="Performance de Vendedores" value="sellers" icon={<PeopleIcon />} iconPosition="start" />
          {(isAdmin || isSupervisor) && (
            <Tab label="Performance de Operadores" value="operators" icon={<PeopleIcon />} iconPosition="start" />
          )}
        </Tabs>
        
        <Box sx={{ p: 3 }}>
          {/* Filtro de data (comum para todos os relatórios) */}
          <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
            <DatePicker
              label="Data inicial"
              value={startDate}
              onChange={(newValue) => setStartDate(newValue)}
              slotProps={{ textField: { size: 'small' } }}
            />
            <DatePicker
              label="Data final"
              value={endDate}
              onChange={(newValue) => setEndDate(newValue)}
              slotProps={{ textField: { size: 'small' } }}
            />
            <Button
              variant="contained"
              onClick={applyDateFilter}
              disabled={!startDate && !endDate}
              startIcon={<FilterIcon />}
            >
              Aplicar Filtro
            </Button>
            {filterApplied && (
              <Button
                variant="outlined"
                onClick={clearDateFilter}
              >
                Limpar Filtro
              </Button>
            )}
          </Box>
          
          {/* Conteúdo dos relatórios */}
          {tabValue === "analytics" && (
            <AnalyticsDashboard
              orders={filteredOrders}
              startDate={startDate}
              endDate={endDate}
            />
          )}
          
          {tabValue === "cashflow" && (
            <CashFlowForecast
              orders={filteredOrders}
              startDate={startDate}
              endDate={endDate}
            />
          )}
          
          {tabValue === "sellers" && (
            <SellerPerformance
              orders={filteredOrders}
              startDate={startDate}
              endDate={endDate}
            />
          )}
          
          {tabValue === "operators" && (isAdmin || isSupervisor) && (
            <OperatorPerformance
              orders={filteredOrders}
              startDate={startDate}
              endDate={endDate}
            />
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default AdvancedReportsPage;
