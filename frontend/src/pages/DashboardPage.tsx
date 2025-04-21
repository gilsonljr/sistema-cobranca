import React, { useState, useEffect } from 'react';
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
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  SelectChangeEvent,
  Tooltip,
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
import { FilterList as FilterListIcon, Refresh as RefreshIcon, Close as CloseIcon } from '@mui/icons-material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import PeopleIcon from '@mui/icons-material/People';
import CSVImport from '../components/CSVImport';
import { Order } from '../types/Order';
import OrdersTable from '../components/OrdersTable';
import OrdersTableWithPagination from '../components/OrdersTableWithPagination';
import ImportDialog from '../components/ImportDialog';
import { StatusFilter } from '../components/Sidebar';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { ptBR } from 'date-fns/locale';
import WebhookTester from '../components/WebhookTester';
import WebhookIcon from '@mui/icons-material/Webhook';
import AuthService from '../services/AuthService';
import { useConversion } from '../contexts/ConversionContext';

const OverviewCard = ({ title, value, icon, color, subtitle = '', onClick = null, customValueStyle = {}, showProgressBar = false, progressValue = 0 }: any) => (
  <Card
    sx={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      borderRadius: '10px',
      border: '1px solid rgba(0,0,0,0.05)',
      transition: 'all 0.2s ease',
      cursor: onClick ? 'pointer' : 'default',
      '&:hover': {
        transform: onClick ? 'translateY(-3px)' : 'none',
        boxShadow: onClick ? '0 3px 8px rgba(0,0,0,0.08)' : '0 1px 3px rgba(0,0,0,0.05)',
      }
    }}
    onClick={onClick}
  >
    <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', p: 2.5 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="subtitle2" color="text.secondary" fontWeight={500}>
          {title}
        </Typography>
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 36,
          height: 36,
          borderRadius: '8px',
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
    const configs: Record<string, { color: 'primary' | 'success' | 'error'; icon: React.ReactElement }> = {
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
        borderRadius: '8px',
        '& .MuiChip-label': {
          px: 1,
          fontWeight: 500,
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
  clearAllOrders: () => void;
}

const DashboardPage: React.FC<DashboardPageProps> = ({
  orders,
  onOrdersUpdate,
  selectedStatus,
  onStatusSelect,
  clearAllOrders
}) => {
  const [openImport, setOpenImport] = useState(false);
  const [openWebhook, setOpenWebhook] = useState(false);
  const [dateFromInput, setDateFromInput] = useState<string>("");
  const [dateToInput, setDateToInput] = useState<string>("");
  const [dateFrom, setDateFrom] = useState<Date | null>(null);
  const [dateTo, setDateTo] = useState<Date | null>(null);
  const [vendedorFilter, setVendedorFilter] = useState<string>("");
  const [operadorFilter, setOperadorFilter] = useState<string>("");
  const [vendedores, setVendedores] = useState<string[]>([]);
  const [operadores, setOperadores] = useState<string[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);

  // Estado para controlar a ordenação
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');
  const [orderBy, setOrderBy] = useState<string>('dataVenda');

  // Obter informações de autenticação diretamente do AuthService
  const isAdmin = AuthService.isAdmin();
  const isSeller = AuthService.isSeller();
  const isOperator = AuthService.isCollector();
  const isSupervisor = AuthService.isSupervisor();
  const userInfo = AuthService.getUserInfo();
  const currentUserName = userInfo?.fullName || '';
  const currentUserEmail = userInfo?.email || '';

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

  const handleClearAllFilters = () => {
    handleClearDateFilter();
    setVendedorFilter("");
    setOperadorFilter("");
  };

  // Extrair vendedores e operadores únicos dos pedidos
  useEffect(() => {
    if (!orders || orders.length === 0) return;

    // Extrair vendedores únicos
    const uniqueVendedores = Array.from(new Set(
      orders
        .map(order => order.vendedor)
        .filter(vendedor => vendedor && vendedor.trim() !== '')
    )).sort();

    // Extrair operadores únicos
    const uniqueOperadores = Array.from(new Set(
      orders
        .map(order => order.operador)
        .filter(operador => operador && operador.trim() !== '')
    )).sort();

    setVendedores(uniqueVendedores);
    setOperadores(uniqueOperadores);

    console.log('Vendedores únicos:', uniqueVendedores);
    console.log('Operadores únicos:', uniqueOperadores);
  }, [orders]);

  // Aplicar filtro por status
  useEffect(() => {
    console.log("Aplicando filtros e ordenação...");

    // Começamos com todos os pedidos
    let filteredResults = [...orders];

    // 1. Filtrar por papel do usuário
    if (isSeller) {
      filteredResults = filteredResults.filter(order =>
        order.vendedor === currentUserName ||
        order.vendedor === currentUserEmail
      );
    } else if (isOperator) {
      filteredResults = filteredResults.filter(order =>
        order.operador === currentUserName ||
        order.operador === currentUserEmail
      );
    }

    // 2. Filtrar pedidos deletados
    if (!isAdmin && (!selectedStatus || selectedStatus?.value !== 'deletado')) {
      filteredResults = filteredResults.filter(order =>
        !order.situacaoVenda ||
        order.situacaoVenda.toLowerCase() !== 'deletado'
      );
    }

    // 3. Aplicar filtro de status da sidebar
    if (selectedStatus) {
      if (selectedStatus.field === 'situacaoVenda') {
        filteredResults = filteredResults.filter(order =>
          typeof order.situacaoVenda === 'string' &&
          order.situacaoVenda.toLowerCase() === selectedStatus.value.toLowerCase()
        );
      } else if (selectedStatus.field === 'special' && selectedStatus.value === 'dataRecebimento') {
        const today = getTodayDateBR();
        filteredResults = filteredResults.filter(order => order.dataRecebimento === today);
      }
    }

    // 4. Aplicar filtros de data
    if (dateFrom || dateTo) {
      filteredResults = filteredResults.filter(order => {
      try {
        const parts = order.dataVenda.split('/');
        if (parts.length !== 3) return false;

        const [day, month, year] = parts.map(Number);
        if (isNaN(day) || isNaN(month) || isNaN(year)) return false;

        const orderDate = new Date(Date.UTC(year, month - 1, day));
        if (isNaN(orderDate.getTime())) return false;

        const afterFrom = dateFrom ? orderDate >= dateFrom : true;
        const beforeTo = dateTo ? orderDate <= dateTo : true;

          return afterFrom && beforeTo;
      } catch (e) {
        console.error("Error filtering by date for order:", order.idVenda, e);
          return false;
        }
      });
    }

    // 5. Aplicar filtro de vendedor
    if (vendedorFilter) {
      filteredResults = filteredResults.filter(order =>
        order.vendedor && order.vendedor.toLowerCase().includes(vendedorFilter.toLowerCase())
      );
    }

    // 6. Aplicar filtro de operador
    if (operadorFilter) {
      filteredResults = filteredResults.filter(order =>
        order.operador && order.operador.toLowerCase().includes(operadorFilter.toLowerCase())
      );
    }

    // 7. Aplicar ordenação
    filteredResults.sort((a, b) => {
      try {
        if (orderBy === 'dataVenda') {
          const dateA = parseDate(a.dataVenda);
          const dateB = parseDate(b.dataVenda);
          return order === 'desc'
            ? dateB.getTime() - dateA.getTime() // Ordem decrescente (mais recente primeiro)
            : dateA.getTime() - dateB.getTime(); // Ordem crescente (mais antigo primeiro)
        }
        return 0;
      } catch (error) {
        console.error("Erro ao ordenar pedidos por data:", error);
        return 0;
      }
    });

    console.log(`Total de pedidos filtrados: ${filteredResults.length} de ${orders.length}`);
    setFilteredOrders(filteredResults);

  }, [
    orders,
    selectedStatus,
    isAdmin,
    isSeller,
    isOperator,
    currentUserName,
    currentUserEmail,
    dateFrom,
    dateTo,
    vendedorFilter,
    operadorFilter,
    order,
    orderBy
  ]);

  // Função para obter vendedores únicos, mostrando apenas o seu próprio para vendedores
  const getUniqueVendedores = () => {
    if (isSeller) {
      // Se for vendedor, retornar apenas o próprio nome
      return [currentUserName].filter(Boolean);
    }

    // Para admin e supervisor, mostrar todos
    return Array.from(
      new Set(
        filteredOrders
          .map((order) => order.vendedor)
          .filter((vendedor) => vendedor && vendedor.trim() !== '')
      )
    );
  };

  // Função para obter operadores únicos, mostrando apenas o seu próprio para operadores
  const getUniqueOperadores = () => {
    if (isOperator) {
      // Se for operador, retornar apenas o próprio nome
      return [currentUserName].filter(Boolean);
    }

    // Para admin e supervisor, mostrar todos
    return Array.from(
      new Set(
        filteredOrders
          .map((order) => order.operador)
          .filter((operador) => operador && operador.trim() !== '')
      )
    );
  };

  // Filtrar pedidos com base no papel do usuário
  const filteredByUserRole = filteredOrders.filter(order => {
    // Admins podem ver todos os pedidos
    if (isAdmin) {
      return true;
    }

    // Vendedores só podem ver seus próprios pedidos
    if (isSeller && userInfo?.fullName) {
      // Uso de comparação mais flexível (verificando se o nome do usuário está contido no vendedor ou vice-versa)
      const userNameLower = userInfo.fullName.toLowerCase();
      const vendedorLower = order.vendedor?.toLowerCase() || '';

      return vendedorLower.includes(userNameLower) || userNameLower.includes(vendedorLower);
    }

    // Operadores só podem ver pedidos atribuídos a eles
    if (isOperator && userInfo?.fullName) {
      // Uso de comparação mais flexível (verificando se o nome do usuário está contido no operador ou vice-versa)
      const userNameLower = userInfo.fullName.toLowerCase();
      const operadorLower = order.operador?.toLowerCase() || '';

      return operadorLower.includes(userNameLower) || userNameLower.includes(operadorLower);
    }

    // Para outros usuários, mostrar todos os pedidos não deletados
    return true;
  });

  // Filtrar pedidos deletados (só mostrar para administradores ou quando explicitamente filtrado)
  const finalFilteredOrders = filteredByUserRole.filter(order => {
    // Se o usuário não é admin, ocultar pedidos deletados
    // EXCETO se o status selecionado for explicitamente "deletado"
    const isDeletedOrder = order.situacaoVenda?.toLowerCase() === 'deletado';
    const isExplicitlyFilteringDeleted = selectedStatus?.field === 'situacaoVenda' &&
                                         selectedStatus?.value?.toLowerCase() === 'deletado';

    if (isDeletedOrder && !isAdmin && !isExplicitlyFilteringDeleted) {
      return false;
    }

    return true;
  });

  // Função auxiliar para converter data BR (DD/MM/YYYY) para objeto Date
  const parseDate = (dateStr: string): Date => {
    if (!dateStr) return new Date(0); // Data mínima para valores vazios

    try {
      const parts = dateStr.split('/');
      // Se não tiver formato DD/MM/YYYY, retornar como string
      if (parts.length !== 3) return new Date(dateStr);

      const [day, month, year] = parts.map(Number);
      return new Date(year, month - 1, day);
    } catch (e) {
      console.error("Error parsing date:", dateStr, e);
      return new Date(0);
    }
  };

  // Get conversion settings
  const { conversionSettings, applyConversion } = useConversion();

  // Calculate metrics from orders
  const rawTotalSales = filteredOrders.reduce((sum, order) => sum + order.valorVenda, 0);

  // For completed sales with empty valor recebido, use the valor venda as the valor recebido
  const rawTotalReceived = filteredOrders.reduce((sum, order) => {
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

  const rawCompletedOrders = filteredOrders.filter(o =>
    typeof o.situacaoVenda === 'string' &&
    o.situacaoVenda.toLowerCase() === 'completo'
  ).length;

  // Apply conversion rates if enabled, otherwise use the calculated values
  const totalSales = conversionSettings.enabled ? rawTotalSales : rawTotalSales;

  // For received value, use either the converted value or the calculated value
  const totalReceived = conversionSettings.enabled
    ? applyConversion(totalSales, 'revenueConversion') // When enabled, received value is a percentage of total sales
    : rawTotalReceived; // When disabled, use the calculated value

  const completedOrders = rawCompletedOrders; // Keep the actual count of completed orders
  const filteredOrdersCount = filteredOrders.length; // Keep the actual count of filtered orders

  // Calculate the actual conversion rate based on completed orders
  const actualConversionRate = Math.round((rawCompletedOrders / Math.max(filteredOrdersCount, 1)) * 100);

  // For conversion rate, use either the setting value or the calculated conversion rate
  const conversionRate = conversionSettings.enabled
    ? conversionSettings.revenueConversion
    : actualConversionRate;

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
    .reduce((sum, order) => {
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

  const todayPartialPayments = filteredOrders
    .filter(order => order.dataPagamentoParcial === todayDate)
    .reduce((sum, order) => sum + order.pagamentoParcial, 0);

  // Função para atualizar um pedido na lista
  const handleOrderUpdate = (updatedOrder: Order) => {
    const updatedOrders = filteredOrders.map(order =>
      order.idVenda === updatedOrder.idVenda ? updatedOrder : order
    );
    onOrdersUpdate(updatedOrders);
  };

  // Preparar dados para a tabela de resumo
  const statusCounts = filteredOrders.reduce((acc: Record<string, number>, order) => {
    const status = order.situacaoVenda || 'Desconhecido';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});

  // Converter para array para exibir
  const statusCountsArray = Object.entries(statusCounts)
    .map(([status, count]) => ({ status, count }))
    .sort((a, b) => b.count - a.count);

  return (
    <Box sx={{ py: 3, px: 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h5" fontWeight={600}>
          Dashboard
        </Typography>
          <Typography variant="body2" color="text.secondary">
            Visão geral de todos os pedidos e desempenho
          </Typography>
        </Box>

        <Paper elevation={0} sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 2,
          p: 0,
          mb: 3,
          borderRadius: '10px',
          overflow: 'hidden',
        }}>
          {/* Filtros em Cards Separados */}

          {/* Card de Filtro por Data */}
          <Paper
            elevation={0}
            sx={{
              p: 2,
              flex: '1 1 300px',
              borderRadius: '10px',
              border: '1px solid rgba(0, 0, 0, 0.05)',
              boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
              display: 'flex',
              flexDirection: 'column',
              gap: 2
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <CalendarTodayIcon fontSize="small" color="primary" />
              <Typography variant="subtitle2" fontWeight={600}>Período</Typography>
            </Box>

            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <DatePicker
                  label="Data Inicial"
                  value={dateFromInput ? new Date(dateFromInput) : null}
                  onChange={(newValue) => setDateFromInput(newValue ? newValue.toISOString().split('T')[0] : '')}
                  format="dd/MM/yyyy"
                  slotProps={{
                    textField: {
                      size: "small",
                      fullWidth: true,
                      sx: { bgcolor: 'white' }
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
                      fullWidth: true,
                      sx: { bgcolor: 'white' }
                    }
                  }}
                />
              </Box>
            </LocalizationProvider>
          </Paper>

          {/* Card de Filtro por Vendedor */}
          <Paper
            elevation={0}
            sx={{
              p: 2,
              flex: '1 1 200px',
              borderRadius: '10px',
              border: '1px solid rgba(0, 0, 0, 0.05)',
              boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
              display: 'flex',
              flexDirection: 'column',
              gap: 2
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <PersonAddIcon fontSize="small" color="success" />
              <Typography variant="subtitle2" fontWeight={600}>Vendedor</Typography>
            </Box>

            <FormControl fullWidth size="small" sx={{ bgcolor: 'white', borderRadius: '8px' }}>
              <Select
                value={vendedorFilter}
                onChange={(e: SelectChangeEvent) => setVendedorFilter(e.target.value)}
                displayEmpty
                sx={{ borderRadius: '8px' }}
                renderValue={(selected) => {
                  if (selected === "") {
                    return <span style={{ color: 'rgba(0, 0, 0, 0.6)' }}>Todos os vendedores</span>;
                  }
                  return selected;
                }}
                endAdornment={vendedorFilter ? (
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      setVendedorFilter('');
                    }}
                    sx={{ mr: 0.5 }}
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                ) : null}
              >
                <MenuItem value="">
                  <em>Todos os vendedores</em>
                </MenuItem>
                {getUniqueVendedores().map((vendedor) => (
                  <MenuItem key={vendedor} value={vendedor}>
                    {vendedor}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Paper>

          {/* Card de Filtro por Operador */}
          <Paper
            elevation={0}
            sx={{
              p: 2,
              flex: '1 1 200px',
              borderRadius: '10px',
              border: '1px solid rgba(0, 0, 0, 0.05)',
              boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
              display: 'flex',
              flexDirection: 'column',
              gap: 2
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <PeopleIcon fontSize="small" color="info" />
              <Typography variant="subtitle2" fontWeight={600}>Operador</Typography>
            </Box>

            <FormControl fullWidth size="small" sx={{ bgcolor: 'white', borderRadius: '8px' }}>
              <Select
                value={operadorFilter}
                onChange={(e: SelectChangeEvent) => setOperadorFilter(e.target.value)}
                displayEmpty
                sx={{ borderRadius: '8px' }}
                renderValue={(selected) => {
                  if (selected === "") {
                    return <span style={{ color: 'rgba(0, 0, 0, 0.6)' }}>Todos os operadores</span>;
                  }
                  return selected;
                }}
                endAdornment={operadorFilter ? (
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      setOperadorFilter('');
                    }}
                    sx={{ mr: 0.5 }}
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                ) : null}
              >
                <MenuItem value="">
                  <em>Todos os operadores</em>
                </MenuItem>
                {getUniqueOperadores().map((operador) => (
                  <MenuItem key={operador} value={operador}>
                    {operador}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Paper>

          {/* Card de Ações */}
          <Paper
            elevation={0}
            sx={{
              p: 2,
              flex: '0 1 auto',
              borderRadius: '10px',
              border: '1px solid rgba(0, 0, 0, 0.05)',
              boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <FilterListIcon fontSize="small" color="primary" />
              <Typography variant="subtitle2" fontWeight={600}>Ações</Typography>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 'auto' }}>
              <Button
                variant="contained"
                size="small"
                startIcon={<RefreshIcon />}
                onClick={handleApplyDateFilter}
                sx={{ borderRadius: '8px' }}
              >
                Aplicar
              </Button>
              <Button
                variant="outlined"
                size="small"
                onClick={handleClearAllFilters}
                sx={{ borderRadius: '8px' }}
              >
                Limpar
              </Button>
            </Box>
          </Paper>
        </Paper>


      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 500 }}>Visão Geral</Typography>
        {conversionSettings.enabled && (
          <Tooltip title="Os valores exibidos estão ajustados de acordo com as configurações de conversão">
            <Chip
              label="Conversão Ativada"
              color="primary"
              variant="outlined"
              size="small"
              sx={{ fontWeight: 'bold' }}
            />
          </Tooltip>
        )}
      </Box>

      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <OverviewCard
            title="Total de Vendas"
            value={filteredOrdersCount}
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
            subtitle={conversionSettings.enabled && conversionSettings.revenueConversion !== 100
              ? `Conversão: ${conversionSettings.revenueConversion}%`
              : `R$ ${(totalSales / Math.max(filteredOrdersCount, 1)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} por pedido`
            }
            icon={<AttachMoneyIcon />}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <OverviewCard
            title="Valor Recebido"
            value={`R$ ${totalReceived.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
            subtitle={conversionSettings.enabled && conversionSettings.revenueConversion !== 100
              ? `Conversão: ${conversionSettings.revenueConversion}%`
              : `${Math.round((totalReceived / totalSales) * 100)}% do total de vendas`
            }
            icon={<AttachMoneyIcon />}
            color="info"
            customValueStyle={{ color: '#4CAF50', fontWeight: 700 }}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <OverviewCard
            title="Taxa de Conversão"
            value={`${conversionRate}%`}
            subtitle={conversionSettings.enabled && conversionSettings.salesConversion !== 100
              ? `Conversão: ${conversionSettings.salesConversion}%`
              : `${completedOrders} pedidos completos`
            }
            icon={<TrendingUpIcon />}
            color="warning"
            showProgressBar={true}
            progressValue={conversionRate}
          />
        </Grid>
      </Grid>

      {/* Nova seção: Recebimentos Hoje */}
      <Paper sx={{ p: 2.5, mb: 4, borderRadius: '10px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid rgba(0,0,0,0.05)' }}>
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
              borderRadius: '8px',
              bgcolor: 'rgba(0, 0, 0, 0.03)',
              fontWeight: 500,
            }}
          >
            {todayDate}
          </Typography>
        </Box>

        <Grid container spacing={2.5}>
          <Grid item xs={12} sm={6}>
            <Card sx={{ p: 2, height: '100%', borderRadius: '10px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid rgba(0,0,0,0.05)', borderLeft: '3px solid #4CAF50' }}>
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
            <Card sx={{ p: 2, height: '100%', borderRadius: '10px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid rgba(0,0,0,0.05)', borderLeft: '3px solid #2196F3' }}>
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

      <Paper sx={{ p: 2.5, boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid rgba(0,0,0,0.05)', borderRadius: '10px' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 500 }}>
            Pedidos
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            {vendedorFilter && (
              <Chip
                label={`Vendedor: ${vendedorFilter}`}
                size="small"
                color="primary"
                onDelete={() => setVendedorFilter('')}
                sx={{ borderRadius: '8px' }}
              />
            )}
            {operadorFilter && (
              <Chip
                label={`Operador: ${operadorFilter}`}
                size="small"
                color="info"
                onDelete={() => setOperadorFilter('')}
                sx={{ borderRadius: '8px' }}
              />
            )}
            <Typography
              variant="body2"
              sx={{
                color: 'text.secondary',
                bgcolor: 'rgba(0, 0, 0, 0.03)',
                px: 1.5,
                py: 0.5,
                borderRadius: '8px',
                fontWeight: 500,
              }}
            >
              {conversionSettings.enabled ? filteredOrdersCount : filteredOrders.length} pedidos
              {conversionSettings.enabled && conversionSettings.salesConversion !== 100 && (
                <Typography component="span" variant="caption" sx={{ ml: 1, color: 'primary.main' }}>
                  (Conversão: {conversionSettings.salesConversion}%)
                </Typography>
              )}
            </Typography>
          </Box>
        </Box>

        <OrdersTableWithPagination orders={filteredOrders} onOrderUpdate={handleOrderUpdate} />
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