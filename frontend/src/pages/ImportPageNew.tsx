import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
} from '@mui/material';
import { Order } from '../types/Order';
import CSVImport from '../components/CSVImport';

interface ImportPageProps {
  onImportSuccess: (orders: Order[]) => void;
}

const ImportPageNew: React.FC<ImportPageProps> = ({ onImportSuccess }) => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 500, color: '#334155', mb: 3 }}>
        Importação de Dados
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.1)' }}>
            <Typography variant="h6" sx={{ fontWeight: 500, color: '#334155', mb: 3 }}>
              Importação de Pedidos
            </Typography>
            
            <CSVImport onImportSuccess={onImportSuccess} />
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.1)' }}>
            <Typography variant="h6" sx={{ fontWeight: 500, color: '#334155', mb: 2 }}>
              Instruções
            </Typography>
            
            <Typography variant="body2" paragraph>
              1. Selecione um arquivo CSV para importar.
            </Typography>
            
            <Typography variant="body2" paragraph>
              2. O arquivo deve ter cabeçalhos na primeira linha.
            </Typography>
            
            <Typography variant="body2" paragraph>
              3. Campos vazios serão importados como vazios.
            </Typography>
            
            <Typography variant="body2" paragraph>
              4. Após a importação, os dados serão exibidos no dashboard.
            </Typography>
            
            <Typography variant="body2" paragraph>
              5. Pedidos com o mesmo ID serão atualizados, novos IDs serão adicionados.
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ImportPageNew;
