import React from 'react';
import { 
  Box, 
  Button, 
  Grid, 
  Paper, 
  TextField, 
  Typography 
} from '@mui/material';
import { Order } from '../types/Order';

interface UserEditFormProps {
  selectedOrder: Order;
  editedValues: Partial<Order>;
  handleEditChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleSaveEdit: () => void;
}

const UserEditForm: React.FC<UserEditFormProps> = ({
  selectedOrder,
  editedValues,
  handleEditChange,
  handleSaveEdit
}) => {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        mb: 3,
        borderRadius: 2,
        border: '1px solid rgba(0,0,0,0.08)',
        bgcolor: 'white',
        borderLeft: '4px solid #3f51b5'
      }}
    >
      <Typography variant="subtitle2" sx={{ mb: 2, color: '#637381', fontWeight: 600 }}>
        Editar Informações
      </Typography>

      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField
            label="Valor Recebido"
            name="valorRecebido"
            value={editedValues.valorRecebido !== undefined ? editedValues.valorRecebido : selectedOrder?.valorRecebido || ''}
            onChange={handleEditChange}
            fullWidth
            size="small"
            type="number"
            InputProps={{
              startAdornment: <Box component="span" sx={{ color: 'text.secondary', mr: 0.5 }}>R$</Box>,
            }}
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <TextField
            label="Data de Negociação"
            name="dataNegociacao"
            value={editedValues.dataNegociacao !== undefined ? editedValues.dataNegociacao : selectedOrder?.dataNegociacao || ''}
            onChange={handleEditChange}
            fullWidth
            size="small"
            placeholder="DD/MM/AAAA"
          />
        </Grid>
        
        <Grid item xs={12}>
          <TextField
            label="Forma de Pagamento"
            name="formaPagamento"
            value={editedValues.formaPagamento !== undefined ? editedValues.formaPagamento : selectedOrder?.formaPagamento || ''}
            onChange={handleEditChange}
            fullWidth
            size="small"
          />
        </Grid>

        <Grid item xs={12}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSaveEdit}
            sx={{
              mt: 1,
              borderRadius: 1.5,
              textTransform: 'none',
            }}
          >
            Salvar Alterações
          </Button>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default UserEditForm;
