import React, { useEffect, useState, useCallback } from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Typography,
  Box,
  Chip,
  Divider,
  Collapse,
} from '@mui/material';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import PaidOutlinedIcon from '@mui/icons-material/PaidOutlined';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import HourglassEmptyOutlinedIcon from '@mui/icons-material/HourglassEmptyOutlined';
import ErrorOutlineOutlinedIcon from '@mui/icons-material/ErrorOutlineOutlined';
import ReplayOutlinedIcon from '@mui/icons-material/ReplayOutlined';
import HandshakeOutlinedIcon from '@mui/icons-material/HandshakeOutlined';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import ThumbUpAltOutlinedIcon from '@mui/icons-material/ThumbUpAltOutlined';
import KeyboardReturnOutlinedIcon from '@mui/icons-material/KeyboardReturnOutlined';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import HomeIcon from '@mui/icons-material/Home';
import CodeIcon from '@mui/icons-material/Code';
import AssessmentIcon from '@mui/icons-material/Assessment';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import CategoryIcon from '@mui/icons-material/Category';
import UnifiedAuthService from '../services/UnifiedAuthService';
import { Order } from '../types/Order';
import DeleteIcon from '@mui/icons-material/Delete';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import StorefrontIcon from '@mui/icons-material/Storefront';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import FacebookIcon from '@mui/icons-material/Facebook';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import ReceiptIcon from '@mui/icons-material/Receipt';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import ScienceIcon from '@mui/icons-material/Science';
import InventoryIcon from '@mui/icons-material/Inventory';
import FactoryIcon from '@mui/icons-material/Factory';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import AddIcon from '@mui/icons-material/Add';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';


export interface StatusFilter {
  field: string;
  value: string;
}

interface SidebarProps {
  orders: Order[];
  onStatusSelect: (filter: StatusFilter | null) => void;
  selectedStatus: StatusFilter | null;
}

