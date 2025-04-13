import React, { useState, useEffect } from 'react';
import {
  Paper,
  Typography,
  Box,
  Grid,
  Divider,
  Button,
  Card,
  CardContent,
  CardActions,
  Alert,
  LinearProgress,
  IconButton,
  Badge,
  Chip,
  Tooltip,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import WarningIcon from '@mui/icons-material/Warning';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ScheduleIcon from '@mui/icons-material/Schedule';
import CorreiosService from '../services/CorreiosService';
import TrackingStatusChip from './TrackingStatusChip';
import { Order } from '../types/Order';

interface TrackingDashboardProps {
  orders: Order[];
  onRefresh?: () => void;
}

interface TrackingStats {
  total: number;
  emTransito: number;
  entregues: number;
  criticos: number;
  semRastreio: number;
}

const TrackingDashboard: React.FC<TrackingDashboardProps> = ({ orders, onRefresh }) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [stats, setStats] = useState<TrackingStats>({
    total: 0,
    emTransito: 0,
    entregues: 0,
    criticos: 0,
    semRastreio: 0,
  });
  const [criticalOrders, setCriticalOrders] = useState<Order[]>([]);

  // Calcular estatísticas de rastreamento
  useEffect(() => {
    const calcStats = async () => {
      const withTracking = orders.filter(order => !!order.codigoRastreio);
      const withoutTracking = orders.filter(order => !order.codigoRastreio);
      
      // Encontra pedidos com status crítico
      const critical: Order[] = [];
      let entregues = 0;
      
      for (const order of withTracking) {
        // Se já tiver status de correios, usa ele para determinar se é crítico
        if (order.statusCorreios) {
          if (CorreiosService.isStatusCritical(order.statusCorreios)) {
            critical.push(order);
          }
          if (order.statusCorreios.toLowerCase().includes('entregue')) {
            entregues++;
          }
        }
      }
      
      setStats({
        total: orders.length,
        emTransito: withTracking.length - entregues - critical.length,
        entregues,
        criticos: critical.length,
        semRastreio: withoutTracking.length,
      });
      
      setCriticalOrders(critical);
    };
    
    calcStats();
  }, [orders]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    
    try {
      // Chama o callback de atualização se fornecido
      if (onRefresh) {
        await onRefresh();
      }
      
      // Adiciona um pequeno atraso para mostrar o progresso
      setTimeout(() => {
        setIsRefreshing(false);
      }, 1000);
    } catch (error) {
      console.error("Erro ao atualizar rastreamentos:", error);
      setIsRefreshing(false);
    }
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6" component="h2">
          Painel de Rastreamento
        </Typography>
        <Box>
          <Tooltip title="Atualizar status de rastreamento">
            <IconButton
              onClick={handleRefresh}
              disabled={isRefreshing}
              color="primary"
              size="small"
            >
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
      
      {isRefreshing && <LinearProgress sx={{ mb: 2 }} />}

      <Grid container spacing={2} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card variant="outlined">
            <CardContent sx={{ textAlign: 'center' }}>
              <LocalShippingIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4">{stats.emTransito}</Typography>
              <Typography variant="body2" color="text.secondary">
                Em Trânsito
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card variant="outlined">
            <CardContent sx={{ textAlign: 'center' }}>
              <CheckCircleIcon color="success" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4">{stats.entregues}</Typography>
              <Typography variant="body2" color="text.secondary">
                Entregues
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card variant="outlined">
            <CardContent sx={{ textAlign: 'center' }}>
              <Badge badgeContent={stats.criticos} color="error">
                <WarningIcon color="warning" sx={{ fontSize: 40, mb: 1 }} />
              </Badge>
              <Typography variant="h4">{stats.criticos}</Typography>
              <Typography variant="body2" color="text.secondary">
                Status Crítico
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card variant="outlined">
            <CardContent sx={{ textAlign: 'center' }}>
              <ScheduleIcon color="disabled" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4">{stats.semRastreio}</Typography>
              <Typography variant="body2" color="text.secondary">
                Sem Rastreio
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {criticalOrders.length > 0 && (
        <>
          <Box mb={2}>
            <Typography variant="subtitle1" gutterBottom fontWeight="500">
              Pedidos com Status Crítico
            </Typography>
            <Divider />
          </Box>
          
          <Grid container spacing={2}>
            {criticalOrders.map((order) => (
              <Grid item xs={12} md={6} key={order.idVenda}>
                <Card variant="outlined">
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="subtitle1" fontWeight="500">
                        {order.cliente}
                      </Typography>
                      <TrackingStatusChip 
                        trackingCode={order.codigoRastreio}
                        refreshInterval={1800000} // Atualizar a cada 30 minutos
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Pedido: {order.idVenda} • {order.dataVenda}
                    </Typography>
                    <Box mt={1}>
                      <Chip 
                        size="small" 
                        label={`${order.cidadeDestinatario}, ${order.estadoDestinatario}`}
                        sx={{ mr: 1, mb: 1 }}
                      />
                      <Chip 
                        size="small" 
                        label={`R$ ${order.valorVenda.toFixed(2)}`}
                        color="primary"
                        variant="outlined"
                        sx={{ mr: 1, mb: 1 }}
                      />
                    </Box>
                  </CardContent>
                  <CardActions>
                    <Button size="small" href={`https://rastreamento.correios.com.br/app/index.php?objeto=${order.codigoRastreio}`} target="_blank">
                      Ver nos Correios
                    </Button>
                    <Button size="small" color="primary">
                      Ver Detalhes
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        </>
      )}

      {!isRefreshing && criticalOrders.length === 0 && (
        <Alert severity="success" sx={{ mt: 2 }}>
          Todos os pedidos estão com status normal de rastreamento.
        </Alert>
      )}
    </Paper>
  );
};

export default TrackingDashboard; 