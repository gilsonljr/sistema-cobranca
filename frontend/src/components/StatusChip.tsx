import React from 'react';
import { Chip } from '@mui/material';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import ErrorOutlineOutlinedIcon from '@mui/icons-material/ErrorOutlineOutlined';
import PendingOutlinedIcon from '@mui/icons-material/PendingOutlined';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import HandshakeOutlinedIcon from '@mui/icons-material/HandshakeOutlined';
import ThumbUpAltOutlinedIcon from '@mui/icons-material/ThumbUpAltOutlined';

interface StatusChipProps {
  status: string;
}

const StatusChip: React.FC<StatusChipProps> = ({ status }) => {
  const getStatusConfig = (statusText: string) => {
    const lowerStatus = statusText.toLowerCase();
    
    if (lowerStatus.includes('completo')) {
      return { color: 'success', icon: <CheckCircleOutlinedIcon fontSize="small" /> };
    }
    
    if (lowerStatus.includes('pendente') || lowerStatus.includes('pagamento pendente')) {
      return { color: 'warning', icon: <PendingOutlinedIcon fontSize="small" /> };
    }
    
    if (lowerStatus.includes('cancelado')) {
      return { color: 'error', icon: <CancelOutlinedIcon fontSize="small" /> };
    }
    
    if (lowerStatus.includes('falha') || lowerStatus.includes('frustrado')) {
      return { color: 'error', icon: <ErrorOutlineOutlinedIcon fontSize="small" /> };
    }
    
    if (lowerStatus.includes('separação')) {
      return { color: 'info', icon: <AccessTimeOutlinedIcon fontSize="small" /> };
    }
    
    if (lowerStatus.includes('correios') || lowerStatus.includes('entrega')) {
      return { color: 'primary', icon: <LocalShippingOutlinedIcon fontSize="small" /> };
    }
    
    if (lowerStatus.includes('negociação')) {
      return { color: 'info', icon: <HandshakeOutlinedIcon fontSize="small" /> };
    }
    
    if (lowerStatus.includes('confirmar')) {
      return { color: 'success', icon: <ThumbUpAltOutlinedIcon fontSize="small" /> };
    }
    
    // Default
    return { color: 'default', icon: <AccessTimeOutlinedIcon fontSize="small" /> };
  };

  const config = getStatusConfig(status);
  
  return (
    <Chip
      icon={config.icon}
      label={status}
      color={config.color as any}
      size="small"
      variant="outlined"
      sx={{
        minWidth: 120,
        borderRadius: 1,
        '& .MuiChip-label': {
          px: 1,
          whiteSpace: 'normal',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        },
      }}
    />
  );
};

export default StatusChip; 