import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  Divider,
  Chip,
  CircularProgress,
  Button,
  IconButton,
  Tooltip,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import PendingIcon from '@mui/icons-material/Pending';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Status types for Correios tracking
type StatusType = 'entregue' | 'em_transito' | 'pendente' | 'problema';

// Mock data for Correios updates
// In a real app, this would come from an API
const mockCorreiosUpdates = [
  {
    id: 1,
    orderId: '12345',
    trackingCode: 'BR123456789BR',
    status: 'entregue' as StatusType,
    lastUpdate: 'Objeto entregue ao destinatário',
    location: 'São Paulo, SP',
    timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
    customer: 'João Silva',
  },
  {
    id: 2,
    orderId: '12346',
    trackingCode: 'BR987654321BR',
    status: 'em_transito' as StatusType,
    lastUpdate: 'Objeto em trânsito - por favor aguarde',
    location: 'Rio de Janeiro, RJ',
    timestamp: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
    customer: 'Maria Oliveira',
  },
  {
    id: 3,
    orderId: '12347',
    trackingCode: 'BR456789123BR',
    status: 'pendente' as StatusType,
    lastUpdate: 'Objeto postado',
    location: 'Belo Horizonte, MG',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    customer: 'Carlos Santos',
  },
  {
    id: 4,
    orderId: '12348',
    trackingCode: 'BR789123456BR',
    status: 'problema' as StatusType,
    lastUpdate: 'Endereço insuficiente',
    location: 'Brasília, DF',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4 hours ago
    customer: 'Ana Pereira',
  },
  {
    id: 5,
    orderId: '12349',
    trackingCode: 'BR321654987BR',
    status: 'em_transito' as StatusType,
    lastUpdate: 'Objeto saiu para entrega ao destinatário',
    location: 'Salvador, BA',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6), // 6 hours ago
    customer: 'Roberto Almeida',
  },
];

// Helper function to get status chip color and icon
const getStatusInfo = (status: StatusType) => {
  switch (status) {
    case 'entregue':
      return { color: 'success', icon: <CheckCircleIcon fontSize="small" />, label: 'Entregue' };
    case 'em_transito':
      return { color: 'info', icon: <LocalShippingIcon fontSize="small" />, label: 'Em Trânsito' };
    case 'pendente':
      return { color: 'warning', icon: <PendingIcon fontSize="small" />, label: 'Pendente' };
    case 'problema':
      return { color: 'error', icon: <ErrorIcon fontSize="small" />, label: 'Problema' };
    default:
      return { color: 'default', icon: <PendingIcon fontSize="small" />, label: 'Desconhecido' };
  }
};

const CorreiosUpdates: React.FC = () => {
  const [updates, setUpdates] = useState(mockCorreiosUpdates);
  const [loading, setLoading] = useState(false);

  // Simulate fetching updates from an API
  const fetchUpdates = () => {
    setLoading(true);
    // In a real app, this would be an API call
    setTimeout(() => {
      // Simulate new data by updating a random item's status
      const updatedData = [...updates];
      const randomIndex = Math.floor(Math.random() * updates.length);
      const statuses: StatusType[] = ['entregue', 'em_transito', 'pendente', 'problema'];
      const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
      
      updatedData[randomIndex] = {
        ...updatedData[randomIndex],
        status: randomStatus,
        lastUpdate: randomStatus === 'entregue' 
          ? 'Objeto entregue ao destinatário' 
          : randomStatus === 'em_transito'
            ? 'Objeto em trânsito - por favor aguarde'
            : randomStatus === 'pendente'
              ? 'Objeto postado'
              : 'Endereço insuficiente',
        timestamp: new Date(),
      };
      
      setUpdates(updatedData);
      setLoading(false);
    }, 1000);
  };

  // Set up auto-refresh every 30 seconds
  useEffect(() => {
    const intervalId = setInterval(() => {
      fetchUpdates();
    }, 30000);

    return () => clearInterval(intervalId);
  }, [updates]);

  return (
    <Paper sx={{ p: 2, height: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Atualizações de Status Correios</Typography>
        <Button
          startIcon={loading ? <CircularProgress size={20} /> : <RefreshIcon />}
          onClick={fetchUpdates}
          disabled={loading}
          size="small"
        >
          Atualizar
        </Button>
      </Box>
      
      <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
        {updates.map((update, index) => {
          const statusInfo = getStatusInfo(update.status);
          
          return (
            <React.Fragment key={update.id}>
              {index > 0 && <Divider component="li" />}
              <ListItem
                alignItems="flex-start"
                secondaryAction={
                  <Tooltip title="Ver detalhes">
                    <IconButton edge="end" aria-label="view">
                      <VisibilityIcon />
                    </IconButton>
                  </Tooltip>
                }
              >
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography component="span" variant="subtitle2">
                        Pedido #{update.orderId}
                      </Typography>
                      <Chip
                        icon={statusInfo.icon}
                        label={statusInfo.label}
                        size="small"
                        color={statusInfo.color as any}
                        sx={{ height: 24 }}
                      />
                    </Box>
                  }
                  secondary={
                    <React.Fragment>
                      <Typography
                        component="span"
                        variant="body2"
                        color="text.primary"
                        sx={{ display: 'block', mt: 0.5 }}
                      >
                        {update.lastUpdate} • {update.location}
                      </Typography>
                      <Typography component="span" variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                        Código: {update.trackingCode} • Cliente: {update.customer}
                      </Typography>
                      <Typography component="span" variant="caption" color="text.secondary">
                        {formatDistanceToNow(update.timestamp, { addSuffix: true, locale: ptBR })}
                      </Typography>
                    </React.Fragment>
                  }
                />
              </ListItem>
            </React.Fragment>
          );
        })}
      </List>
    </Paper>
  );
};

export default CorreiosUpdates;
