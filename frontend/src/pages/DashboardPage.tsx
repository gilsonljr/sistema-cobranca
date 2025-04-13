import React, { useState } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Dialog,
  Button,
  Card,
  CardContent,
  TextField,
  Divider,
  LinearProgress,
} from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { FilterList as FilterListIcon, Refresh as RefreshIcon } from '@mui/icons-material';
import CSVImport from '../components/CSVImport';
import { Order } from '../types/Order';
import OrdersTable from '../components/OrdersTable';
import ImportDialog from '../components/ImportDialog';
import { StatusFilter } from '../components/Sidebar';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { ptBR } from 'date-fns/locale';
import WebhookTester from '../components/WebhookTester';
import WebhookIcon from '@mui/icons-material/Webhook';

const OverviewCard = ({ title, value, icon, color, subtitle = '', onClick = null, customValueStyle = {}, showProgressBar = false, progressValue = 0 }: any) => (
  <Card 
    sx={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
      transition: 'transform 0.2s', 
      cursor: onClick ? 'pointer' : 'default',
      '&:hover': {
        transform: onClick ? 'translateY(-5px)' : 'none',
        boxShadow: onClick ? '0 5px 15px rgba(0,0,0,0.1)' : '0 2px 10px rgba(0,0,0,0.08)',
      }
    }}
    onClick={onClick}
  >
    <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="subtitle2" color="text.secondary" fontWeight={500}>
          {title}
        </Typography>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          width: 40, 
          height: 40, 
          borderRadius: '50%', 
          bgcolor: `${color}.light`,
          color: `${color}.main`,
        }}>
          {icon}
        </Box>
      </Box>
      <Typography variant="h4" component="div" fontWeight={600} sx={{ mb: 0.5, ...customValueStyle }}>
        {value}
      </Typography>
      {subtitle && (
        <Typography variant="body2" color="text.secondary">
          {subtitle}
        </Typography>
      )}
      {showProgressBar && (
        <Box sx={{ mt: 1, width: '100%' }}>
          <LinearProgress 
            variant="determinate" 
            value={progressValue} 
            sx={{ 
              height: 4, 
              borderRadius: 2,
              bgcolor: 'rgba(0,0,0,0.05)',
              '& .MuiLinearProgress-bar': {
                bgcolor: `${color}.main`,
              }
            }} 
          />
        </Box>
      )}
    </CardContent>
  </Card>
);

const StatusChip = ({ status }: { status: string }) => {
  const getStatusConfig = (status: string) => {
    const configs: any = {
      'Pendente': { color: 'primary', icon: <AccessTimeIcon fontSize="small" /> },
      'Completo': { color: 'success', icon: <CheckCircleIcon fontSize="small" /> },
      'Entrega Falha': { color: 'error', icon: <ErrorIcon fontSize="small" /> },
    };
    return configs[status] || configs['Pendente'];
  };

  const config = getStatusConfig(status);
  return (
    <Chip
      icon={config.icon}
      label={status}
      color={config.color}
      size="small"
      variant="outlined"
      sx={{
        minWidth: 120,
        borderRadius: 1,
        '& .MuiChip-label': {
          px: 1,
        },
      }}
    />
  );
};

interface DashboardPageProps {
  orders: Order[];
  onOrdersUpdate: (orders: Order[]) => void;
  selectedStatus: StatusFilter | null;
  onStatusSelect: (filter: StatusFilter | null) => void;
}

