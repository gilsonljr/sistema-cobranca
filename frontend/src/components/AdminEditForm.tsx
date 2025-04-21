import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Grid,
  Paper,
  TextField,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent
} from '@mui/material';
import { Order } from '../types/Order';
import ProductService from '../services/ProductService';

interface AdminEditFormProps {
  selectedOrder: Order;
  editedValues: Partial<Order>;
  handleEditChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleSaveEdit: () => void;
}

const AdminEditForm: React.FC<AdminEditFormProps> = ({
  selectedOrder,
  editedValues,
  handleEditChange,
  handleSaveEdit
}) => {
  // State for dropdown options
  const [vendedores, setVendedores] = useState<string[]>([]);
  const [operadores, setOperadores] = useState<string[]>([]);
  const [ofertas, setOfertas] = useState<Array<{value: string, label: string}>>([]);
  const [situacoesVenda, setSituacoesVenda] = useState<string[]>([]);

  // Load available options on component mount
  useEffect(() => {
    // Load vendedores (sellers)
    const loadVendedores = () => {
      // Get orders from localStorage
      const ordersData = localStorage.getItem('orders');
      if (ordersData) {
        const orders = JSON.parse(ordersData);
        // Extract unique vendedores
        const uniqueVendedores = Array.from(new Set(
          orders
            .map((order: Order) => order.vendedor)
            .filter((vendedor: string | undefined) => vendedor && vendedor.trim() !== '')
        )) as string[];
        setVendedores(uniqueVendedores.sort());
      }
    };

    // Load operadores (operators)
    const loadOperadores = () => {
      // Get orders from localStorage
      const ordersData = localStorage.getItem('orders');
      if (ordersData) {
        const orders = JSON.parse(ordersData);
        // Extract unique operadores
        const uniqueOperadores = Array.from(new Set(
          orders
            .map((order: Order) => order.operador)
            .filter((operador: string | undefined) => operador && operador.trim() !== '')
        )) as string[];
        setOperadores(uniqueOperadores.sort());
      }
    };

    // Load ofertas (offers)
    const loadOfertas = () => {
      const allOffers = ProductService.getAllActiveOffers();
      const offerOptions = allOffers.map(offer => ({
        value: `${offer.productName} - ${offer.name}`,
        label: `${offer.productName} - ${offer.name}`
      }));
      setOfertas(offerOptions);
    };

    // Load situações de venda (sale statuses)
    const loadSituacoesVenda = () => {
      // Common sale statuses
      const commonStatuses = [
        'Pendente',
        'Pagamento Pendente',
        'Completo',
        'Cancelado',
        'Em Separação',
        'Frustrado',
        'Recuperação',
        'Negociação',
        'Devolvido Correios',
        'Liberação',
        'Possíveis Duplicados',
        'Aguardando Aprovação',
        'Aprovado',
        'Em Trânsito',
        'Entregue'
      ];

      // Get additional statuses from orders
      const ordersData = localStorage.getItem('orders');
      if (ordersData) {
        const orders = JSON.parse(ordersData);
        // Extract unique statuses
        const uniqueStatuses = Array.from(new Set(
          orders
            .map((order: Order) => order.situacaoVenda)
            .filter((status: string | undefined) => status && status.trim() !== '')
        )) as string[];

        // Combine and deduplicate
        const allStatuses = Array.from(new Set([...commonStatuses, ...uniqueStatuses])) as string[];
        setSituacoesVenda(allStatuses.sort());
      } else {
        setSituacoesVenda(commonStatuses);
      }
    };

    // Load all options
    loadVendedores();
    loadOperadores();
    loadOfertas();
    loadSituacoesVenda();
  }, []);

  // Handle select changes
  const handleSelectChange = (e: SelectChangeEvent<string>) => {
    const { name, value } = e.target;
    const event = {
      target: { name, value }
    } as React.ChangeEvent<HTMLInputElement>;
    handleEditChange(event);
  };
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
        Editar Informações (Modo Administrador)
      </Typography>

      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Typography variant="subtitle2" sx={{ mt: 1, mb: 1, color: '#637381', fontWeight: 600 }}>
            Informações de Pagamento
          </Typography>
        </Grid>

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

        <Grid item xs={12} sm={6}>
          <TextField
            label="Forma de Pagamento"
            name="formaPagamento"
            value={editedValues.formaPagamento !== undefined ? editedValues.formaPagamento : selectedOrder?.formaPagamento || ''}
            onChange={handleEditChange}
            fullWidth
            size="small"
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            label="Data Recebimento"
            name="dataRecebimento"
            value={editedValues.dataRecebimento !== undefined ? editedValues.dataRecebimento : selectedOrder?.dataRecebimento || ''}
            onChange={handleEditChange}
            fullWidth
            size="small"
            placeholder="DD/MM/AAAA"
          />
        </Grid>

        <Grid item xs={12}>
          <Typography variant="subtitle2" sx={{ mt: 2, mb: 1, color: '#637381', fontWeight: 600 }}>
            Informações do Cliente
          </Typography>
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            label="Nome do Cliente"
            name="cliente"
            value={editedValues.cliente !== undefined ? editedValues.cliente : selectedOrder?.cliente || ''}
            onChange={handleEditChange}
            fullWidth
            size="small"
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            label="Telefone"
            name="telefone"
            value={editedValues.telefone !== undefined ? editedValues.telefone : selectedOrder?.telefone || ''}
            onChange={handleEditChange}
            fullWidth
            size="small"
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            label="Documento do Cliente"
            name="documentoCliente"
            value={editedValues.documentoCliente !== undefined ? editedValues.documentoCliente : selectedOrder?.documentoCliente || ''}
            onChange={handleEditChange}
            fullWidth
            size="small"
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <FormControl fullWidth size="small">
            <InputLabel id="oferta-label">Oferta</InputLabel>
            <Select
              labelId="oferta-label"
              name="oferta"
              value={editedValues.oferta !== undefined ? editedValues.oferta : selectedOrder?.oferta || ''}
              onChange={handleSelectChange}
              label="Oferta"
            >
              {ofertas.map((oferta) => (
                <MenuItem key={oferta.value} value={oferta.value}>
                  {oferta.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            label="Valor da Venda"
            name="valorVenda"
            value={editedValues.valorVenda !== undefined ? editedValues.valorVenda : selectedOrder?.valorVenda || ''}
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
            label="Código de Rastreio"
            name="codigoRastreio"
            value={editedValues.codigoRastreio !== undefined ? editedValues.codigoRastreio : selectedOrder?.codigoRastreio || ''}
            onChange={handleEditChange}
            fullWidth
            size="small"
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <FormControl fullWidth size="small">
            <InputLabel id="vendedor-label">Vendedor</InputLabel>
            <Select
              labelId="vendedor-label"
              name="vendedor"
              value={editedValues.vendedor !== undefined ? editedValues.vendedor : selectedOrder?.vendedor || ''}
              onChange={handleSelectChange}
              label="Vendedor"
            >
              {vendedores.map((vendedor) => (
                <MenuItem key={vendedor} value={vendedor}>
                  {vendedor}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={6}>
          <FormControl fullWidth size="small">
            <InputLabel id="operador-label">Operador</InputLabel>
            <Select
              labelId="operador-label"
              name="operador"
              value={editedValues.operador !== undefined ? editedValues.operador : selectedOrder?.operador || ''}
              onChange={handleSelectChange}
              label="Operador"
            >
              {operadores.map((operador) => (
                <MenuItem key={operador} value={operador}>
                  {operador}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={6}>
          <FormControl fullWidth size="small">
            <InputLabel id="situacaoVenda-label">Situação da Venda</InputLabel>
            <Select
              labelId="situacaoVenda-label"
              name="situacaoVenda"
              value={editedValues.situacaoVenda !== undefined ? editedValues.situacaoVenda : selectedOrder?.situacaoVenda || ''}
              onChange={handleSelectChange}
              label="Situação da Venda"
            >
              {situacoesVenda.map((situacao) => (
                <MenuItem key={situacao} value={situacao}>
                  {situacao}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12}>
          <Typography variant="subtitle2" sx={{ mt: 2, mb: 1, color: '#637381', fontWeight: 600 }}>
            Endereço de Entrega
          </Typography>
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            label="Rua"
            name="ruaDestinatario"
            value={editedValues.ruaDestinatario !== undefined ? editedValues.ruaDestinatario : selectedOrder?.ruaDestinatario || ''}
            onChange={handleEditChange}
            fullWidth
            size="small"
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            label="Número"
            name="numeroEnderecoDestinatario"
            value={editedValues.numeroEnderecoDestinatario !== undefined ? editedValues.numeroEnderecoDestinatario : selectedOrder?.numeroEnderecoDestinatario || ''}
            onChange={handleEditChange}
            fullWidth
            size="small"
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            label="Complemento"
            name="complementoDestinatario"
            value={editedValues.complementoDestinatario !== undefined ? editedValues.complementoDestinatario : selectedOrder?.complementoDestinatario || ''}
            onChange={handleEditChange}
            fullWidth
            size="small"
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            label="Bairro"
            name="bairroDestinatario"
            value={editedValues.bairroDestinatario !== undefined ? editedValues.bairroDestinatario : selectedOrder?.bairroDestinatario || ''}
            onChange={handleEditChange}
            fullWidth
            size="small"
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            label="CEP"
            name="cepDestinatario"
            value={editedValues.cepDestinatario !== undefined ? editedValues.cepDestinatario : selectedOrder?.cepDestinatario || ''}
            onChange={handleEditChange}
            fullWidth
            size="small"
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            label="Cidade"
            name="cidadeDestinatario"
            value={editedValues.cidadeDestinatario !== undefined ? editedValues.cidadeDestinatario : selectedOrder?.cidadeDestinatario || ''}
            onChange={handleEditChange}
            fullWidth
            size="small"
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            label="Estado"
            name="estadoDestinatario"
            value={editedValues.estadoDestinatario !== undefined ? editedValues.estadoDestinatario : selectedOrder?.estadoDestinatario || ''}
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

export default AdminEditForm;
