import React from 'react';
import {
  Box,
  Typography,
  Switch,
  FormControlLabel,
  Slider,
  TextField,
  Grid,
  Alert,
  Tooltip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import { useConversion } from '../contexts/ConversionContext';

interface ConversaoChangerProps {
  open: boolean;
  onClose: () => void;
}

const ConversaoChanger: React.FC<ConversaoChangerProps> = ({ open, onClose }) => {
  const { conversionSettings, updateConversionSettings } = useConversion();

  const handleToggleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    updateConversionSettings({ enabled: event.target.checked });
  };

  const handleSliderChange = (type: keyof typeof conversionSettings) => (event: Event, newValue: number | number[]) => {
    if (typeof newValue === 'number') {
      updateConversionSettings({ [type]: newValue });
    }
  };

  const handleInputChange = (type: keyof typeof conversionSettings) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(event.target.value);
    if (!isNaN(value) && value >= 0) {
      updateConversionSettings({ [type]: value > 100 ? 100 : value });
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Conversão Changer</Typography>
          <FormControlLabel
            control={
              <Switch
                checked={conversionSettings.enabled}
                onChange={handleToggleChange}
                color="primary"
              />
            }
            label={conversionSettings.enabled ? "Ativado" : "Desativado"}
          />
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <Alert severity="info" sx={{ mb: 3 }}>
          Esta ferramenta permite ajustar a taxa de conversão exibida no dashboard. 
          Quando ativada, o "Valor Recebido" será calculado como a porcentagem definida do "Valor Total".
        </Alert>
        
        <Box sx={{ opacity: conversionSettings.enabled ? 1 : 0.7, pointerEvents: conversionSettings.enabled ? 'auto' : 'none' }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle1" fontWeight="bold">Taxa de Conversão</Typography>
                <Tooltip title="Define a porcentagem do Valor Total que será mostrada como Valor Recebido">
                  <IconButton size="small">
                    <InfoIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Slider
                  value={conversionSettings.revenueConversion}
                  onChange={handleSliderChange('revenueConversion')}
                  aria-labelledby="conversion-rate-slider"
                  valueLabelDisplay="auto"
                  step={1}
                  marks={[
                    { value: 0, label: '0%' },
                    { value: 25, label: '25%' },
                    { value: 50, label: '50%' },
                    { value: 75, label: '75%' },
                    { value: 100, label: '100%' },
                  ]}
                  min={0}
                  max={100}
                  sx={{ mr: 2, flexGrow: 1 }}
                />
                <TextField
                  value={conversionSettings.revenueConversion}
                  onChange={handleInputChange('revenueConversion')}
                  variant="outlined"
                  size="small"
                  type="number"
                  InputProps={{
                    endAdornment: <Typography variant="body2">%</Typography>,
                  }}
                  sx={{ width: '100px' }}
                />
              </Box>
              
              <Box sx={{ mt: 4, p: 2, bgcolor: 'background.paper', borderRadius: 1, border: '1px solid rgba(0,0,0,0.1)' }}>
                <Typography variant="subtitle1" gutterBottom>Exemplo com valores atuais:</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2">Valor Total:</Typography>
                    <Typography variant="h6">R$ 529.912,00</Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2">Valor Recebido (com {conversionSettings.revenueConversion}%):</Typography>
                    <Typography variant="h6" color="primary">
                      R$ {(529912 * (conversionSettings.revenueConversion / 100)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose}>Fechar</Button>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={onClose}
          disabled={!conversionSettings.enabled}
        >
          Aplicar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConversaoChanger;