const DashboardPage: React.FC<DashboardPageProps> = ({ 
  orders, 
  onOrdersUpdate, 
  selectedStatus, 
  onStatusSelect 
}) => {
  const [openImport, setOpenImport] = useState(false);
  const [openWebhook, setOpenWebhook] = useState(false);
  const [dateFromInput, setDateFromInput] = useState<string>("");
  const [dateToInput, setDateToInput] = useState<string>("");
  const [dateFrom, setDateFrom] = useState<Date | null>(null);
  const [dateTo, setDateTo] = useState<Date | null>(null);

  const handleImportSuccess = (importedOrders: Order[]) => {
    onOrdersUpdate(importedOrders);
  };

  const handleOpenImport = () => {
    setOpenImport(true);
  };

  const handleCloseImport = () => {
    setOpenImport(false);
  };

  const handleOpenWebhook = () => {
    setOpenWebhook(true);
  };

  const handleCloseWebhook = () => {
    setOpenWebhook(false);
  };

  const formatDateForDisplay = (date: Date | null): string => {
    if (!date) return "";
    try {
      const day = String(date.getUTCDate()).padStart(2, '0');
      const month = String(date.getUTCMonth() + 1).padStart(2, '0');
      const year = date.getUTCFullYear();
      return `${day}/${month}/${year}`;
    } catch (e) {
      console.error("Error formatting date for display:", e);
      return "Invalid Date";
    }
  };

  const handleApplyDateFilter = () => {
    const from = dateFromInput ? new Date(dateFromInput + 'T00:00:00Z') : null;
    const to = dateToInput ? new Date(dateToInput + 'T00:00:00Z') : null;
    
    if (from && isNaN(from.getTime())) {
        console.error("Invalid Start Date Input:", dateFromInput);
        setDateFrom(null);
    } else {
        setDateFrom(from);
    }
    
    if (to && isNaN(to.getTime())) {
        console.error("Invalid End Date Input:", dateToInput);
        setDateTo(null);
    } else {
        if(to) {
            to.setUTCHours(23, 59, 59, 999);
        }
        setDateTo(to);
    }
  };

  const handleClearDateFilter = () => {
    setDateFromInput("");
    setDateToInput("");
    setDateFrom(null);
    setDateTo(null);
  };

  const filteredByStatus = selectedStatus 
    ? orders.filter(order => {
        if (selectedStatus.field === 'special') {
          if (selectedStatus.value === 'dataRecebimento') {
            const today = new Date().toLocaleDateString('pt-BR');
            return order.dataRecebimento === today;
          }
          return true;
        }
        
        if (selectedStatus.field === 'situacaoVenda') {
          const orderStatus = order.situacaoVenda;
          const filterValue = selectedStatus.value;
          
          // Debug: Mostrar comparação de valores
          console.log(`Comparando: "${orderStatus?.toLowerCase()}" === "${filterValue.toLowerCase()}"`, 
                      orderStatus?.toLowerCase() === filterValue.toLowerCase());
          
          return orderStatus && orderStatus.toLowerCase() === filterValue.toLowerCase();
        }
        
        // Caso geral para outros campos
        const field = selectedStatus.field as keyof Order;
        const expectedValue = selectedStatus.value;
        const actualValue = order[field];
        
        if (typeof actualValue === 'string' && typeof expectedValue === 'string') {
          return actualValue.toLowerCase() === expectedValue.toLowerCase();
        }
        
        return actualValue === expectedValue;
      })
    : orders;

  // DEBUG: Mostrar informações para ajudar a diagnosticar
  console.log('Filtro selecionado:', selectedStatus);
  console.log('Total de pedidos antes do filtro:', orders.length);
  console.log('Total de pedidos após o filtro:', filteredByStatus.length);

  // Mostrar os primeiros 3 pedidos (para debug)
  if (orders.length > 0) {
    console.log('Exemplos de pedidos:', orders.slice(0, 3).map(o => ({ 
      id: o.idVenda, 
      situacaoVenda: o.situacaoVenda,
      dataVenda: o.dataVenda 
    })));
  }

  const filteredOrders = filteredByStatus.filter(order => {
    if (!dateFrom && !dateTo) return true;
    
    try {
      const parts = order.dataVenda.split('/');
      if (parts.length !== 3) return true;
      
      const [day, month, year] = parts.map(Number);
      if (isNaN(day) || isNaN(month) || isNaN(year)) return true;
      
      const orderDate = new Date(Date.UTC(year, month - 1, day)); 
      if (isNaN(orderDate.getTime())) return true;

      const afterFrom = dateFrom ? orderDate >= dateFrom : true;
      const beforeTo = dateTo ? orderDate <= dateTo : true;
      
      return afterFrom && beforeTo;
    } catch (e) {
      console.error("Error filtering by date for order:", order.idVenda, e);
      return true;
    }
  });

  const totalSales = filteredOrders.reduce((sum, order) => sum + order.valorVenda, 0);
  const totalReceived = filteredOrders.reduce((sum, order) => sum + order.valorRecebido, 0);
  const completedOrders = filteredOrders.filter(o => 
    typeof o.situacaoVenda === 'string' && 
    o.situacaoVenda.toLowerCase() === 'completo'
  ).length;
  const conversionRate = Math.round((completedOrders / (filteredOrders.length || 1)) * 100);

  const getTodayDateBR = (): string => {
    // Criar data usando timezone de São Paulo, Brasil (GMT-3)
    const today = new Date();
    const offset = -3; // São Paulo, Brasil (GMT-3)
    const localTime = new Date(today.getTime() + offset * 3600 * 1000);
    
    const day = String(localTime.getUTCDate()).padStart(2, '0');
    const month = String(localTime.getUTCMonth() + 1).padStart(2, '0');
    const year = localTime.getUTCFullYear();
    
    return `${day}/${month}/${year}`;
  };

  const todayDate = getTodayDateBR();
  
  // Calcula recebimentos do dia atual
  const todayFullPayments = filteredOrders
    .filter(order => order.dataRecebimento === todayDate)
    .reduce((sum, order) => sum + order.valorRecebido, 0);
    
  const todayPartialPayments = filteredOrders
    .filter(order => order.dataPagamentoParcial === todayDate)
    .reduce((sum, order) => sum + order.pagamentoParcial, 0);

  // Preparar dados para a tabela de resumo
  const statusCounts = orders.reduce((acc: Record<string, number>, order) => {
    const status = order.situacaoVenda || 'Desconhecido';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});

  // Converter para array para exibir
  const statusCountsArray = Object.entries(statusCounts)
    .map(([status, count]) => ({ status, count }))
    .sort((a, b) => b.count - a.count);

  return (
    <Box sx={{ py: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h5" fontWeight={600}>
          Dashboard
        </Typography>
          <Typography variant="body2" color="text.secondary">
            Visão geral de todos os pedidos e desempenho
          </Typography>
        </Box>
        
        <Box sx={{ 
                display: 'flex',
          gap: 2, 
          p: 1, 
          border: '1px solid', 
          borderColor: 'divider', 
          borderRadius: 1,
          bgcolor: 'background.paper'
        }}>
          <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
            <DatePicker
              label="Data Inicial"
              value={dateFromInput ? new Date(dateFromInput) : null}
              onChange={(newValue) => setDateFromInput(newValue ? newValue.toISOString().split('T')[0] : '')}
              format="dd/MM/yyyy"
              slotProps={{
                textField: {
                  size: "small",
                  fullWidth: true
                }
              }}
            />
            <DatePicker
              label="Data Final"
              value={dateToInput ? new Date(dateToInput) : null}
              onChange={(newValue) => setDateToInput(newValue ? newValue.toISOString().split('T')[0] : '')}
              format="dd/MM/yyyy"
              slotProps={{
                textField: {
                  size: "small",
                  fullWidth: true
                }
              }}
            />
          </LocalizationProvider>
          
          <Button 
            variant="contained" 
            size="small" 
            onClick={handleApplyDateFilter}
          >
            Filtrar
          </Button>
          <Button 
            variant="outlined" 
            size="small" 
            onClick={handleClearDateFilter}
          >
            Limpar
          </Button>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<UploadFileIcon />}
            onClick={handleOpenImport}
          >
            Importar
          </Button>
          
          <Button
            variant="outlined"
            color="secondary"
            startIcon={<WebhookIcon />}
            onClick={handleOpenWebhook}
          >
            Testar Webhook
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3} sx={{ mb: 5 }}>
        <Grid item xs={12} sm={6} md={3}>
          <OverviewCard
            title="Total de Vendas"
            value={filteredOrders.length}
            subtitle={dateFrom && dateTo 
              ? `${formatDateForDisplay(dateFrom)} - ${formatDateForDisplay(dateTo)}` 
              : dateFrom 
                ? `A partir de ${formatDateForDisplay(dateFrom)}` 
                : dateTo 
                  ? `Até ${formatDateForDisplay(dateTo)}`
                  : "Todos os períodos"
            }
            icon={<ShoppingCartIcon />}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <OverviewCard
            title="Valor Total"
            value={`R$ ${totalSales.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
            subtitle={`R$ ${(totalSales / Math.max(filteredOrders.length, 1)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} por pedido`}
            icon={<AttachMoneyIcon />}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <OverviewCard
            title="Valor Recebido"
            value={`R$ ${totalReceived.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
            subtitle={`${Math.round((totalReceived / (totalSales || 1)) * 100)}% do total de vendas`}
            icon={<AttachMoneyIcon />}
            color="info"
            customValueStyle={{ color: '#4CAF50', fontWeight: 700 }}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <OverviewCard
            title="Taxa de Conversão"
            value={`${conversionRate}%`}
            subtitle={`${completedOrders} pedidos completos`}
            icon={<TrendingUpIcon />}
            color="warning"
            showProgressBar={true}
            progressValue={conversionRate}
          />
        </Grid>
      </Grid>

      {/* Nova seção: Recebimentos Hoje */}
      <Paper sx={{ p: 3, mb: 5, boxShadow: '0 2px 10px rgba(0,0,0,0.08)' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 500 }}>
            Recebimentos Hoje
              </Typography>
          <Typography 
            variant="body2" 
              sx={{
              color: 'text.secondary',
              px: 1.5,
              py: 0.5,
              borderRadius: 1,
              bgcolor: 'rgba(0, 0, 0, 0.04)',
            }}
          >
            {todayDate}
          </Typography>
        </Box>
        
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <Card sx={{ p: 2, height: '100%', borderLeft: '4px solid #4CAF50' }}>
              <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Recebimento Total
                </Typography>
                <Typography variant="h4" sx={{ color: '#4CAF50', fontWeight: 700, my: 1 }}>
                  R$ {todayFullPayments.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </Typography>
                <Typography variant="body2" color="text.secondary">
                  Pagamentos completos recebidos hoje
              </Typography>
              </Box>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <Card sx={{ p: 2, height: '100%', borderLeft: '4px solid #2196F3' }}>
              <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Recebimento Parcial
                </Typography>
                <Typography variant="h4" sx={{ color: '#2196F3', fontWeight: 700, my: 1 }}>
                  R$ {todayPartialPayments.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </Typography>
                <Typography variant="body2" color="text.secondary">
                  Pagamentos parciais recebidos hoje
              </Typography>
              </Box>
            </Card>
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ p: 3, boxShadow: '0 2px 10px rgba(0,0,0,0.08)' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 500 }}>
            Pedidos
          </Typography>
          <Typography 
            variant="body2" 
            sx={{
              color: 'text.secondary',
              bgcolor: 'rgba(0, 0, 0, 0.04)',
              px: 1.5,
              py: 0.5,
              borderRadius: 1,
            }}
          >
            {filteredOrders.length} pedidos
          </Typography>
        </Box>
        
        <OrdersTable orders={filteredOrders} />
      </Paper>

      {/* Tabela de resumo de status - para debug */}
      {process.env.NODE_ENV !== 'production' && (
        <Paper sx={{ p: 3, mb: 3, boxShadow: '0 2px 10px rgba(0,0,0,0.08)' }}>
          <Typography variant="h6" sx={{ mb: 2 }}>Status Summary (Debug)</Typography>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Count</TableCell>
                  <TableCell align="right">Filtered Count</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {statusCountsArray.map(({ status, count }) => {
                  // Contar quantos pedidos deste status estão na lista filtrada
                  const filteredCount = filteredOrders.filter(
                    order => order.situacaoVenda === status
                  ).length;
                  
                  return (
                    <TableRow key={status} hover>
                      <TableCell>
                        {status}
                        {selectedStatus && 
                         selectedStatus.field === 'situacaoVenda' && 
                         selectedStatus.value.toLowerCase() === status.toLowerCase() && 
                         ' (Selected)'}
                      </TableCell>
                      <TableCell align="right">{count}</TableCell>
                      <TableCell align="right">{filteredCount}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      <ImportDialog
        open={openImport}
        onClose={handleCloseImport}
        onImportSuccess={handleImportSuccess}
      />
      
      <WebhookTester
        open={openWebhook}
        onClose={handleCloseWebhook}
      />
    </Box>
  );
};

export default DashboardPage; 