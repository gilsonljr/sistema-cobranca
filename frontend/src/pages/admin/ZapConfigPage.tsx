import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Grid,
  TextField,
  Switch,
  FormControlLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  Chip
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import zapConfigService from '../../services/ZapConfigService';
import { ZapConfig, ZapConfigInput } from '../../types/Zap';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const ZapConfigPage: React.FC = () => {
  const [configs, setConfigs] = useState<ZapConfig[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
  const [selectedConfig, setSelectedConfig] = useState<ZapConfig | null>(null);
  const [formData, setFormData] = useState<ZapConfigInput>({
    name: '',
    isActive: true
  });
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'info' | 'warning'
  });

  // Load all configurations
  const loadConfigs = () => {
    const allConfigs = zapConfigService.getAllConfigs();
    setConfigs(allConfigs);
  };

  // Load configurations on component mount
  useEffect(() => {
    loadConfigs();
  }, []);

  // Handle form input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Open create dialog
  const handleOpenCreateDialog = () => {
    setDialogMode('create');
    setSelectedConfig(null);
    setFormData({
      name: '',
      isActive: true
    });
    setOpenDialog(true);
  };

  // Open edit dialog
  const handleOpenEditDialog = (config: ZapConfig) => {
    setDialogMode('edit');
    setSelectedConfig(config);
    setFormData({
      name: config.name,
      isActive: config.isActive
    });
    setOpenDialog(true);
  };

  // Handle dialog close
  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  // Handle form submission
  const handleSubmit = () => {
    try {
      if (dialogMode === 'create') {
        zapConfigService.createConfig(formData);
        setNotification({
          open: true,
          message: 'Configuração de Zap criada com sucesso!',
          severity: 'success'
        });
      } else if (dialogMode === 'edit' && selectedConfig) {
        zapConfigService.updateConfig(selectedConfig.id, formData);
        setNotification({
          open: true,
          message: 'Configuração de Zap atualizada com sucesso!',
          severity: 'success'
        });
      }

      handleCloseDialog();
      loadConfigs();
    } catch (error) {
      console.error('Error saving Zap configuration:', error);
      setNotification({
        open: true,
        message: 'Erro ao salvar configuração de Zap',
        severity: 'error'
      });
    }
  };

  // Handle toggle active status
  const handleToggleStatus = (id: string) => {
    try {
      zapConfigService.toggleConfigStatus(id);
      loadConfigs();
      setNotification({
        open: true,
        message: 'Status da configuração atualizado com sucesso!',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error toggling Zap configuration status:', error);
      setNotification({
        open: true,
        message: 'Erro ao atualizar status da configuração',
        severity: 'error'
      });
    }
  };

  // Handle delete configuration
  const handleDelete = (id: string) => {
    try {
      zapConfigService.deleteConfig(id);
      loadConfigs();
      setNotification({
        open: true,
        message: 'Configuração de Zap removida com sucesso!',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error deleting Zap configuration:', error);
      setNotification({
        open: true,
        message: 'Erro ao remover configuração de Zap',
        severity: 'error'
      });
    }
  };

  // Handle notification close
  const handleCloseNotification = () => {
    setNotification({
      ...notification,
      open: false
    });
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 500 }}>
          Configurações de WhatsApp (Zap)
        </Typography>

        <Box>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={loadConfigs}
            sx={{ mr: 1 }}
          >
            Atualizar
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenCreateDialog}
          >
            Novo Zap
          </Button>
        </Box>
      </Box>

      {/* Configurations Table */}
      <Paper sx={{ p: 2, mb: 3, borderRadius: '12px' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nome</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Criado em</TableCell>
                <TableCell>Atualizado em</TableCell>
                <TableCell>Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {configs.length > 0 ? (
                configs.map((config) => (
                  <TableRow key={config.id}>
                    <TableCell>{config.name}</TableCell>
                    <TableCell>
                      <Chip
                        label={config.isActive ? 'Ativo' : 'Inativo'}
                        color={config.isActive ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {format(config.createdAt, 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                    </TableCell>
                    <TableCell>
                      {format(config.updatedAt, 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                    </TableCell>
                    <TableCell>
                      <IconButton
                        color="primary"
                        onClick={() => handleOpenEditDialog(config)}
                        size="small"
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        color={config.isActive ? 'error' : 'success'}
                        onClick={() => handleToggleStatus(config.id)}
                        size="small"
                      >
                        {config.isActive ? 'Desativar' : 'Ativar'}
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={() => handleDelete(config.id)}
                        size="small"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    Nenhuma configuração de Zap encontrada.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Create/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {dialogMode === 'create' ? 'Nova Configuração de Zap' : 'Editar Configuração de Zap'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Nome do Zap"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                placeholder="Ex: Zap51"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isActive}
                    onChange={handleInputChange}
                    name="isActive"
                    color="primary"
                  />
                }
                label="Ativo"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {dialogMode === 'create' ? 'Criar' : 'Salvar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notification */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseNotification}
          severity={notification.severity}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ZapConfigPage; 