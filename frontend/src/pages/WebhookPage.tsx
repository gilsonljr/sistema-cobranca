import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Alert,
  AlertTitle,
  Snackbar,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  SelectChangeEvent,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LinkIcon from '@mui/icons-material/Link';
import CodeIcon from '@mui/icons-material/Code';
import SettingsIcon from '@mui/icons-material/Settings';

const WebhookPage: React.FC = () => {
  const [webhookUrl, setWebhookUrl] = useState('https://api.sistema.com/webhook/receber');
  const [eventType, setEventType] = useState('novo_pedido');
  const [testPayload, setTestPayload] = useState(
    JSON.stringify({
      event: 'novo_pedido',
      data: {
        idVenda: '12345',
        cliente: 'João Silva',
        valor: 150.99,
        dataVenda: '2023-05-15',
        situacaoVenda: 'Pagamento Pendente'
      }
    }, null, 2)
  );

  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
    details?: string;
  } | null>(null);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
  });

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setWebhookUrl(e.target.value);
  };

  const handleEventTypeChange = (e: SelectChangeEvent) => {
    const newEventType = e.target.value;
    setEventType(newEventType);

    // Atualizar o payload de exemplo com base no tipo de evento
    let samplePayload;
    switch (newEventType) {
      case 'novo_pedido':
        samplePayload = {
          event: 'novo_pedido',
          data: {
            idVenda: '12345',
            cliente: 'João Silva',
            valor: 150.99,
            dataVenda: '2023-05-15',
            situacaoVenda: 'Pagamento Pendente'
          }
        };
        break;
      case 'atualizacao_status':
        samplePayload = {
          event: 'atualizacao_status',
          data: {
            idVenda: '12345',
            statusAntigo: 'Pagamento Pendente',
            statusNovo: 'Completo',
            dataAtualizacao: '2023-05-16T14:30:00'
          }
        };
        break;
      case 'cancelamento':
        samplePayload = {
          event: 'cancelamento',
          data: {
            idVenda: '12345',
            motivo: 'Solicitação do cliente',
            dataCancelamento: '2023-05-17T10:15:00'
          }
        };
        break;
      default:
        samplePayload = {
          event: newEventType,
          data: {
            timestamp: new Date().toISOString()
          }
        };
    }

    setTestPayload(JSON.stringify(samplePayload, null, 2));
  };

  const handlePayloadChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTestPayload(e.target.value);
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(webhookUrl);
    setSnackbar({
      open: true,
      message: 'URL copiada para a área de transferência!',
    });
  };

  const handleSendTest = () => {
    // Simulação de envio de webhook
    setTestResult(null);

    setTimeout(() => {
      // Simulação de resultado (sucesso ou falha aleatória)
      if (Math.random() > 0.3) {
        setTestResult({
          success: true,
          message: 'Webhook enviado com sucesso!',
          details: 'Resposta: HTTP 200 OK - Payload recebido e processado.'
        });
      } else {
        setTestResult({
          success: false,
          message: 'Falha ao enviar webhook',
          details: 'Erro: HTTP 404 Not Found - Endpoint não encontrado ou inacessível.'
        });
      }
    }, 1500);
  };

  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false,
    });
  };

  return (
    <Box sx={{ p: 3, bgcolor: '#f9fafc' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 500, color: '#334155' }}>
          Testar Webhook
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.1)' }}>
            <Typography variant="h6" sx={{ fontWeight: 500, color: '#334155', mb: 2 }}>
              Configuração do Webhook
            </Typography>

            <Box sx={{ display: 'flex', mb: 3 }}>
              <TextField
                fullWidth
                label="URL do Webhook"
                value={webhookUrl}
                onChange={handleUrlChange}
                variant="outlined"
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
              />
              <Button
                variant="outlined"
                onClick={handleCopyUrl}
                sx={{
                  ml: 1,
                  minWidth: 'auto',
                  borderRadius: '8px',
                  borderColor: '#e2e8f0',
                  color: '#64748b',
                  '&:hover': { borderColor: '#cbd5e1', bgcolor: '#f8fafc' }
                }}
              >
                <ContentCopyIcon />
              </Button>
            </Box>

            <FormControl fullWidth sx={{ mb: 3, '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}>
              <InputLabel id="event-type-label">Tipo de Evento</InputLabel>
              <Select
                labelId="event-type-label"
                value={eventType}
                onChange={handleEventTypeChange}
                label="Tipo de Evento"
              >
                <MenuItem value="novo_pedido">Novo Pedido</MenuItem>
                <MenuItem value="atualizacao_status">Atualização de Status</MenuItem>
                <MenuItem value="cancelamento">Cancelamento</MenuItem>
                <MenuItem value="pagamento_confirmado">Pagamento Confirmado</MenuItem>
                <MenuItem value="custom">Personalizado</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Payload de Teste (JSON)"
              multiline
              rows={10}
              value={testPayload}
              onChange={handlePayloadChange}
              variant="outlined"
              sx={{
                mb: 3,
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px',
                  fontFamily: 'monospace',
                  fontSize: '0.875rem'
                }
              }}
            />

            <Button
              variant="contained"
              color="primary"
              startIcon={<SendIcon />}
              onClick={handleSendTest}
              sx={{
                borderRadius: '8px',
                textTransform: 'none',
                boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                bgcolor: '#3b82f6',
                '&:hover': { bgcolor: '#2563eb' }
              }}
            >
              Enviar Teste
            </Button>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.1)', mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 500, color: '#334155', mb: 2 }}>
              Informações sobre Webhooks
            </Typography>

            <Alert severity="info" sx={{ mb: 3, borderRadius: '8px' }}>
              <AlertTitle>O que são Webhooks?</AlertTitle>
              Webhooks são callbacks HTTP automatizados que são acionados por eventos específicos no sistema.
            </Alert>

            <Typography variant="body2" sx={{ mb: 2 }}>
              Utilize webhooks para receber notificações em tempo real sobre eventos importantes no sistema, como novos pedidos,
              atualizações de status, confirmações de pagamento e mais.
            </Typography>

            <Divider sx={{ my: 2 }} />

            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              Eventos Disponíveis:
            </Typography>

            <List dense>
              <ListItem>
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <CheckCircleIcon fontSize="small" color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary="Novo Pedido"
                  secondary="Enviado quando um novo pedido é criado"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <CheckCircleIcon fontSize="small" color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary="Atualização de Status"
                  secondary="Enviado quando o status de um pedido é alterado"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <CheckCircleIcon fontSize="small" color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary="Cancelamento"
                  secondary="Enviado quando um pedido é cancelado"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <CheckCircleIcon fontSize="small" color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary="Pagamento Confirmado"
                  secondary="Enviado quando um pagamento é confirmado"
                />
              </ListItem>
            </List>
          </Paper>

          {testResult && (
            <Card
              sx={{
                borderRadius: '12px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.1)',
                borderLeft: `4px solid ${testResult.success ? '#4caf50' : '#f44336'}`
              }}
            >
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 500, color: testResult.success ? '#2e7d32' : '#d32f2f', mb: 1 }}>
                  {testResult.message}
                </Typography>
                {testResult.details && (
                  <Typography variant="body2" sx={{ fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
                    {testResult.details}
                  </Typography>
                )}
              </CardContent>
            </Card>
          )}

          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              Links Úteis:
            </Typography>

            <List dense>
              <ListItem button component="a" href="/docs/webhooks" target="_blank">
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <CodeIcon fontSize="small" color="primary" />
                </ListItemIcon>
                <ListItemText primary="Documentação de Webhooks" />
              </ListItem>
              <ListItem button component="a" href="/settings/webhooks" target="_blank">
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <SettingsIcon fontSize="small" color="primary" />
                </ListItemIcon>
                <ListItemText primary="Configurações Avançadas" />
              </ListItem>
              <ListItem button component="a" href="https://webhook.site/" target="_blank">
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <LinkIcon fontSize="small" color="primary" />
                </ListItemIcon>
                <ListItemText primary="Webhook.site (Ferramenta de Teste)" />
              </ListItem>
            </List>
          </Box>
        </Grid>
      </Grid>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        message={snackbar.message}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Box>
  );
};

export default WebhookPage;
