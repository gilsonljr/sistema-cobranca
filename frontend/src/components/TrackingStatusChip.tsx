import React, { useState, useEffect } from 'react';
import { Chip, Tooltip, CircularProgress } from '@mui/material';
import CorreiosService from '../services/CorreiosService';
import WarningIcon from '@mui/icons-material/Warning';
import ScheduleIcon from '@mui/icons-material/Schedule';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';

interface TrackingStatusChipProps {
  trackingCode: string;
  onStatusUpdate?: (status: string, formattedTimestamp?: string) => void;
  refreshInterval?: number; // em milissegundos, padrão é 1 hora
}

const TrackingStatusChip = ({
  trackingCode,
  onStatusUpdate,
  refreshInterval = 3600000 // 1 hora por padrão
}: TrackingStatusChipProps) => {
  const [status, setStatus] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const updateTrackingStatus = async () => {
    if (!trackingCode) {
      setStatus('Sem código');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const trackingInfo = await CorreiosService.rastrearEncomenda(trackingCode);
      const lastEvent = trackingInfo.eventos[0];

      if (lastEvent) {
        setStatus(lastEvent.status);

        // Format current date/time for São Paulo timezone
        const now = new Date();
        const options: Intl.DateTimeFormatOptions = {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
          timeZone: 'America/Sao_Paulo'
        };

        const formatter = new Intl.DateTimeFormat('pt-BR', options);
        const parts = formatter.formatToParts(now);

        const day = parts.find(part => part.type === 'day')?.value || '01';
        const month = parts.find(part => part.type === 'month')?.value || '01';
        const year = parts.find(part => part.type === 'year')?.value || '2023';
        const hour = parts.find(part => part.type === 'hour')?.value || '00';
        const minute = parts.find(part => part.type === 'minute')?.value || '00';
        const second = parts.find(part => part.type === 'second')?.value || '00';

        const formattedTimestamp = `${day}/${month}/${year} - ${hour}:${minute}:${second}`;

        if (onStatusUpdate) {
          onStatusUpdate(lastEvent.status, formattedTimestamp);
        }
      } else {
        setStatus('Não localizado');
      }
      setError(null);
    } catch (err) {
      setStatus('Erro');
      setError(err instanceof Error ? err.message : 'Erro ao rastrear');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    updateTrackingStatus();

    // Configurar verificação periódica se tiver código de rastreio
    if (trackingCode) {
      const interval = setInterval(updateTrackingStatus, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [trackingCode, refreshInterval]);

  // Determinar a aparência do chip com base no status
  const getChipProps = () => {
    if (loading) {
      return {
        label: 'Atualizando...',
        color: 'default' as const,
        icon: <CircularProgress size={16} />,
      };
    }

    if (!trackingCode) {
      return {
        label: 'Sem rastreio',
        color: 'default' as const,
        icon: <ScheduleIcon fontSize="small" />,
      };
    }

    if (error) {
      return {
        label: 'Erro',
        color: 'error' as const,
        icon: <WarningIcon fontSize="small" />,
      };
    }

    if (CorreiosService.isStatusCritical(status)) {
      return {
        label: status,
        color: 'error' as const,
        icon: <WarningIcon fontSize="small" />,
      };
    }

    if (status.toLowerCase().includes('entregue')) {
      return {
        label: 'Entregue',
        color: 'success' as const,
        icon: <CheckCircleIcon fontSize="small" />,
      };
    }

    // Status padrão para em trânsito
    return {
      label: status || 'Em rastreamento',
      color: 'primary' as const,
      icon: <LocalShippingIcon fontSize="small" />,
    };
  };

  const chipProps = getChipProps();

  return (
    <Tooltip title={error || status || 'Sem informações de rastreio'}>
      <Chip
        {...chipProps}
        size="small"
        sx={{
          fontWeight: 'medium',
          '& .MuiChip-iconSmall': {
            marginLeft: '4px',
          }
        }}
      />
    </Tooltip>
  );
};

export default TrackingStatusChip;