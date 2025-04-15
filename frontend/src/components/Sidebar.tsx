import React, { useEffect, useState } from 'react';
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
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import CodeIcon from '@mui/icons-material/Code';
import AssessmentIcon from '@mui/icons-material/Assessment';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import CategoryIcon from '@mui/icons-material/Category';
import AuthService from '../services/AuthService';
import { Order } from '../types/Order';
import DeleteIcon from '@mui/icons-material/Delete';

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

  // Verificar o papel do usuário e obter informações adicionais
  useEffect(() => {
    setIsSeller(AuthService.isSeller());
    setIsAdmin(AuthService.isAdmin());
    setIsSupervisor(AuthService.isSupervisor());
    setIsOperator(AuthService.isCollector());
    
    // Obter informações do usuário logado para filtrar vendas por vendedor/operador
    const userInfo = AuthService.getUserInfo();
    if (userInfo) {
      setCurrentUserEmail(userInfo.email);
      setCurrentUserName(userInfo.fullName);
      console.log("Current user:", userInfo.fullName, userInfo.role);
    }
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
        // Filtrar por nome exato ou por email (se o nome do vendedor for o email)
        return order.vendedor === currentUserName || 
               order.vendedor === currentUserEmail;
      });
    }
    
    // Se for operador, mostrar apenas pedidos atribuídos a este operador
    if (isOperator) {
      return ordersToFilter.filter(order => {
        return order.operador === currentUserName || 
               order.operador === currentUserEmail;
      });
    }
    
    // Caso padrão, retornar todos os pedidos
    return ordersToFilter;
  }

  // Filtrar pedidos baseado no papel do usuário antes de contar
  const filteredOrdersByRole = filterOrdersByUserRole(orders);

  const getStatusCount = (status: string) => {
    return filteredOrdersByRole.filter(order =>
      typeof order.situacaoVenda === 'string' &&
      order.situacaoVenda.toLowerCase() === status.toLowerCase()
    ).length;
  };

  const getTotalOrders = () => {
    return filteredOrdersByRole.filter(order => 
      !!order.idVenda && 
      (!order.situacaoVenda || order.situacaoVenda.toLowerCase() !== 'deletado')
    ).length;
  };

  // Todos os métodos abaixo excluem pedidos com status "Deletado" para garantir
  // que esses pedidos não interfiram em nenhum relatório ou contagem total
  // conforme requisito do cliente.
  
  const getPendingPayments = () => {
    return filteredOrdersByRole.filter(order =>
      typeof order.situacaoVenda === 'string' &&
      order.situacaoVenda.toLowerCase() === 'pagamento pendente'
    ).length;
  };

  const getCompletedOrders = () => {
    return filteredOrdersByRole.filter(order =>
      typeof order.situacaoVenda === 'string' &&
      order.situacaoVenda.toLowerCase() === 'completo'
    ).length;
  };

  const getCanceledOrders = () => {
    return filteredOrdersByRole.filter(order =>
      typeof order.situacaoVenda === 'string' &&
      order.situacaoVenda.toLowerCase() === 'cancelado'
    ).length;
  };

  const getDeletedOrders = () => {
    return filteredOrdersByRole.filter(order =>
      typeof order.situacaoVenda === 'string' &&
      order.situacaoVenda.toLowerCase() === 'deletado'
    ).length;
  };

  const getReceiveToday = () => {
    const today = new Date().toLocaleDateString('pt-BR');
    return filteredOrdersByRole.filter(order => order.dataRecebimento === today).length;
  };

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
    { text: 'Liberação', icon: <AccessTimeOutlinedIcon sx={{ color: '#2196F3' }} />, count: getStatusCount('Liberação'), filter: { field: 'situacaoVenda', value: 'liberação' } },
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

    // Atualizar o filtro selecionado
    onStatusSelect(filter);
    
    // Se não estiver na dashboard, navegar para lá
    if (location.pathname !== '/') {
      navigate('/');
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
        <ListItem
          button
          component={Link}
          to="/"
          selected={location.pathname === '/'}
          sx={{
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
          }}
        >
          <ListItemIcon>
            <HomeIcon color={location.pathname === '/' ? 'primary' : 'inherit'} />
          </ListItemIcon>
          <ListItemText primary="Tela Inicial" />
        </ListItem>

        {/* Mostrar link para página de vendedor apenas para vendedores */}
        {isSeller && (
          <ListItem
            button
            component={Link}
            to="/vendedor"
            selected={location.pathname === '/vendedor'}
            sx={{
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
            }}
          >
            <ListItemIcon>
              <ShoppingCartIcon color={location.pathname === '/vendedor' ? 'primary' : 'inherit'} />
            </ListItemIcon>
            <ListItemText primary="Meus Pedidos" />
          </ListItem>
        )}

        {/* Mostrar link para pedidos duplicados apenas para admin e supervisor */}
        {(isAdmin || isSupervisor) && (
          <>
            <ListItem button component={Link} to="/duplicates" selected={location.pathname === '/duplicates'}>
              <ListItemIcon>
                <ContentCopyIcon color={location.pathname === '/duplicates' ? 'primary' : 'inherit'} />
              </ListItemIcon>
              <ListItemText primary="Pedidos Duplicados" />
            </ListItem>

            <ListItem
              button
              component={Link}
              to="/products"
              selected={location.pathname === '/products'}
              sx={{
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
              }}
            >
              <ListItemIcon>
                <CategoryIcon color={location.pathname === '/products' ? 'primary' : 'inherit'} />
              </ListItemIcon>
              <ListItemText primary="Produtos e Ofertas" />
            </ListItem>
          </>
        )}
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