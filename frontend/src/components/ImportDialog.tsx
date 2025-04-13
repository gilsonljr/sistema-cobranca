import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  CircularProgress,
} from '@mui/material';
import { Order } from '../types/Order';
import CSVImport from './CSVImport';

interface ImportDialogProps {
  open: boolean;
  onClose: () => void;
  onImportSuccess: (orders: Order[]) => void;
}

const ImportDialog: React.FC<ImportDialogProps> = ({
  open,
  onClose,
  onImportSuccess,
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleImportSuccess = (orders: Order[]) => {
    setIsLoading(false);
    onImportSuccess(orders);
    onClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        Importar Pedidos
      </DialogTitle>
      <DialogContent>
        <Box sx={{ py: 2 }}>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Selecione um arquivo CSV contendo os dados dos pedidos para importar.
          </Typography>
          <CSVImport
            onImportSuccess={handleImportSuccess}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isLoading}>
          Cancelar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ImportDialog; 