import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  FormControlLabel,
  Switch,
  Typography,
  Alert,
} from '@mui/material';

interface WebhookTesterProps {
  open: boolean;
  onClose: () => void;
}

const WebhookTester: React.FC<WebhookTesterProps> = ({ open, onClose }) => {
  const [webhookData, setWebhookData] = useState({
    dataVenda: new Date().toLocaleDateString('pt-BR'),
    idVenda: `WH${Math.floor(Math.random() * 100000)}`,
    cliente: '',
    telefone: '',
    oferta: '',
    valorVenda: '',
    status: '',
    situacaoVenda: '',
    valorRecebido: '',
    historico: '',
    ultimaAtualizacao: new Date().toLocaleDateString('pt-BR') + ' ' + new Date().toLocaleTimeString('pt-BR'),
    codigoRastreio: '',
    statusCorreios: '',
    vendedor: '',
    operador: '',
    zap: '',
    estadoDestinatario: '',
    cidadeDestinatario: '',
    ruaDestinatario: '',
    cepDestinatario: '',
    complementoDestinatario: '',
    bairroDestinatario: '',
    numeroEnderecoDestinatario: '',
    dataEstimadaChegada: '',
    codigoAfiliado: '',
    nomeAfiliado: '',
    emailAfiliado: '',
    documentoAfiliado: '',
    dataRecebimento: '',
    dataNegociacao: '',
    formaPagamento: '',
    documentoCliente: '',
    parcial: false,
    pagamentoParcial: '',
    formaPagamentoParcial: '',
    dataPagamentoParcial: '',
  });

  const [success, setSuccess] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setWebhookData({
      ...webhookData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = () => {
    // Enviar dados para o "webhook"
    window.postMessage(
      JSON.stringify({
        type: 'webhook',
        payload: webhookData,
      }),
      '*'
    );
    
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
    }, 3000);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Teste de Webhook</DialogTitle>
      <DialogContent>
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Dados enviados com sucesso!
          </Alert>
        )}
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Preencha os campos abaixo para simular um envio de dados via webhook.
        </Typography>
        
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography variant="subtitle1" fontWeight={500}>
              Dados Principais
            </Typography>
          </Grid>
          
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              name="dataVenda"
              label="Data Venda"
              value={webhookData.dataVenda}
              onChange={handleInputChange}
              fullWidth
              margin="dense"
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              name="idVenda"
              label="ID Venda"
              value={webhookData.idVenda}
              onChange={handleInputChange}
              fullWidth
              margin="dense"
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              name="cliente"
              label="Cliente"
              value={webhookData.cliente}
              onChange={handleInputChange}
              fullWidth
              margin="dense"
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              name="telefone"
              label="Telefone"
              value={webhookData.telefone}
              onChange={handleInputChange}
              fullWidth
              margin="dense"
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              name="oferta"
              label="Oferta"
              value={webhookData.oferta}
              onChange={handleInputChange}
              fullWidth
              margin="dense"
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              name="valorVenda"
              label="Valor Venda"
              value={webhookData.valorVenda}
              onChange={handleInputChange}
              fullWidth
              margin="dense"
              type="number"
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              name="status"
              label="Status"
              value={webhookData.status}
              onChange={handleInputChange}
              fullWidth
              margin="dense"
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              name="situacaoVenda"
              label="Situação Venda"
              value={webhookData.situacaoVenda}
              onChange={handleInputChange}
              fullWidth
              margin="dense"
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              name="valorRecebido"
              label="Valor Recebido"
              value={webhookData.valorRecebido}
              onChange={handleInputChange}
              fullWidth
              margin="dense"
              type="number"
            />
          </Grid>
          
          <Grid item xs={12}>
            <Typography variant="subtitle1" fontWeight={500} sx={{ mt: 2 }}>
              Dados Complementares
            </Typography>
          </Grid>
          
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              name="vendedor"
              label="Vendedor"
              value={webhookData.vendedor}
              onChange={handleInputChange}
              fullWidth
              margin="dense"
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              name="operador"
              label="Operador"
              value={webhookData.operador}
              onChange={handleInputChange}
              fullWidth
              margin="dense"
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              name="zap"
              label="WhatsApp (Zap)"
              value={webhookData.zap}
              onChange={handleInputChange}
              fullWidth
              margin="dense"
              placeholder="Identificador do WhatsApp"
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              name="dataNegociacao"
              label="Atualização de Cobrança"
              value={webhookData.dataNegociacao}
              onChange={handleInputChange}
              fullWidth
              margin="dense"
            />
          </Grid>
          
          <Grid item xs={12}>
            <Typography variant="subtitle1" fontWeight={500} sx={{ mt: 2 }}>
              Endereço do Cliente
            </Typography>
          </Grid>
          
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              name="cepDestinatario"
              label="CEP"
              value={webhookData.cepDestinatario}
              onChange={handleInputChange}
              fullWidth
              margin="dense"
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              name="ruaDestinatario"
              label="Rua"
              value={webhookData.ruaDestinatario}
              onChange={handleInputChange}
              fullWidth
              margin="dense"
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              name="numeroEnderecoDestinatario"
              label="Número"
              value={webhookData.numeroEnderecoDestinatario}
              onChange={handleInputChange}
              fullWidth
              margin="dense"
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              name="complementoDestinatario"
              label="Complemento"
              value={webhookData.complementoDestinatario}
              onChange={handleInputChange}
              fullWidth
              margin="dense"
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              name="bairroDestinatario"
              label="Bairro"
              value={webhookData.bairroDestinatario}
              onChange={handleInputChange}
              fullWidth
              margin="dense"
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              name="cidadeDestinatario"
              label="Cidade"
              value={webhookData.cidadeDestinatario}
              onChange={handleInputChange}
              fullWidth
              margin="dense"
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              name="estadoDestinatario"
              label="Estado"
              value={webhookData.estadoDestinatario}
              onChange={handleInputChange}
              fullWidth
              margin="dense"
            />
          </Grid>
          
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  name="parcial"
                  checked={webhookData.parcial}
                  onChange={handleInputChange}
                  color="primary"
                />
              }
              label="Pagamento Parcial"
            />
          </Grid>
          
          {webhookData.parcial && (
            <>
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  name="pagamentoParcial"
                  label="Valor Pagamento Parcial"
                  value={webhookData.pagamentoParcial}
                  onChange={handleInputChange}
                  fullWidth
                  margin="dense"
                  type="number"
                />
              </Grid>
              
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  name="formaPagamentoParcial"
                  label="Forma Pagamento Parcial"
                  value={webhookData.formaPagamentoParcial}
                  onChange={handleInputChange}
                  fullWidth
                  margin="dense"
                />
              </Grid>
              
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  name="dataPagamentoParcial"
                  label="Data Pagamento Parcial"
                  value={webhookData.dataPagamentoParcial}
                  onChange={handleInputChange}
                  fullWidth
                  margin="dense"
                />
              </Grid>
            </>
          )}
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">
          Enviar Dados
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default WebhookTester; 