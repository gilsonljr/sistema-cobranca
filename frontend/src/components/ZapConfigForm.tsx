import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Switch,
  FormControlLabel,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Paper,
  Divider,
  Snackbar,
  Alert,
  CircularProgress
} from '@mui/material';
import { Delete as DeleteIcon, Edit as EditIcon, Add as AddIcon } from '@mui/icons-material';
import zapConfigService from '../services/ZapConfigService';
import { ZapConfig, ZapConfigInput } from '../types/Zap';

interface ZapConfigFormProps {
  onConfigsUpdated?: () => void;
}

const ZapConfigForm: React.FC<ZapConfigFormProps> = ({ onConfigsUpdated }) => {
  // States for configurations
  const [configs, setConfigs] = useState<ZapConfig[]>([]);
  const [loading, setLoading] = useState(false);
  
  // States for dialog control
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingConfig, setEditingConfig] = useState<ZapConfig | null>(null);
  
  // States for form
  const [configForm, setConfigForm] = useState<ZapConfigInput>({
    name: '',
    isActive: true
  });
  
  // States for validation
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  
  // States for notifications
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'info' | 'warning'
  });

  // Load configurations on component mount
  useEffect(() => {
    loadConfigs();
  }, []);

  const loadConfigs = () => {
    setLoading(true);
    try {
      const loadedConfigs = zapConfigService.getAllConfigs();
      setConfigs(loadedConfigs);
    } catch (error) {
      handleError('Erro ao carregar configurações do WhatsApp');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (config?: ZapConfig) => {
    if (config) {
      setEditingConfig(config);
      setConfigForm({
        name: config.name,
        isActive: config.isActive
      });
    } else {
      setEditingConfig(null);
      setConfigForm({
        name: '',
        isActive: true
      });
    }
    setFormErrors({});
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked } = e.target;
    
    if (name === 'isActive') {
      setConfigForm(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setConfigForm(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Clear error when user types
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!configForm.name.trim()) {
      newErrors.name = 'O nome é obrigatório';
    }
    
    setFormErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      if (editingConfig) {
        zapConfigService.updateConfig(editingConfig.id, configForm);
        showNotification('Configuração atualizada com sucesso', 'success');
      } else {
        zapConfigService.createConfig(configForm);
        showNotification('Configuração criada com sucesso', 'success');
      }
      
      loadConfigs();
      handleCloseDialog();
      
      if (onConfigsUpdated) {
        onConfigsUpdated();
      }
    } catch (error) {
      handleError(editingConfig
        ? 'Erro ao atualizar configuração'
        : 'Erro ao criar configuração'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = (config: ZapConfig) => {
    setLoading(true);
    try {
      zapConfigService.toggleConfigStatus(config.id);
      loadConfigs();
      showNotification('Status atualizado com sucesso', 'success');
      
      if (onConfigsUpdated) {
        onConfigsUpdated();
      }
    } catch (error) {
      handleError('Erro ao atualizar status da configuração');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (config: ZapConfig) => {
    if (window.confirm(`Tem certeza que deseja excluir a configuração "${config.name}"?`)) {
      setLoading(true);
      try {
        zapConfigService.deleteConfig(config.id);
        loadConfigs();
        showNotification('Configuração excluída com sucesso', 'success');
        
        if (onConfigsUpdated) {
          onConfigsUpdated();
        }
      } catch (error) {
        handleError('Erro ao excluir configuração');
      } finally {
        setLoading(false);
      }
    }
  };

  const showNotification = (message: string, severity: 'success' | 'error' | 'info' | 'warning') => {
    setNotification({
      open: true,
      message,
      severity
    });
  };

  const handleCloseNotification = () => {
    setNotification(prev => ({
      ...prev,
      open: false
    }));
  };

  const handleError = (message: string) => {
    console.error(message);
    showNotification(message, 'error');
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Configurações de WhatsApp</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Nova Configuração
        </Button>
      </Box>

      <Paper elevation={2} sx={{ width: '100%', mb: 2 }}>
        {loading && configs.length === 0 ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : configs.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body1" color="textSecondary">
              Nenhuma configuração encontrada
            </Typography>
          </Box>
        ) : (
          <List>
            {configs.map((config, index) => (
              <React.Fragment key={config.id}>
                <ListItem>
                  <ListItemText
                    primary={config.name}
                    secondary={`Criado em: ${config.createdAt.toLocaleDateString()}`}
                  />
                  <Box sx={{ display: 'flex', alignItems: 'center', mr: 7 }}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={config.isActive}
                          onChange={() => handleToggleStatus(config)}
                          color="primary"
                        />
                      }
                      label={config.isActive ? "Ativo" : "Inativo"}
                    />
                  </Box>
                  <ListItemSecondaryAction>
                    <IconButton
                      edge="end"
                      aria-label="edit"
                      onClick={() => handleOpenDialog(config)}
                      sx={{ mr: 1 }}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      edge="end"
                      aria-label="delete"
                      onClick={() => handleDelete(config)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
                {index < configs.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        )}
      </Paper>

      {/* Dialog for creating/editing configurations */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingConfig ? 'Editar Configuração' : 'Nova Configuração'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 1 }}>
            <TextField
              fullWidth
              margin="normal"
              name="name"
              label="Nome da Configuração"
              value={configForm.name}
              onChange={handleInputChange}
              error={!!formErrors.name}
              helperText={formErrors.name}
              required
              autoFocus
            />
            <FormControlLabel
              control={
                <Switch
                  name="isActive"
                  checked={configForm.isActive}
                  onChange={handleInputChange}
                  color="primary"
                />
              }
              label="Ativo"
              sx={{ mt: 2 }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="inherit">
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            color="primary"
            variant="contained"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : editingConfig ? 'Atualizar' : 'Criar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notification snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseNotification} severity={notification.severity}>
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ZapConfigForm; 