const Sidebar: React.FC<SidebarProps> = ({ orders, onStatusSelect, selectedStatus }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isSeller, setIsSeller] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSupervisor, setIsSupervisor] = useState(false);
  const [isOperator, setIsOperator] = useState(false);
  const [currentUserEmail, setCurrentUserEmail] = useState('');
  const [currentUserName, setCurrentUserName] = useState('');

  // State for menu expansions
  const [operacaoOpen, setOperacaoOpen] = useState(false);
  const [financeiroOpen, setFinanceiroOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const [nutraOpen, setNutraOpen] = useState(false);

  // State to force re-render when an order status is updated
  const [statusUpdateTrigger, setStatusUpdateTrigger] = useState(0);

  // Verificar o papel do usuário e obter informações adicionais
  useEffect(() => {
    // Obter informações do usuário logado
    const userInfo = UnifiedAuthService.getUserInfo();
    if (userInfo) {
      // Definir papéis com base no papel do usuário
      setIsSeller(userInfo.role === 'seller');
      setIsAdmin(userInfo.role === 'admin');
      setIsSupervisor(userInfo.role === 'supervisor');
      setIsOperator(userInfo.role === 'collector');

      // Definir informações do usuário
      setCurrentUserEmail(userInfo.email);
      setCurrentUserName(userInfo.fullName);
      console.log("Current user:", userInfo.fullName, userInfo.role);
    }

    // Listen for order status updates
    const handleOrderStatusUpdate = (event: CustomEvent) => {
      console.log('Received order status update:', event.detail);
      // Force a re-render of the sidebar
      setStatusUpdateTrigger(prev => prev + 1);
    };

    window.addEventListener('order-status-updated', handleOrderStatusUpdate as EventListener);

    return () => {
      window.removeEventListener('order-status-updated', handleOrderStatusUpdate as EventListener);
    };
  }, []);

  // Função para filtrar pedidos baseado no papel do usuário
  const filterOrdersByUserRole = (ordersToFilter: Order[]): Order[] => {
    // Se for admin ou supervisor, mostrar todos os pedidos
    if (isAdmin || isSupervisor) {
      return ordersToFilter;
    }

    // Se for vendedor, mostrar apenas pedidos do próprio vendedor
    if (isSeller) {
      return ordersToFilter.filter(order => {
        // Verificar se o vendedor está definido
        if (!order.vendedor) return false;

        // Comparar ignorando case e espaços extras
        const vendedorNormalizado = order.vendedor.toLowerCase().trim();
        const userNameNormalizado = currentUserName ? currentUserName.toLowerCase().trim() : '';
        const userEmailNormalizado = currentUserEmail ? currentUserEmail.toLowerCase().trim() : '';

        // Verificar se o nome do vendedor contém o nome do usuário ou vice-versa
        return vendedorNormalizado.includes(userNameNormalizado) ||
               userNameNormalizado.includes(vendedorNormalizado) ||
               vendedorNormalizado.includes(userEmailNormalizado) ||
               userEmailNormalizado.includes(vendedorNormalizado);
      });
    }

    // Se for operador, mostrar apenas pedidos atribuídos a este operador
    if (isOperator) {
      return ordersToFilter.filter(order => {
        if (!order.operador) return false;

        const operadorNormalizado = order.operador.toLowerCase().trim();
        const userNameNormalizado = currentUserName ? currentUserName.toLowerCase().trim() : '';
        const userEmailNormalizado = currentUserEmail ? currentUserEmail.toLowerCase().trim() : '';

        return operadorNormalizado.includes(userNameNormalizado) ||
               userNameNormalizado.includes(operadorNormalizado) ||
               operadorNormalizado.includes(userEmailNormalizado) ||
               userEmailNormalizado.includes(operadorNormalizado);
      });
    }

    // Caso padrão, retornar todos os pedidos
    return ordersToFilter;
  }

  // Filtrar pedidos baseado no papel do usuário antes de contar
  const filteredOrdersByRole = filterOrdersByUserRole(orders);

  // Update the statusItems and adminStatusItems arrays when statusUpdateTrigger changes
  // so they reflect the current counts
  const getStatusCount = useCallback((status: string): number => {
    const count = filteredOrdersByRole.filter(order =>
      typeof order.situacaoVenda === 'string' &&
      order.situacaoVenda.toLowerCase() === status.toLowerCase()
    ).length;

    // Debug log for status counts
    if (status.toLowerCase() === 'liberação') {
      console.log(`Debug - Liberação status count: ${count}`);
      console.log(`Orders with Liberação:`,
        filteredOrdersByRole.filter(order =>
          typeof order.situacaoVenda === 'string' &&
          order.situacaoVenda.toLowerCase() === 'liberação'
        )
      );
    }

    return count;
  }, [filteredOrdersByRole]);

  const getTotalOrders = useCallback(() => {
    return filteredOrdersByRole.filter(order =>
      !!order.idVenda &&
      (!order.situacaoVenda || order.situacaoVenda.toLowerCase() !== 'deletado')
    ).length;
  }, [filteredOrdersByRole]);

  // Todos os métodos abaixo excluem pedidos com status "Deletado" para garantir
  // que esses pedidos não interfiram em nenhum relatório ou contagem total
  // conforme requisito do cliente.

  const getPendingPayments = useCallback(() => {
    return filteredOrdersByRole.filter(order =>
      typeof order.situacaoVenda === 'string' &&
      order.situacaoVenda.toLowerCase() === 'pagamento pendente'
    ).length;
  }, [filteredOrdersByRole]);

  const getCompletedOrders = useCallback(() => {
    return filteredOrdersByRole.filter(order =>
      typeof order.situacaoVenda === 'string' &&
      order.situacaoVenda.toLowerCase() === 'completo'
    ).length;
  }, [filteredOrdersByRole]);

  const getCanceledOrders = useCallback(() => {
    return filteredOrdersByRole.filter(order =>
      typeof order.situacaoVenda === 'string' &&
      order.situacaoVenda.toLowerCase() === 'cancelado'
    ).length;
  }, [filteredOrdersByRole]);

  const getDeletedOrders = useCallback(() => {
    return filteredOrdersByRole.filter(order =>
      typeof order.situacaoVenda === 'string' &&
      order.situacaoVenda.toLowerCase() === 'deletado'
    ).length;
  }, [filteredOrdersByRole]);

  const getReceiveToday = useCallback(() => {
    const today = new Date().toLocaleDateString('pt-BR');
    return filteredOrdersByRole.filter(order => order.dataRecebimento === today).length;
  }, [filteredOrdersByRole]);

  const statusItems = [
    { text: 'Todos os Pedidos', icon: <ArticleOutlinedIcon />, count: getTotalOrders(), filter: null },
    { text: 'Pagamento Pendente', icon: <PaidOutlinedIcon sx={{ color: '#F5A623' }} />, count: getPendingPayments(), filter: { field: 'situacaoVenda', value: 'pagamento pendente' } },
    { text: 'Completo', icon: <CheckCircleOutlinedIcon sx={{ color: '#4CAF50' }} />, count: getCompletedOrders(), filter: { field: 'situacaoVenda', value: 'completo' } },
    { text: 'Cancelado', icon: <CancelOutlinedIcon sx={{ color: '#F44336' }} />, count: getCanceledOrders(), filter: { field: 'situacaoVenda', value: 'cancelado' } },
    { text: 'Em Separação', icon: <HourglassEmptyOutlinedIcon sx={{ color: '#2196F3' }} />, count: getStatusCount('Em Separação'), filter: { field: 'situacaoVenda', value: 'em separação' } },
    { text: 'Frustrado', icon: <ErrorOutlineOutlinedIcon sx={{ color: '#F44336' }} />, count: getStatusCount('Frustrado'), filter: { field: 'situacaoVenda', value: 'frustrado' } },
    { text: 'Recuperação', icon: <ReplayOutlinedIcon sx={{ color: '#673AB7' }} />, count: getStatusCount('Recuperação'), filter: { field: 'situacaoVenda', value: 'recuperação' } },
    { text: 'Negociação', icon: <HandshakeOutlinedIcon sx={{ color: '#3F51B5' }} />, count: getStatusCount('Negociação'), filter: { field: 'situacaoVenda', value: 'negociação' } },
    { text: 'Retirar Correios', icon: <LocalShippingOutlinedIcon sx={{ color: '#F5A623' }} />, count: getStatusCount('Retirar Correios'), filter: { field: 'situacaoVenda', value: 'retirar correios' } },
    { text: 'Entrega Falha', icon: <WarningAmberOutlinedIcon sx={{ color: '#F44336' }} />, count: getStatusCount('Entrega Falha'), filter: { field: 'situacaoVenda', value: 'entrega falha' } },
    { text: 'Confirmar Entrega', icon: <ThumbUpAltOutlinedIcon sx={{ color: '#4CAF50' }} />, count: getStatusCount('Confirmar Entrega'), filter: { field: 'situacaoVenda', value: 'confirmar entrega' } },
    { text: 'Devolvido Correios', icon: <KeyboardReturnOutlinedIcon sx={{ color: '#F44336' }} />, count: getStatusCount('Devolvido Correios'), filter: { field: 'situacaoVenda', value: 'devolvido correios' } },
    { text: 'Liberação', icon: <AccessTimeOutlinedIcon sx={{ color: '#2196F3' }} />, count: getStatusCount('liberação'), filter: { field: 'situacaoVenda', value: 'liberação' } },
    { text: 'Receber Hoje', icon: <CalendarTodayOutlinedIcon sx={{ color: '#2196F3' }} />, count: getReceiveToday(), filter: { field: 'special', value: 'dataRecebimento' } },
    { text: 'Possíveis Duplicados', icon: <ContentCopyOutlinedIcon sx={{ color: '#FF9800' }} />, count: getStatusCount('Possíveis Duplicados'), filter: { field: 'situacaoVenda', value: 'possíveis duplicados' } },
  ];

  // Item adicional apenas para administradores
  const adminStatusItems = [
    { text: 'Deletado', icon: <DeleteIcon sx={{ color: '#F44336' }} />, count: getDeletedOrders(), filter: { field: 'situacaoVenda', value: 'deletado' } },
  ];

  // Helper function to compare filters
  const isFilterEqual = (a: StatusFilter | null, b: StatusFilter | null) => {
    if (a === null && b === null) return true;
    if (a === null || b === null) return false;
    const isEqual = a.field === b.field && a.value === b.value;
    return isEqual;
  };

  // Função que combina a seleção do filtro com navegação para a dashboard
  const handleStatusClick = (filter: StatusFilter | null) => {
    console.log("Selecionando filtro:", filter);

    // Se for um filtro de status, mostrar estatísticas de contagem
    if (filter && filter.field === 'situacaoVenda') {
      const count = filteredOrdersByRole.filter(order =>
        typeof order.situacaoVenda === 'string' &&
        order.situacaoVenda.toLowerCase() === filter.value.toLowerCase()
      ).length;

      console.log(`Contagem para ${filter.value}: ${count}`);
    }

    // Atualizar o filtro selecionado (mesmo se count for 0)
    onStatusSelect(filter);

    // Forçar atualização se estivermos na dashboard (vai atualizar a lista sem navegar)
    const event = new CustomEvent('update-dashboard-filter', { detail: filter });
    window.dispatchEvent(event);

    // Se não estiver na dashboard, navegar para lá
    if (location.pathname !== '/') {
      console.log(`Navegando para dashboard com filtro: ${filter?.value}`);
      navigate('/');
    } else {
      console.log('Já estamos na dashboard, apenas atualizando o filtro');
    }
  };

  // Toggle menu handlers
  const handleOperacaoClick = () => {
    setOperacaoOpen(!operacaoOpen);
  };

  const handleFinanceiroClick = () => {
    setFinanceiroOpen(!financeiroOpen);
  };

  const handleAdminClick = () => {
    setAdminOpen(!adminOpen);
  };

  const handleNutraClick = () => {
    setNutraOpen(!nutraOpen);
  };

  // Handler para abrir o diálogo de criação de pedido
  const handleOpenNewOrderDialog = () => {
    if (location.pathname === '/vendedor') {
      // If already on the vendedor page, dispatch a custom event
      window.dispatchEvent(new CustomEvent('open-new-order-dialog'));
    } else {
      // Otherwise navigate to the vendedor page with state
      navigate('/vendedor', { state: { openNewOrderDialog: true } });
    }
  };

  // Common styles for list items
  const listItemStyle = {
    borderRadius: '8px',
    mb: 0.5,
    '&.Mui-selected': {
      bgcolor: 'rgba(33, 150, 243, 0.05)',
      '&:hover': {
        bgcolor: 'rgba(33, 150, 243, 0.08)'
      }
    },
    '&:hover': {
      bgcolor: 'rgba(0, 0, 0, 0.02)'
    }
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: 240,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: {
          width: 240,
          boxSizing: 'border-box',
          pt: 8,
          border: 'none',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
          bgcolor: '#FAFBFC'
        },
      }}
    >
      <List sx={{ pt: 2, px: 1.5 }}>
        {/* Admin Section - Only visible to admins */}
        {isAdmin && (
          <>
            <ListItemButton onClick={handleAdminClick}>
              <ListItemIcon>
                <AdminPanelSettingsIcon sx={{ color: '#673AB7' }} />
              </ListItemIcon>
              <ListItemText primary="Administração" />
              {adminOpen ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>
            <Collapse in={adminOpen} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                <ListItemButton
                  component={Link}
                  to="/admin"
                  selected={location.pathname === '/admin'}
                  sx={listItemStyle}
                >
                  <ListItemIcon>
                    <DashboardIcon sx={{ color: '#673AB7' }} />
                  </ListItemIcon>
                  <ListItemText primary="Home Dashboard" />
                </ListItemButton>

                <ListItemButton
                  component={Link}
                  to="/users"
                  selected={location.pathname === '/users'}
                  sx={listItemStyle}
                >
                  <ListItemIcon>
                    <AdminPanelSettingsIcon sx={{ color: '#3f51b5' }} />
                  </ListItemIcon>
                  <ListItemText primary="Usuários" />
                </ListItemButton>

                <ListItemButton
                  component={Link}
                  to="/products"
                  selected={location.pathname === '/products'}
                  sx={listItemStyle}
                >
                  <ListItemIcon>
                    <CategoryIcon sx={{ color: '#9C27B0' }} />
                  </ListItemIcon>
                  <ListItemText primary="Produtos e Ofertas" />
                </ListItemButton>

                <ListItemButton
                  component={Link}
                  to="/zap-config"
                  selected={location.pathname === '/zap-config'}
                  sx={listItemStyle}
                >
                  <ListItemIcon>
                    <WhatsAppIcon sx={{ color: '#25D366' }} />
                  </ListItemIcon>
                  <ListItemText primary="Config. WhatsApp" />
                </ListItemButton>
              </List>
            </Collapse>
            <Divider />
          </>
        )}

        {/* Links diretos para vendedores - Sem dropdown */}
        <>
          <ListItem
            button
            component={Link}
            to="/"
            selected={location.pathname === '/'}
            sx={listItemStyle}
          >
            <ListItemIcon>
              <DashboardIcon sx={{ color: '#03A9F4' }} />
            </ListItemIcon>
            <ListItemText primary="Dashboard" />
          </ListItem>

          {isSeller && (
            <>
              <ListItem
                button
                component={Link}
                to="/vendedor"
                selected={location.pathname === '/vendedor'}
                sx={listItemStyle}
              >
                <ListItemIcon>
                  <ShoppingCartIcon sx={{ color: '#F44336' }} />
                </ListItemIcon>
                <ListItemText primary="Meus Pedidos" />
              </ListItem>

              <ListItem
                button
                onClick={handleOpenNewOrderDialog}
                sx={listItemStyle}
              >
                <ListItemIcon>
                  <AddIcon sx={{ color: '#4CAF50' }} />
                </ListItemIcon>
                <ListItemText primary="Criar Pedido" />
              </ListItem>
            </>
          )}

          {/* Ranking removido da barra lateral e movido para a barra superior */}

          <Divider sx={{ my: 1 }} />
        </>

        {/* Financeiro Section */}
        {(isAdmin || isSupervisor) && (
          <>
            <ListItem button onClick={handleFinanceiroClick} sx={listItemStyle}>
              <ListItemIcon>
                <MonetizationOnIcon sx={{ color: '#4CAF50' }} />
              </ListItemIcon>
              <ListItemText primary="Financeiro" />
              {financeiroOpen ? <ExpandLess /> : <ExpandMore />}
            </ListItem>

            <Collapse in={financeiroOpen} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                <ListItem
                  button
                  component={Link}
                  to="/financeiro/facebook"
                  selected={location.pathname === '/financeiro/facebook'}
                  sx={{ ...listItemStyle, pl: 4 }}
                >
                  <ListItemIcon>
                    <FacebookIcon sx={{ color: '#1877F2' }} />
                  </ListItemIcon>
                  <ListItemText primary="Facebook" />
                </ListItem>

                <ListItem
                  button
                  component={Link}
                  to="/financeiro/whatsapp"
                  selected={location.pathname === '/financeiro/whatsapp'}
                  sx={{ ...listItemStyle, pl: 4 }}
                >
                  <ListItemIcon>
                    <WhatsAppIcon sx={{ color: '#25D366' }} />
                  </ListItemIcon>
                  <ListItemText primary="WhatsApp" />
                </ListItem>

                <ListItem
                  button
                  component={Link}
                  to="/financeiro/vendas"
                  selected={location.pathname === '/financeiro/vendas'}
                  sx={{ ...listItemStyle, pl: 4 }}
                >
                  <ListItemIcon>
                    <ReceiptIcon sx={{ color: '#FF5722' }} />
                  </ListItemIcon>
                  <ListItemText primary="Vendas" />
                </ListItem>
              </List>
            </Collapse>
          </>
        )}

        {/* Mostrar link para pedidos duplicados apenas para admin e supervisor */}
        {(isAdmin || isSupervisor) && (
          <>
            <ListItem button component={Link} to="/approval" selected={location.pathname === '/approval'} sx={listItemStyle}>
              <ListItemIcon>
                <ThumbUpAltOutlinedIcon sx={{ color: '#4CAF50' }} />
              </ListItemIcon>
              <ListItemText primary="Aprovar Pedidos" />
            </ListItem>

            <ListItem button component={Link} to="/tracking-management" selected={location.pathname === '/tracking-management'} sx={listItemStyle}>
              <ListItemIcon>
                <LocalShippingOutlinedIcon sx={{ color: '#2196F3' }} />
              </ListItemIcon>
              <ListItemText primary="Gerenciar Rastreio" />
            </ListItem>

            <ListItem button component={Link} to="/duplicates" selected={location.pathname === '/duplicates'} sx={listItemStyle}>
              <ListItemIcon>
                <ContentCopyIcon sx={{ color: '#FF9800' }} />
              </ListItemIcon>
              <ListItemText primary="Pedidos Duplicados" />
            </ListItem>



            {/* Nutra Logistics Section */}
            <ListItem button onClick={handleNutraClick} sx={listItemStyle}>
              <ListItemIcon>
                <ScienceIcon sx={{ color: '#E91E63' }} />
              </ListItemIcon>
              <ListItemText primary="ZenCaps" />
              {nutraOpen ? <ExpandLess /> : <ExpandMore />}
            </ListItem>

            <Collapse in={nutraOpen} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                <ListItem
                  button
                  component={Link}
                  to="/nutra"
                  selected={location.pathname === '/nutra'}
                  sx={{ ...listItemStyle, pl: 4 }}
                >
                  <ListItemIcon>
                    <DashboardIcon sx={{ color: '#E91E63' }} />
                  </ListItemIcon>
                  <ListItemText primary="Dashboard" />
                </ListItem>

                <ListItem
                  button
                  component={Link}
                  to="/nutra/products"
                  selected={location.pathname === '/nutra/products'}
                  sx={{ ...listItemStyle, pl: 4 }}
                >
                  <ListItemIcon>
                    <InventoryIcon sx={{ color: '#E91E63' }} />
                  </ListItemIcon>
                  <ListItemText primary="Produtos" />
                </ListItem>
              </List>
            </Collapse>
          </>
        )}

        {/* Basic Reports Links - modified to show only Advanced Reports */}
        <>
          {/* Relatórios Avançados removido conforme solicitado */}
        </>
      </List>

      <Divider sx={{ my: 2 }} />

      <Box sx={{ overflowY: 'auto', flexGrow: 1, pl: 1.5, pr: 1.5, pb: 1.5 }}>
        <Box sx={{ mt: 2, mb: 1 }}>
          <Typography
            variant="subtitle2"
            sx={{
              pl: 2,
              pb: 1.5,
              textTransform: 'uppercase',
              fontWeight: 700,
              fontSize: '0.75rem',
              letterSpacing: '0.05em',
              color: '#64748B',
            }}
          >
            Filtros de Status
          </Typography>
          <List
            sx={{
              p: 0,
              '& .MuiListItem-root': {
                borderRadius: '8px',
                mb: 0.5,
                '&.Mui-selected': {
                  bgcolor: 'rgba(33, 150, 243, 0.1)',
                  '&:hover': {
                    bgcolor: 'rgba(33, 150, 243, 0.12)'
                  }
                },
                '&:hover': {
                  bgcolor: 'rgba(0, 0, 0, 0.02)'
                }
              },
            }}
          >
            {statusItems.map((item, index) => (
              <ListItem
                button
                key={index}
                selected={!!(selectedStatus && isFilterEqual(selectedStatus, item.filter))}
                onClick={() => handleStatusClick(item.filter)}
                sx={{ py: 1 }}
              >
                <ListItemIcon sx={{ minWidth: 45 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: 500 }}
                />
                <Chip
                  label={item.count}
                  size="small"
                  sx={{
                    height: 20,
                    fontSize: '0.70rem',
                    bgcolor: 'rgba(0, 0, 0, 0.04)',
                    color: '#64748B',
                    fontWeight: 600,
                  }}
                />
              </ListItem>
            ))}

            {/* Item adicional apenas para administradores */}
            {isAdmin && adminStatusItems.map((item, index) => (
              <ListItem
                button
                key={`admin-${index}`}
                selected={!!(selectedStatus && isFilterEqual(selectedStatus, item.filter))}
                onClick={() => handleStatusClick(item.filter)}
                sx={{
                  py: 1,
                  mt: 1,
                  borderTop: '1px dashed rgba(0, 0, 0, 0.12)',
                  borderTopLeftRadius: 0,
                  borderTopRightRadius: 0
                }}
              >
                <ListItemIcon sx={{ minWidth: 45 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: '#D32F2F'
                  }}
                />
                <Chip
                  label={item.count}
                  size="small"
                  sx={{
                    height: 20,
                    fontSize: '0.70rem',
                    bgcolor: 'rgba(211, 47, 47, 0.1)',
                    color: '#D32F2F',
                    fontWeight: 600,
                  }}
                />
              </ListItem>
            ))}
          </List>
        </Box>
      </Box>
    </Drawer>
  );
};

export default Sidebar;