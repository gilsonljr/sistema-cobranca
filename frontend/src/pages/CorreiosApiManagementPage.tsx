import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Tabs,
  Tab,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  Divider,
  Alert,
  Snackbar,
  CircularProgress,
  Switch,
  FormControlLabel,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Settings as SettingsIcon,
  History as HistoryIcon,
  LocalShipping as LocalShippingIcon,
  Speed as SpeedIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  ContentCopy as ContentCopyIcon
} from '@mui/icons-material';
import PageHeader from '../components/PageHeader';
import CorreiosService, { TrackingInfo, TrackingEvent } from '../services/CorreiosService';
import api from '../services/api';
import AuthService from '../services/AuthService';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`correios-api-tabpanel-${index}`}
      aria-labelledby={`correios-api-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `correios-api-tab-${index}`,
    'aria-controls': `correios-api-tabpanel-${index}`,
  };
}

interface ApiSettings {
  apiUrl: string;
  apiKey: string;
  useMock: boolean;
}

interface ApiStatus {
  status: 'online' | 'offline' | 'unknown';
  lastChecked: string;
  responseTime: number;
}

interface TrackingHistoryItem {
  trackingCode: string;
  timestamp: string;
  status: string;
  success: boolean;
}

const CorreiosApiManagementPage: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [settings, setSettings] = useState<ApiSettings>({
    apiUrl: '',
    apiKey: '',
    useMock: false
  });
  const [apiStatus, setApiStatus] = useState<ApiStatus>({
    status: 'unknown',
    lastChecked: '-',
    responseTime: 0
  });
  const [trackingCode, setTrackingCode] = useState('');
  const [trackingResult, setTrackingResult] = useState<TrackingInfo | null>(null);
  const [trackingHistory, setTrackingHistory] = useState<TrackingHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'info' as 'success' | 'error' | 'info' | 'warning'
  });
  const [isAdmin, setIsAdmin] = useState(false);

  // Check if user is admin
  useEffect(() => {
    setIsAdmin(AuthService.isAdmin());
  }, []);

  // Load settings
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await api.get('/api/v1/settings/correios');
        setSettings(response.data);
      } catch (error) {
        console.error('Error loading Correios API settings:', error);
        // Load default settings if API call fails
        setSettings({
          apiUrl: process.env.REACT_APP_CORREIOS_API_URL || 'https://api.correios.com.br',
          apiKey: '',
          useMock: true
        });
      }
    };

    loadSettings();
  }, []);

  // Load tracking history
  useEffect(() => {
    const loadTrackingHistory = async () => {
      try {
        const response = await api.get('/api/v1/tracking/history');
        setTrackingHistory(response.data);
      } catch (error) {
        console.error('Error loading tracking history:', error);
        // Set empty history if API call fails
        setTrackingHistory([]);
      }
    };

    loadTrackingHistory();
  }, []);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleSettingsChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked } = event.target;
    setSettings(prev => ({
      ...prev,
      [name]: name === 'useMock' ? checked : value
    }));
  };

  const saveSettings = async () => {
    try {
      setLoading(true);
      await api.post('/api/v1/settings/correios', settings);
      showNotification('Configurações salvas com sucesso', 'success');
    } catch (error) {
      console.error('Error saving Correios API settings:', error);
      showNotification('Erro ao salvar configurações', 'error');
    } finally {
      setLoading(false);
    }
  };

  const checkApiStatus = async () => {
    try {
      setLoading(true);
      const startTime = Date.now();
      const response = await api.get('/api/v1/tracking/status');
      const endTime = Date.now();
      const responseTime = endTime - startTime;

      setApiStatus({
        status: response.data.status,
        lastChecked: new Date().toLocaleString('pt-BR'),
        responseTime
      });

      showNotification(
        `API ${response.data.status === 'online' ? 'online' : 'offline'}`,
        response.data.status === 'online' ? 'success' : 'error'
      );
    } catch (error) {
      console.error('Error checking API status:', error);
      setApiStatus({
        status: 'offline',
        lastChecked: new Date().toLocaleString('pt-BR'),
        responseTime: 0
      });
      showNotification('Erro ao verificar status da API', 'error');
    } finally {
      setLoading(false);
    }
  };

  const trackPackage = async () => {
    if (!trackingCode) {
      showNotification('Digite um código de rastreio', 'warning');
      return;
    }

    try {
      setLoading(true);
      const result = await CorreiosService.rastrearEncomenda(trackingCode);
      setTrackingResult(result);

      // Add to tracking history
      const newHistoryItem: TrackingHistoryItem = {
        trackingCode,
        timestamp: new Date().toLocaleString('pt-BR'),
        status: result.eventos && result.eventos.length > 0 ? result.eventos[0].status : 'Sem eventos',
        success: true
      };

      setTrackingHistory(prev => [newHistoryItem, ...prev].slice(0, 50));

      showNotification('Rastreamento realizado com sucesso', 'success');
    } catch (error) {
      console.error('Error tracking package:', error);
      setTrackingResult(null);

      // Add to tracking history
      const newHistoryItem: TrackingHistoryItem = {
        trackingCode,
        timestamp: new Date().toLocaleString('pt-BR'),
        status: 'Erro ao rastrear',
        success: false
      };

      setTrackingHistory(prev => [newHistoryItem, ...prev].slice(0, 50));

      showNotification('Erro ao rastrear encomenda', 'error');
    } finally {
      setLoading(false);
    }
  };

  const clearTrackingHistory = async () => {
    try {
      setLoading(true);
      await api.delete('/api/v1/tracking/history');
      setTrackingHistory([]);
      showNotification('Histórico de rastreamento limpo com sucesso', 'success');
    } catch (error) {
      console.error('Error clearing tracking history:', error);
      showNotification('Erro ao limpar histórico de rastreamento', 'error');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showNotification('Copiado para a área de transferência', 'success');
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

  return (
    <Container maxWidth="lg">
      <PageHeader title="Gerenciamento da API Correios" />

      <Paper sx={{ width: '100%', mb: 4 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="correios api tabs">
            <Tab label="Rastreamento" icon={<LocalShippingIcon />} iconPosition="start" {...a11yProps(0)} />
            <Tab label="Histórico" icon={<HistoryIcon />} iconPosition="start" {...a11yProps(1)} />
            <Tab label="Status da API" icon={<SpeedIcon />} iconPosition="start" {...a11yProps(2)} />
            {isAdmin && (
              <Tab label="Configurações" icon={<SettingsIcon />} iconPosition="start" {...a11yProps(3)} />
            )}
          </Tabs>
        </Box>

        {/* Rastreamento Tab */}
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Box display="flex" alignItems="center" gap={2}>
                <TextField
                  label="Código de Rastreio"
                  variant="outlined"
                  fullWidth
                  value={trackingCode}
                  onChange={(e) => setTrackingCode(e.target.value.toUpperCase())}
                  placeholder="Ex: LX002249507BR"
                  disabled={loading}
                />
                <Button
                  variant="contained"
                  color="primary"
                  onClick={trackPackage}
                  disabled={loading || !trackingCode}
                  startIcon={loading ? <CircularProgress size={20} /> : <LocalShippingIcon />}
                >
                  Rastrear
                </Button>
              </Box>
            </Grid>

            {trackingResult && (
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                      <Typography variant="h6">
                        Resultado do Rastreamento: {trackingResult.codigo}
                      </Typography>
                      <Chip
                        label={trackingResult.entregue ? 'Entregue' : 'Em trânsito'}
                        color={trackingResult.entregue ? 'success' : 'primary'}
                        icon={trackingResult.entregue ? <CheckCircleIcon /> : <LocalShippingIcon />}
                      />
                    </Box>

                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Serviço: {trackingResult.servico || 'Não informado'}
                    </Typography>

                    <Divider sx={{ my: 2 }} />

                    <Typography variant="subtitle1" gutterBottom>
                      Eventos:
                    </Typography>

                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Data</TableCell>
                            <TableCell>Hora</TableCell>
                            <TableCell>Local</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Detalhes</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {trackingResult.eventos.map((evento, index) => (
                            <TableRow key={index}>
                              <TableCell>{evento.data}</TableCell>
                              <TableCell>{evento.hora}</TableCell>
                              <TableCell>{evento.local}</TableCell>
                              <TableCell>{evento.status}</TableCell>
                              <TableCell>{evento.subStatus}</TableCell>
                            </TableRow>
                          ))}
                          {trackingResult.eventos.length === 0 && (
                            <TableRow>
                              <TableCell colSpan={5} align="center">
                                Nenhum evento encontrado
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </CardContent>
                  <CardActions>
                    <Button
                      size="small"
                      startIcon={<ContentCopyIcon />}
                      onClick={() => copyToClipboard(trackingResult.codigo)}
                    >
                      Copiar Código
                    </Button>
                    <Button
                      size="small"
                      href={`https://rastreamento.correios.com.br/app/index.php?objeto=${trackingResult.codigo}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Ver nos Correios
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            )}
          </Grid>
        </TabPanel>

        {/* Histórico Tab */}
        <TabPanel value={tabValue} index={1}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">
              Histórico de Rastreamento
            </Typography>
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={clearTrackingHistory}
              disabled={loading || trackingHistory.length === 0}
            >
              Limpar Histórico
            </Button>
          </Box>

          {trackingHistory.length === 0 ? (
            <Alert severity="info">
              Nenhum histórico de rastreamento encontrado
            </Alert>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Código de Rastreio</TableCell>
                    <TableCell>Data/Hora</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Resultado</TableCell>
                    <TableCell>Ações</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {trackingHistory.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{item.trackingCode}</TableCell>
                      <TableCell>{item.timestamp}</TableCell>
                      <TableCell>{item.status}</TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={item.success ? 'Sucesso' : 'Erro'}
                          color={item.success ? 'success' : 'error'}
                          icon={item.success ? <CheckCircleIcon /> : <ErrorIcon />}
                        />
                      </TableCell>
                      <TableCell>
                        <Tooltip title="Rastrear novamente">
                          <IconButton
                            size="small"
                            onClick={() => {
                              setTrackingCode(item.trackingCode);
                              setTabValue(0);
                            }}
                          >
                            <RefreshIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Copiar código">
                          <IconButton
                            size="small"
                            onClick={() => copyToClipboard(item.trackingCode)}
                          >
                            <ContentCopyIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </TabPanel>

        {/* Status da API Tab */}
        <TabPanel value={tabValue} index={2}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Status da API Correios
                  </Typography>
                  <Box display="flex" alignItems="center" gap={1} mb={2}>
                    <Typography>Status:</Typography>
                    <Chip
                      label={
                        apiStatus.status === 'online'
                          ? 'Online'
                          : apiStatus.status === 'offline'
                          ? 'Offline'
                          : 'Desconhecido'
                      }
                      color={
                        apiStatus.status === 'online'
                          ? 'success'
                          : apiStatus.status === 'offline'
                          ? 'error'
                          : 'default'
                      }
                      size="small"
                    />
                  </Box>
                  <Typography variant="body2" gutterBottom>
                    Última verificação: {apiStatus.lastChecked}
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    Tempo de resposta: {apiStatus.responseTime}ms
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button
                    startIcon={loading ? <CircularProgress size={20} /> : <RefreshIcon />}
                    onClick={checkApiStatus}
                    disabled={loading}
                  >
                    Verificar Status
                  </Button>
                </CardActions>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Informações da API
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    URL da API: {settings.apiUrl}
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    Modo de simulação: {settings.useMock ? 'Ativado' : 'Desativado'}
                  </Typography>
                  <Alert severity="info" sx={{ mt: 2 }}>
                    {settings.useMock
                      ? 'A API está em modo de simulação. Os dados de rastreamento são simulados.'
                      : 'A API está em modo de produção. Os dados de rastreamento são reais.'}
                  </Alert>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Configurações Tab (Admin Only) */}
        {isAdmin && (
          <TabPanel value={tabValue} index={3}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Alert severity="warning" sx={{ mb: 3 }}>
                  <Typography variant="subtitle1">
                    Atenção: Estas configurações afetam o funcionamento da API Correios.
                  </Typography>
                  <Typography variant="body2">
                    Altere apenas se souber o que está fazendo.
                  </Typography>
                </Alert>

                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Configurações da API Correios
                    </Typography>

                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <TextField
                          name="apiUrl"
                          label="URL da API"
                          variant="outlined"
                          fullWidth
                          value={settings.apiUrl}
                          onChange={handleSettingsChange}
                          margin="normal"
                          helperText="URL base da API Correios (ex: https://api.correios.com.br)"
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          name="apiKey"
                          label="Chave da API"
                          variant="outlined"
                          fullWidth
                          value={settings.apiKey}
                          onChange={handleSettingsChange}
                          margin="normal"
                          type="password"
                          helperText="Chave de autenticação da API Correios"
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <FormControlLabel
                          control={
                            <Switch
                              name="useMock"
                              checked={settings.useMock}
                              onChange={handleSettingsChange}
                              color="primary"
                            />
                          }
                          label="Usar dados simulados (modo de desenvolvimento)"
                        />
                      </Grid>
                    </Grid>
                  </CardContent>
                  <CardActions>
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
                      onClick={saveSettings}
                      disabled={loading}
                    >
                      Salvar Configurações
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            </Grid>
          </TabPanel>
        )}
      </Paper>

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
    </Container>
  );
};

export default CorreiosApiManagementPage;
