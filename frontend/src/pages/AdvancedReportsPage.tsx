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

interface AdvancedReportsPageProps {
  orders: Order[];
}

const AdvancedReportsPage: React.FC<AdvancedReportsPageProps> = ({ orders }) => {
  const [activeTab, setActiveTab] = useState(0);

  // Estados para as datas de filtro
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  // Filter out deleted orders
  const nonDeletedOrders = useMemo(() => 
    orders.filter(order => !order.situacaoVenda || order.situacaoVenda.toLowerCase() !== 'deletado'), 
    [orders]
  );

  // Estado para controlar a mensagem de sucesso
  const [showFilterSuccess, setShowFilterSuccess] = useState(false);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    alert('Funcionalidade de download será implementada em breve.');
  };

  // Função para aplicar os filtros
  const applyFilters = () => {
    setStartDate(startDate);
    setEndDate(endDate);
    setShowFilterSuccess(true);
  };

  // Função para fechar o alerta de sucesso
  const handleCloseSuccess = () => {
    setShowFilterSuccess(false);
  };

  return (
    <Box sx={{ p: 4, bgcolor: '#f9fafc' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 500, color: '#334155' }}>
          Relatórios Avançados
        </Typography>

        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<PrintIcon />}
            onClick={handlePrint}
            sx={{
              borderRadius: '8px',
              textTransform: 'none',
              boxShadow: 'none',
              borderColor: '#e2e8f0',
              color: '#64748b',
              '&:hover': { borderColor: '#cbd5e1', bgcolor: '#f8fafc' }
            }}
          >
            Imprimir
          </Button>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={handleDownload}
            sx={{
              borderRadius: '8px',
              textTransform: 'none',
              boxShadow: 'none',
              borderColor: '#e2e8f0',
              color: '#64748b',
              '&:hover': { borderColor: '#cbd5e1', bgcolor: '#f8fafc' }
            }}
          >
            Exportar
          </Button>
        </Box>
      </Box>

      <Paper sx={{ mb: 4, borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.1)' }}>
        <Box sx={{ p: 3, display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
          <Typography variant="subtitle1" sx={{ mr: 2, color: '#475569', fontWeight: 500 }}>
            Filtros:
          </Typography>

          <DatePicker
            label="Data Inicial"
            value={startDate}
            onChange={(newValue) => setStartDate(newValue)}
            format="dd/MM/yyyy"
            slotProps={{
              textField: {
                size: "small",
                sx: { width: 150 }
              }
            }}
          />

          <DatePicker
            label="Data Final"
            value={endDate}
            onChange={(newValue) => setEndDate(newValue)}
            format="dd/MM/yyyy"
            slotProps={{
              textField: {
                size: "small",
                sx: { width: 150 }
              }
            }}
          />

          <Button
            variant="contained"
            color="primary"
            size="small"
            onClick={applyFilters}
            startIcon={<FilterIcon />}
            sx={{
              borderRadius: '8px',
              textTransform: 'none',
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
              bgcolor: '#3b82f6',
              '&:hover': { bgcolor: '#2563eb' }
            }}
          >
            Aplicar Filtros
          </Button>

          <TextField
            placeholder="Buscar..."
            size="small"
            sx={{ width: 200, '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
          />

          <IconButton color="primary" aria-label="filtros avançados" sx={{ color: '#64748b' }}>
            <FilterIcon />
          </IconButton>
        </Box>
      </Paper>

      <Box sx={{ mb: 4 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          aria-label="relatórios avançados tabs"
          sx={{
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
          <Tab
            label="Dashboard Analítico"
            icon={<BarChartIcon />}
            iconPosition="start"
          />
          <Tab
            label="Previsão de Recebimentos"
            icon={<TimelineIcon />}
            iconPosition="start"
          />
          <Tab
            label="Performance de Operadores"
            icon={<PeopleIcon />}
            iconPosition="start"
          />
          <Tab
            label="Performance de Vendedores"
            icon={<PeopleIcon />}
            iconPosition="start"
          />
        </Tabs>
      </Box>

      <Box sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={handleTabChange}>
            <Tab label="Dashboard Analítico" />
            <Tab label="Performance de Vendedores" />
            <Tab label="Previsão de Fluxo de Caixa" />
          </Tabs>
        </Box>
        
        <Box sx={{ mt: 3 }}>
          {activeTab === 0 && (
            <AnalyticsDashboard 
              orders={nonDeletedOrders} 
              startDate={startDate ? startDate : undefined} 
              endDate={endDate ? endDate : undefined} 
            />
          )}
          {activeTab === 1 && (
            <SellerPerformance 
              orders={nonDeletedOrders} 
              startDate={startDate ? startDate : undefined} 
              endDate={endDate ? endDate : undefined} 
            />
          )}
          {activeTab === 2 && (
            <CashFlowForecast 
              orders={nonDeletedOrders} 
              startDate={startDate ? startDate : undefined} 
              endDate={endDate ? endDate : undefined} 
            />
          )}
        </Box>
      </Box>

      {/* Sugestões de relatórios adicionais */}
      {activeTab === -1 && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            Outros Relatórios Disponíveis
          </Typography>
          <Divider sx={{ mb: 3 }} />

          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={4}>
              <Card>
                <CardActionArea>
                  <CardContent>
                    <PieChartIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
                    <Typography variant="h6" component="div">
                      Análise de Clientes
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Segmentação de clientes, comportamento de compra e análise de risco.
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <Card>
                <CardActionArea>
                  <CardContent>
                    <TimelineIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
                    <Typography variant="h6" component="div">
                      Análise de Tendências
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Identificação de padrões sazonais e previsão de demanda.
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <Card>
                <CardActionArea>
                  <CardContent>
                    <BarChartIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
                    <Typography variant="h6" component="div">
                      Análise Geográfica
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Distribuição regional de vendas e performance por localidade.
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          </Grid>
        </Box>
      )}

      {/* Snackbar para mostrar mensagem de sucesso ao aplicar filtros */}
      <Snackbar
        open={showFilterSuccess}
        autoHideDuration={3000}
        onClose={handleCloseSuccess}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        sx={{ '& .MuiAlert-root': { borderRadius: '10px' } }}
      >
        <Alert onClose={handleCloseSuccess} severity="success" sx={{ width: '100%' }}>
          Filtros aplicados com sucesso!
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdvancedReportsPage;
