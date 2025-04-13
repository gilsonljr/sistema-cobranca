import React from 'react';
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
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import CodeIcon from '@mui/icons-material/Code';
import { Order } from '../types/Order';

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

  const getStatusCount = (status: string) => {
    return orders.filter(order =>
      typeof order.situacaoVenda === 'string' &&
      order.situacaoVenda.toLowerCase() === status.toLowerCase()
    ).length;
  };

  const getTotalOrders = () => {
    return orders.filter(order => !!order.idVenda).length;
  };

  const getPendingPayments = () => {
    return orders.filter(order =>
      typeof order.situacaoVenda === 'string' &&
      order.situacaoVenda.toLowerCase() === 'pagamento pendente'
    ).length;
  };

  const getCompletedOrders = () => {
    return orders.filter(order =>
      typeof order.situacaoVenda === 'string' &&
      order.situacaoVenda.toLowerCase() === 'completo'
    ).length;
  };

  const getCanceledOrders = () => {
    return orders.filter(order =>
      typeof order.situacaoVenda === 'string' &&
      order.situacaoVenda.toLowerCase() === 'cancelado'
    ).length;
  };

  const getReceiveToday = () => {
    const today = new Date().toLocaleDateString('pt-BR');
    return orders.filter(order => order.dataRecebimento === today).length;
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
      const count = orders.filter(order =>
        typeof order.situacaoVenda === 'string' &&
        order.situacaoVenda.toLowerCase() === filter.value.toLowerCase()
      ).length;

      console.log(`Pedidos com status '${filter.value}': ${count}`);
      console.log("Exemplos de pedidos:", orders
        .filter(order => order.situacaoVenda)
        .slice(0, 3)
        .map(o => ({ id: o.idVenda, status: o.situacaoVenda }))
      );
    }

    onStatusSelect(filter);
    navigate('/');  // Navega para a rota padrão (dashboard) com o filtro selecionado
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: 240,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: { width: 240, boxSizing: 'border-box', pt: 8 },
      }}
    >
      <List sx={{ pt: 2 }}>
        <ListItem button component={Link} to="/tracking" selected={location.pathname === '/tracking'}>
          <ListItemIcon>
            <LocalShippingIcon color={location.pathname === '/tracking' ? 'primary' : 'inherit'} />
          </ListItemIcon>
          <ListItemText primary="Rastreamento" />
        </ListItem>

        <ListItem button component={Link} to="/duplicates" selected={location.pathname === '/duplicates'}>
          <ListItemIcon>
            <ContentCopyIcon color={location.pathname === '/duplicates' ? 'primary' : 'inherit'} />
          </ListItemIcon>
          <ListItemText primary="Pedidos Duplicados" />
        </ListItem>

        <ListItem button component={Link} to="/example" selected={location.pathname === '/example'}>
          <ListItemIcon>
            <CodeIcon color={location.pathname === '/example' ? 'primary' : 'inherit'} />
          </ListItemIcon>
          <ListItemText primary="Exemplo de Componentes" />
        </ListItem>
      </List>

      <Divider sx={{ my: 2 }} />

      <Box sx={{ p: { xs: 1.5, sm: 2 } }}>
        <Typography
          variant="subtitle2"
          sx={{
            px: 1,
            mb: 2,
            color: '#2c3e50',
            fontSize: '0.9rem',
            fontWeight: 600,
          }}
        >
          Status do Pedido
        </Typography>
        <List sx={{ p: 0 }}>
          {statusItems.map((item) => {
            const isSelected = isFilterEqual(selectedStatus, item.filter);
            return (
              <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  onClick={() => handleStatusClick(item.filter)}
                  selected={isSelected}
                  sx={{
                    py: 0.75,
                    px: { xs: 1, sm: 1.5 },
                    borderRadius: 1,
                    '&:hover': {
                      bgcolor: 'rgba(33, 150, 243, 0.05)',
                    },
                    '&.Mui-selected': {
                      bgcolor: 'rgba(33, 150, 243, 0.1)',
                      '&:hover': {
                        bgcolor: 'rgba(33, 150, 243, 0.15)',
                      },
                    },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: { xs: 24, sm: 28 } }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.text}
                    primaryTypographyProps={{
                      fontSize: { xs: '0.78rem', sm: '0.83rem' },
                      fontWeight: isSelected ? 600 : 500,
                      color: isSelected ? 'primary.main' : 'text.primary',
                      noWrap: false,
                    }}
                    sx={{
                      mr: 1,
                      '& .MuiTypography-root': {
                        whiteSpace: 'normal',
                        wordBreak: 'break-word'
                      }
                    }}
                  />
                  <Chip
                    label={item.count}
                    size="small"
                    sx={{
                      bgcolor: isSelected ? 'rgba(33, 150, 243, 0.1)' : 'rgba(0, 0, 0, 0.05)',
                      color: isSelected ? 'primary.main' : 'text.secondary',
                      fontSize: '0.7rem',
                      height: 20,
                      minWidth: '28px',
                      fontWeight: 500,
                      flexShrink: 0,
                      '& .MuiChip-label': {
                        px: 1,
                        overflow: 'visible',
                      },
                    }}
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Box>
    </Drawer>
  );
};

export default Sidebar;