import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Tabs,
  Tab,
  Card,
  CardContent,
  LinearProgress,
  Chip,
  IconButton,
  Tooltip,
  Divider,
  Alert,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import {
  TrendingUp as TrendingUpIcon,
  AttachMoney as AttachMoneyIcon,
  Timer as TimerIcon,
  Star as StarIcon,
  GetApp as GetAppIcon,
  EmojiEvents as EmojiEventsIcon,
} from '@mui/icons-material';
import ptBR from 'date-fns/locale/pt-BR';
import { Order } from '../types/Order';
import AuthService from '../services/AuthService';
import { Link } from 'react-router-dom';
import { formatCurrency, formatPercentage } from '../utils/formatters';

interface PerformanceData {
  name: string;
  totalOrders: number;
  totalValue: number;
  conversionRate: number;
  averageValue: number;
  successRate: number;
  collectionTime: number;
}

interface Props {
  orders: Order[];
}

const ReportsPage: React.FC<Props> = ({ orders }) => {
  const [activeTab, setActiveTab] = React.useState(0);
  const [selectedPeriod, setSelectedPeriod] = React.useState<string>('month');
  const [startDate, setStartDate] = React.useState<Date | null>(null);
  const [endDate, setEndDate] = React.useState<Date | null>(null);
  const [filteredOrdersList, setFilteredOrdersList] = React.useState<Order[]>([]);
  
  // Add role checks
  const isAdmin = AuthService.isAdmin();
  const isSupervisor = AuthService.isSupervisor();
  const isSeller = AuthService.isSeller();
  const userInfo = AuthService.getUserInfo();
  const currentUserName = userInfo?.full_name || '';
  
  // Filter out deleted orders first
  const nonDeletedOrders = React.useMemo(() => 
    orders.filter(order => !order.situacaoVenda || order.situacaoVenda.toLowerCase() !== 'deletado'), 
    [orders]
  );
  
  // Parse date from DD/MM/YYYY format
  const parseDate = (dateStr: string): Date | null => {
    try {
      const parts = dateStr.split('/');
      if (parts.length !== 3) return null;
      
      const [day, month, year] = parts.map(Number);
      if (isNaN(day) || isNaN(month) || isNaN(year)) return null;
      
      return new Date(year, month - 1, day);
    } catch (e) {
      console.error("Error parsing date:", dateStr, e);
      return null;
    }
  };

  // Aplicar filtros de período
  const applyPeriodFilter = () => {
    let filtered = [...nonDeletedOrders];
    
    if (selectedPeriod === 'custom') {
      // Filtro personalizado usando as datas selecionadas
      if (startDate || endDate) {
        filtered = filtered.filter(order => {
          const orderDate = parseDate(order.dataVenda);
          if (!orderDate) return true;
          
          const afterStart = startDate ? orderDate >= startDate : true;
          const beforeEnd = endDate ? orderDate <= endDate : true;
          
          return afterStart && beforeEnd;
        });
      }
    } else {
      // Filtros predefinidos
      const today = new Date();
      let startFilter: Date | null = null;
      
      if (selectedPeriod === 'day') {
        // Hoje
        startFilter = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      } else if (selectedPeriod === 'week') {
        // Esta semana (domingo a sábado)
        const dayOfWeek = today.getDay();
        startFilter = new Date(today);
        startFilter.setDate(today.getDate() - dayOfWeek);
      } else if (selectedPeriod === 'month') {
        // Este mês
        startFilter = new Date(today.getFullYear(), today.getMonth(), 1);
      }
      
      if (startFilter) {
        filtered = filtered.filter(order => {
          const orderDate = parseDate(order.dataVenda);
          return orderDate ? orderDate >= startFilter! : true;
        });
      }
    }
    
    setFilteredOrdersList(filtered);
  };

  // Efeito para aplicar filtros quando o período é alterado
  React.useEffect(() => {
    if (selectedPeriod !== 'custom') {
      applyPeriodFilter();
    }
  }, [selectedPeriod, nonDeletedOrders]);
  
  // Efeito inicial
  React.useEffect(() => {
    setFilteredOrdersList(nonDeletedOrders);
  }, [nonDeletedOrders]);

  const calculateSellerPerformance = (filteredOrders: Order[]): PerformanceData[] => {
    const performanceMap = new Map<string, PerformanceData>();

    filteredOrders.forEach(order => {
      const seller = order.vendedor || 'Não atribuído';
      const current = performanceMap.get(seller) || {
        name: seller,
        totalOrders: 0,
        totalValue: 0,
        conversionRate: 0,
        averageValue: 0,
        successRate: 0,
        collectionTime: 0,
      };

      current.totalOrders++;
      current.totalValue += order.valorVenda;
      
      if (order.situacaoVenda.toLowerCase() === 'completo') {
        current.successRate++;
      }

      performanceMap.set(seller, current);
    });

    return Array.from(performanceMap.values()).map(data => ({
      ...data,
      conversionRate: (data.successRate / data.totalOrders) * 100,
      averageValue: data.totalValue / data.totalOrders,
      successRate: (data.successRate / data.totalOrders) * 100,
    })).sort((a, b) => b.totalValue - a.totalValue);
  };

  const calculateOperatorPerformance = (filteredOrders: Order[]): PerformanceData[] => {
    const performanceMap = new Map<string, PerformanceData>();

    filteredOrders.forEach(order => {
      const operator = order.operador || 'Não atribuído';
      const current = performanceMap.get(operator) || {
        name: operator,
        totalOrders: 0,
        totalValue: 0,
        conversionRate: 0,
        averageValue: 0,
        successRate: 0,
        collectionTime: 0,
      };

      current.totalOrders++;
      current.totalValue += order.valorRecebido;
      
      if (order.valorRecebido > 0) {
        current.successRate++;
      }

      performanceMap.set(operator, current);
    });

    return Array.from(performanceMap.values()).map(data => ({
      ...data,
      conversionRate: (data.successRate / data.totalOrders) * 100,
      averageValue: data.totalValue / data.totalOrders,
      successRate: (data.successRate / data.totalOrders) * 100,
    })).sort((a, b) => b.totalValue - a.totalValue);
  };

  const sellerPerformance = calculateSellerPerformance(filteredOrdersList);
  const operatorPerformance = calculateOperatorPerformance(filteredOrdersList);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Relatórios de Desempenho</Typography>
        <Button
          variant="outlined"
          startIcon={<GetAppIcon />}
          onClick={() => {/* TODO: Implementar exportação */}}
        >
          Exportar Relatório
        </Button>
      </Box>

      <Paper sx={{ mb: 3 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={activeTab}
            onChange={(event, newValue) => setActiveTab(newValue)}
            variant="fullWidth"
          >
            <Tab label="Desempenho de Vendedores" value={0} />
            {(isAdmin || isSupervisor) && (
              <Tab label="Desempenho de Operadores" value={1} />
            )}
          </Tabs>
        </Box>

        <Box sx={{ p: 3 }}>
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>Período</InputLabel>
                <Select
                  value={selectedPeriod}
                  label="Período"
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                >
                  <MenuItem value="day">Hoje</MenuItem>
                  <MenuItem value="week">Esta Semana</MenuItem>
                  <MenuItem value="month">Este Mês</MenuItem>
                  <MenuItem value="custom">Personalizado</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {selectedPeriod === 'custom' && (
              <>
                <Grid item xs={12} sm={3}>
                  <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
                    <DatePicker
                      label="Data Inicial"
                      value={startDate}
                      onChange={(newValue) => setStartDate(newValue)}
                      format="dd/MM/yyyy"
                      slotProps={{ textField: { fullWidth: true } }}
                    />
                  </LocalizationProvider>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
                    <DatePicker
                      label="Data Final"
                      value={endDate}
                      onChange={(newValue) => setEndDate(newValue)}
                      format="dd/MM/yyyy"
                      slotProps={{ textField: { fullWidth: true } }}
                    />
                  </LocalizationProvider>
                </Grid>
                <Grid item xs={12} sm={2}>
                  <Button 
                    variant="contained" 
                    color="primary"
                    fullWidth
                    sx={{ height: '56px' }}
                    onClick={applyPeriodFilter}
                  >
                    Aplicar Filtro
                  </Button>
                </Grid>
              </>
            )}
          </Grid>

          {activeTab === 0 ? (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Vendedor</TableCell>
                    <TableCell align="right">Total de Pedidos</TableCell>
                    <TableCell align="right">Valor Total</TableCell>
                    <TableCell align="right">Valor Médio</TableCell>
                    <TableCell align="right">Taxa de Conversão</TableCell>
                    <TableCell align="right">Ranking</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sellerPerformance.map((seller, index) => (
                    <TableRow key={seller.name} sx={{ '&:hover': { bgcolor: 'action.hover' } }}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          {index < 3 && (
                            <StarIcon sx={{ color: ['#FFD700', '#C0C0C0', '#CD7F32'][index], mr: 1 }} />
                          )}
                          {seller.name}
                        </Box>
                      </TableCell>
                      <TableCell align="right">{seller.totalOrders}</TableCell>
                      <TableCell align="right">
                        R$ {seller.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell align="right">
                        R$ {seller.averageValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell align="right">
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <LinearProgress
                            variant="determinate"
                            value={seller.conversionRate}
                            sx={{ flexGrow: 1, mr: 1 }}
                          />
                          {seller.conversionRate.toFixed(1)}%
                        </Box>
                      </TableCell>
                      <TableCell align="right">#{index + 1}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Operador</TableCell>
                    <TableCell align="right">Total de Cobranças</TableCell>
                    <TableCell align="right">Valor Recuperado</TableCell>
                    <TableCell align="right">Média por Cobrança</TableCell>
                    <TableCell align="right">Taxa de Sucesso</TableCell>
                    <TableCell align="right">Ranking</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {operatorPerformance.map((operator, index) => (
                    <TableRow key={operator.name} sx={{ '&:hover': { bgcolor: 'action.hover' } }}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          {index < 3 && (
                            <StarIcon sx={{ color: ['#FFD700', '#C0C0C0', '#CD7F32'][index], mr: 1 }} />
                          )}
                          {operator.name}
                        </Box>
                      </TableCell>
                      <TableCell align="right">{operator.totalOrders}</TableCell>
                      <TableCell align="right">
                        R$ {operator.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell align="right">
                        R$ {operator.averageValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell align="right">
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <LinearProgress
                            variant="determinate"
                            value={operator.successRate}
                            sx={{ flexGrow: 1, mr: 1 }}
                          />
                          {operator.successRate.toFixed(1)}%
                        </Box>
                      </TableCell>
                      <TableCell align="right">#{index + 1}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      </Paper>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {activeTab === 0 ? 'Melhores Vendedores' : 'Melhores Operadores'}
              </Typography>
              <Box sx={{ mt: 2 }}>
                {(activeTab === 0 ? sellerPerformance : operatorPerformance)
                  .slice(0, 3)
                  .map((person, index) => (
                    <Box key={person.name} sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                      <StarIcon sx={{ color: ['#FFD700', '#C0C0C0', '#CD7F32'][index], mr: 1 }} />
                      <Typography variant="body1" sx={{ flexGrow: 1 }}>
                        {person.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        R$ {person.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </Typography>
                    </Box>
                  ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Resumo do Período
              </Typography>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Total de {activeTab === 0 ? 'Vendas' : 'Cobranças'}
                  </Typography>
                  <Typography variant="h6">
                    {(activeTab === 0 ? sellerPerformance : operatorPerformance)
                      .reduce((sum, p) => sum + p.totalOrders, 0)}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Valor Total
                  </Typography>
                  <Typography variant="h6">
                    R$ {(activeTab === 0 ? sellerPerformance : operatorPerformance)
                      .reduce((sum, p) => sum + p.totalValue, 0)
                      .toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Taxa Média de {activeTab === 0 ? 'Conversão' : 'Sucesso'}
                  </Typography>
                  <Typography variant="h6">
                    {((activeTab === 0 ? sellerPerformance : operatorPerformance)
                      .reduce((sum, p) => sum + (activeTab === 0 ? p.conversionRate : p.successRate), 0) /
                      (activeTab === 0 ? sellerPerformance : operatorPerformance).length)
                      .toFixed(1)}%
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Valor Médio
                  </Typography>
                  <Typography variant="h6">
                    R$ {((activeTab === 0 ? sellerPerformance : operatorPerformance)
                      .reduce((sum, p) => sum + p.averageValue, 0) /
                      (activeTab === 0 ? sellerPerformance : operatorPerformance).length)
                      .toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Only show operator performance for admin and supervisor */}
      {!isSeller && (
        <Grid item xs={12}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: '12px',
              boxShadow: '0 0 10px rgba(0,0,0,0.1)'
            }}
          >
            <Typography variant="h6" gutterBottom>
              Desempenho do Operador
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Operador</TableCell>
                    <TableCell align="right">Total de Cobranças</TableCell>
                    <TableCell align="right">Valor Recuperado</TableCell>
                    <TableCell align="right">Média por Cobrança</TableCell>
                    <TableCell align="right">Taxa de Sucesso</TableCell>
                    <TableCell align="right">Ranking</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {operatorPerformance.map((operator, index) => (
                    <TableRow key={operator.name} sx={{ '&:hover': { bgcolor: 'action.hover' } }}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          {index < 3 && (
                            <StarIcon sx={{ color: ['#FFD700', '#C0C0C0', '#CD7F32'][index], mr: 1 }} />
                          )}
                          {operator.name}
                        </Box>
                      </TableCell>
                      <TableCell align="right">{operator.totalOrders}</TableCell>
                      <TableCell align="right">
                        R$ {operator.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell align="right">
                        R$ {operator.averageValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell align="right">
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <LinearProgress
                            variant="determinate"
                            value={operator.successRate}
                            sx={{ flexGrow: 1, mr: 1 }}
                          />
                          {operator.successRate.toFixed(1)}%
                        </Box>
                      </TableCell>
                      <TableCell align="right">#{index + 1}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      )}
      
      {/* For sellers, show a personalized performance section */}
      {isSeller && (
        <Grid item xs={12}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: '12px',
              boxShadow: '0 0 10px rgba(0,0,0,0.1)'
            }}
          >
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <EmojiEventsIcon sx={{ mr: 1, color: '#FFD700' }} />
              Meu Desempenho
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Typography variant="body2" sx={{ mb: 2 }}>
              Veja seu desempenho pessoal no período selecionado. Para rankings completos e comparações, visite a página de <Link to="/ranking">Ranking de Vendedores</Link>.
            </Typography>
            
            {sellerPerformance.filter(seller => seller.name === currentUserName).length > 0 ? (
              <Grid container spacing={3}>
                <Grid item xs={12} md={6} lg={3}>
                  <Card sx={{ bgcolor: '#f8f9fa', height: '100%' }}>
                    <CardContent>
                      <Typography variant="subtitle2" color="text.secondary">
                        Total de Vendas
                      </Typography>
                      <Typography variant="h4" sx={{ mt: 1, fontWeight: 600 }}>
                        {sellerPerformance.find(s => s.name === currentUserName)?.totalOrders || 0}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={6} lg={3}>
                  <Card sx={{ bgcolor: '#f8f9fa', height: '100%' }}>
                    <CardContent>
                      <Typography variant="subtitle2" color="text.secondary">
                        Valor Total
                      </Typography>
                      <Typography variant="h4" sx={{ mt: 1, fontWeight: 600 }}>
                        {formatCurrency(sellerPerformance.find(s => s.name === currentUserName)?.totalValue || 0)}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={6} lg={3}>
                  <Card sx={{ bgcolor: '#f8f9fa', height: '100%' }}>
                    <CardContent>
                      <Typography variant="subtitle2" color="text.secondary">
                        Ticket Médio
                      </Typography>
                      <Typography variant="h4" sx={{ mt: 1, fontWeight: 600 }}>
                        {formatCurrency(sellerPerformance.find(s => s.name === currentUserName)?.averageValue || 0)}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={6} lg={3}>
                  <Card sx={{ bgcolor: '#f8f9fa', height: '100%' }}>
                    <CardContent>
                      <Typography variant="subtitle2" color="text.secondary">
                        Taxa de Sucesso
                      </Typography>
                      <Typography variant="h4" sx={{ mt: 1, fontWeight: 600 }}>
                        {(sellerPerformance.find(s => s.name === currentUserName)?.successRate || 0).toFixed(0)}%
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            ) : (
              <Alert severity="info">
                Não foram encontrados dados de vendas para você no período selecionado.
              </Alert>
            )}
          </Paper>
        </Grid>
      )}
    </Box>
  );
};

export default ReportsPage; 