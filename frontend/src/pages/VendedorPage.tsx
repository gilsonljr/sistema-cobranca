import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  InputAdornment,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Snackbar,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { Order } from '../types/Order';
import { OrderStatus } from '../types/api';
import AuthService from '../services/AuthService';
import ProductService from '../services/ProductService';
import { Offer } from '../types/Product';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { SelectChangeEvent } from '@mui/material/Select';

interface VendedorPageProps {
  orders: Order[];
  onOrdersUpdate: (orders: Order[]) => void;
}

const VendedorPage: React.FC<VendedorPageProps> = ({ orders, onOrdersUpdate }) => {
  // Estado para o usuário atual
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Estado para pedidos filtrados
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);

  // Estado para busca
  const [searchTerm, setSearchTerm] = useState('');

  // Estado para o diálogo de novo pedido
  const [newOrderDialogOpen, setNewOrderDialogOpen] = useState(false);

  // Estado para o formulário de novo pedido
  const [newOrderForm, setNewOrderForm] = useState({
    cliente: '',
    telefone: '',
    documentoCliente: '',
    ofertaId: '',
    valorVenda: '',
    estadoDestinatario: '',
    cidadeDestinatario: '',
    ruaDestinatario: '',
    cepDestinatario: '',
    complementoDestinatario: '',
    bairroDestinatario: '',
    numeroEnderecoDestinatario: '',
  });

  // Estado para ofertas disponíveis
  const [availableOffers, setAvailableOffers] = useState<Array<Offer & { productName: string, displayName: string }>>([]);

  // Estado para oferta selecionada
  const [selectedOffer, setSelectedOffer] = useState<(Offer & { productName: string, displayName: string }) | null>(null);

  // Estado para erros de validação
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Estado para notificações
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'info' | 'warning',
  });

  // Estado para carregamento
  const [loading, setLoading] = useState(false);

  // Estado para verificação de CPF
  const [cpfStatus, setCpfStatus] = useState<'valid' | 'invalid' | 'checking' | null>(null);

  // Estado para verificação de duplicidade
  const [duplicateStatus, setDuplicateStatus] = useState<'duplicate' | 'unique' | 'checking' | null>(null);

  // Carregar usuário atual e ofertas disponíveis
  useEffect(() => {
    // Carregar usuário
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      setCurrentUser(JSON.parse(userInfo));
    }

    // Carregar ofertas disponíveis
    const offers = ProductService.getAllActiveOffers();
    setAvailableOffers(offers);
  }, []);

  // Filtrar pedidos do vendedor atual
  useEffect(() => {
    if (currentUser && orders) {
      const vendedorOrders = orders.filter(order =>
        order.vendedor.toLowerCase() === currentUser.fullName.toLowerCase()
      );
      setFilteredOrders(vendedorOrders);
    }
  }, [currentUser, orders]);

  // Função para filtrar pedidos com base na busca
  useEffect(() => {
    if (currentUser && orders) {
      const vendedorOrders = orders.filter(order =>
        order.vendedor.toLowerCase() === currentUser.fullName.toLowerCase()
      );

      if (searchTerm.trim() === '') {
        setFilteredOrders(vendedorOrders);
      } else {
        const searchTermLower = searchTerm.toLowerCase();
        const filtered = vendedorOrders.filter(order =>
          order.cliente.toLowerCase().includes(searchTermLower) ||
          order.idVenda.toLowerCase().includes(searchTermLower) ||
          order.telefone.toLowerCase().includes(searchTermLower) ||
          order.documentoCliente.toLowerCase().includes(searchTermLower)
        );
        setFilteredOrders(filtered);
      }
    }
  }, [searchTerm, currentUser, orders]);

  // Função para abrir o diálogo de novo pedido
  const handleOpenNewOrderDialog = () => {
    setNewOrderForm({
      cliente: '',
      telefone: '',
      documentoCliente: '',
      ofertaId: '',
      valorVenda: '',
      estadoDestinatario: '',
      cidadeDestinatario: '',
      ruaDestinatario: '',
      cepDestinatario: '',
      complementoDestinatario: '',
      bairroDestinatario: '',
      numeroEnderecoDestinatario: '',
    });
    setFormErrors({});
    setCpfStatus(null);
    setDuplicateStatus(null);
    setSelectedOffer(null);
    setNewOrderDialogOpen(true);
  };

  // Função para fechar o diálogo de novo pedido
  const handleCloseNewOrderDialog = () => {
    setNewOrderDialogOpen(false);
  };

  // Função para atualizar o formulário de novo pedido (campos de texto)
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    if (name) {
      setNewOrderForm(prev => ({
        ...prev,
        [name]: value
      }));

      // Limpar erro do campo quando o usuário digita
      if (formErrors[name]) {
        setFormErrors(prev => ({
          ...prev,
          [name]: ''
        }));
      }

      // Verificar CPF quando o usuário terminar de digitar
      if (name === 'documentoCliente' && typeof value === 'string' && value.length === 11) {
        validateCPF(value);
      }
    }
  };

  // Função para atualizar o formulário quando um Select muda
  const handleSelectChange = (e: SelectChangeEvent<string>) => {
    const { name, value } = e.target;

    if (name) {
      setNewOrderForm(prev => ({
        ...prev,
        [name]: value
      }));

      // Limpar erro do campo quando o usuário seleciona uma opção
      if (formErrors[name]) {
        setFormErrors(prev => ({
          ...prev,
          [name]: ''
        }));
      }

      // Atualizar oferta selecionada e preço quando o usuário selecionar uma oferta
      if (name === 'ofertaId' && value) {
        const offer = ProductService.findOfferById(value);
        if (offer) {
          setSelectedOffer(offer);
          setNewOrderForm(prev => ({
            ...prev,
            valorVenda: offer.price.toString()
          }));
        } else {
          setSelectedOffer(null);
        }
      }
    }
  };

  // Função para validar CPF
  const validateCPF = async (cpf: string) => {
    // Simulação de validação de CPF
    setCpfStatus('checking');

    try {
      // Aqui seria a chamada para a API de validação de CPF
      // Por enquanto, vamos simular com um timeout
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Validação básica (apenas para demonstração)
      const isValid = cpf.length === 11 && /^\d+$/.test(cpf);
      setCpfStatus(isValid ? 'valid' : 'invalid');

      if (!isValid) {
        setFormErrors(prev => ({
          ...prev,
          documentoCliente: 'CPF inválido'
        }));
      }

      return isValid;
    } catch (error) {
      console.error('Erro ao validar CPF:', error);
      setCpfStatus('invalid');
      setFormErrors(prev => ({
        ...prev,
        documentoCliente: 'Erro ao validar CPF'
      }));
      return false;
    }
  };

  // Função para verificar duplicidade
  const checkDuplicate = async (form: typeof newOrderForm) => {
    setDuplicateStatus('checking');

    try {
      // Aqui seria a chamada para verificar duplicidade
      // Por enquanto, vamos simular com um timeout
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Verificar se já existe um pedido com o mesmo telefone e valor similar
      const possibleDuplicates = orders.filter(order => {
        // Verificar telefone
        const samePhone = order.telefone === form.telefone;

        // Verificar valor (com margem de 5%)
        const orderValue = parseFloat(form.valorVenda);
        const valueDiff = Math.abs(order.valorVenda - orderValue);
        const valueTolerance = order.valorVenda * 0.05; // 5% de tolerância
        const similarValue = valueDiff <= valueTolerance;

        return samePhone && similarValue;
      });

      const isDuplicate = possibleDuplicates.length > 0;
      setDuplicateStatus(isDuplicate ? 'duplicate' : 'unique');

      return { isDuplicate, possibleDuplicates };
    } catch (error) {
      console.error('Erro ao verificar duplicidade:', error);
      setDuplicateStatus(null);
      return { isDuplicate: false, possibleDuplicates: [] };
    }
  };

  // Função para validar o formulário
  const validateForm = () => {
    const errors: Record<string, string> = {};

    // Validar campos obrigatórios
    if (!newOrderForm.cliente.trim()) {
      errors.cliente = 'Nome do cliente é obrigatório';
    }

    if (!newOrderForm.telefone.trim()) {
      errors.telefone = 'Telefone é obrigatório';
    } else if (!/^\d{10,11}$/.test(newOrderForm.telefone.replace(/\D/g, ''))) {
      errors.telefone = 'Telefone inválido';
    }

    if (!newOrderForm.documentoCliente.trim()) {
      errors.documentoCliente = 'CPF é obrigatório';
    }

    if (!newOrderForm.ofertaId) {
      errors.ofertaId = 'Oferta é obrigatória';
    }

    if (!newOrderForm.valorVenda.trim()) {
      errors.valorVenda = 'Valor da venda é obrigatório';
    } else if (isNaN(parseFloat(newOrderForm.valorVenda.replace(',', '.')))) {
      errors.valorVenda = 'Valor inválido';
    }

    // Validar campos de endereço
    if (!newOrderForm.estadoDestinatario.trim()) {
      errors.estadoDestinatario = 'Estado é obrigatório';
    }

    if (!newOrderForm.cidadeDestinatario.trim()) {
      errors.cidadeDestinatario = 'Cidade é obrigatória';
    }

    if (!newOrderForm.ruaDestinatario.trim()) {
      errors.ruaDestinatario = 'Rua é obrigatória';
    }

    if (!newOrderForm.cepDestinatario.trim()) {
      errors.cepDestinatario = 'CEP é obrigatório';
    } else if (!/^\d{8}$/.test(newOrderForm.cepDestinatario.replace(/\D/g, ''))) {
      errors.cepDestinatario = 'CEP inválido';
    }

    if (!newOrderForm.numeroEnderecoDestinatario.trim()) {
      errors.numeroEnderecoDestinatario = 'Número é obrigatório';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Função para criar um novo pedido
  const handleCreateOrder = async () => {
    // Validar formulário
    if (!validateForm()) {
      setNotification({
        open: true,
        message: 'Por favor, corrija os erros no formulário',
        severity: 'error',
      });
      return;
    }

    // Validar CPF
    if (cpfStatus !== 'valid') {
      const isValid = await validateCPF(newOrderForm.documentoCliente);
      if (!isValid) {
        setNotification({
          open: true,
          message: 'CPF inválido',
          severity: 'error',
        });
        return;
      }
    }

    setLoading(true);

    try {
      // Verificar duplicidade
      const { isDuplicate, possibleDuplicates } = await checkDuplicate(newOrderForm);

      if (isDuplicate) {
        // Se for duplicado, enviar para aprovação
        setNotification({
          open: true,
          message: 'Pedido possivelmente duplicado. Enviado para aprovação.',
          severity: 'warning',
        });

        // Criar pedido com flag de duplicado
        createOrderWithDuplicateFlag(true, possibleDuplicates);
      } else {
        // Se não for duplicado, criar normalmente
        createOrderWithDuplicateFlag(false, []);
      }
    } catch (error) {
      console.error('Erro ao criar pedido:', error);
      setNotification({
        open: true,
        message: 'Erro ao criar pedido',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  // Função para criar pedido com flag de duplicado
  const createOrderWithDuplicateFlag = (isDuplicate: boolean, duplicates: Order[]) => {
    // Gerar ID de venda único
    const newId = `V${Date.now()}`;

    // Obter informações da oferta selecionada
    const selectedOfferInfo = ProductService.findOfferById(newOrderForm.ofertaId);
    if (!selectedOfferInfo) {
      console.error('Oferta não encontrada');
      return;
    }

    // Criar novo pedido
    const newOrder: Order = {
      idVenda: newId,
      dataVenda: format(new Date(), 'dd/MM/yyyy', { locale: ptBR }),
      cliente: newOrderForm.cliente,
      telefone: newOrderForm.telefone,
      documentoCliente: newOrderForm.documentoCliente,
      oferta: selectedOfferInfo.displayName,
      valorVenda: selectedOfferInfo.price,
      valorRecebido: 0,
      status: isDuplicate ? OrderStatus.PENDING : OrderStatus.PENDING,
      situacaoVenda: isDuplicate ? 'Aguardando Aprovação' : 'Pendente',
      historico: '',
      ultimaAtualizacao: format(new Date(), 'dd/MM/yyyy HH:mm', { locale: ptBR }),
      codigoRastreio: '',
      statusCorreios: '',
      atualizacaoCorreios: '',
      vendedor: currentUser?.fullName || '',
      operador: '',
      zap: newOrderForm.telefone,
      estadoDestinatario: newOrderForm.estadoDestinatario,
      cidadeDestinatario: newOrderForm.cidadeDestinatario,
      ruaDestinatario: newOrderForm.ruaDestinatario,
      cepDestinatario: newOrderForm.cepDestinatario,
      complementoDestinatario: newOrderForm.complementoDestinatario,
      bairroDestinatario: newOrderForm.bairroDestinatario,
      numeroEnderecoDestinatario: newOrderForm.numeroEnderecoDestinatario,
      dataEstimadaChegada: '',
      codigoAfiliado: '',
      nomeAfiliado: '',
      emailAfiliado: '',
      documentoAfiliado: '',
      dataRecebimento: '',
      dataNegociacao: '',
      formaPagamento: '',
      parcial: false,
      pagamentoParcial: 0,
      formaPagamentoParcial: '',
      dataPagamentoParcial: '',
      billingHistory: []
    };

    // Adicionar pedido à lista
    const updatedOrders = [...orders, newOrder];
    onOrdersUpdate(updatedOrders);

    // Fechar diálogo e mostrar notificação
    setNewOrderDialogOpen(false);
    setNotification({
      open: true,
      message: isDuplicate
        ? 'Pedido enviado para aprovação devido a possível duplicidade'
        : 'Pedido criado com sucesso',
      severity: isDuplicate ? 'warning' : 'success',
    });
  };

  // Função para fechar notificação
  const handleCloseNotification = () => {
    setNotification({
      ...notification,
      open: false,
    });
  };

  // Renderizar status do CPF
  const renderCpfStatus = () => {
    if (cpfStatus === 'checking') {
      return <CircularProgress size={20} />;
    } else if (cpfStatus === 'valid') {
      return <Chip label="CPF Válido" color="success" size="small" />;
    } else if (cpfStatus === 'invalid') {
      return <Chip label="CPF Inválido" color="error" size="small" />;
    }
    return null;
  };

  // Renderizar status de duplicidade
  const renderDuplicateStatus = () => {
    if (duplicateStatus === 'checking') {
      return <CircularProgress size={20} />;
    } else if (duplicateStatus === 'duplicate') {
      return <Chip label="Possível Duplicado" color="warning" size="small" />;
    } else if (duplicateStatus === 'unique') {
      return <Chip label="Único" color="success" size="small" />;
    }
    return null;
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Cabeçalho */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 500 }}>
          Meus Pedidos
        </Typography>

        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleOpenNewOrderDialog}
          sx={{ borderRadius: '8px' }}
        >
          Novo Pedido
        </Button>
      </Box>

      {/* Filtros e busca */}
      <Paper sx={{ p: 2, mb: 3, borderRadius: '12px' }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Buscar por cliente, ID, telefone ou CPF..."
              variant="outlined"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              size="small"
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Typography variant="body2" color="text.secondary">
                {filteredOrders.length} pedidos encontrados
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Tabela de pedidos */}
      <TableContainer component={Paper} sx={{ borderRadius: '12px', overflow: 'hidden' }}>
        <Table>
          <TableHead sx={{ bgcolor: '#f5f5f5' }}>
            <TableRow>
              <TableCell>ID Venda</TableCell>
              <TableCell>Cliente</TableCell>
              <TableCell>Data</TableCell>
              <TableCell>Valor</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Operador</TableCell>
              <TableCell>Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredOrders.length > 0 ? (
              filteredOrders.map((order) => (
                <TableRow key={order.idVenda}>
                  <TableCell>{order.idVenda}</TableCell>
                  <TableCell>{order.cliente}</TableCell>
                  <TableCell>{order.dataVenda}</TableCell>
                  <TableCell>R$ {order.valorVenda.toFixed(2)}</TableCell>
                  <TableCell>
                    <Chip
                      label={order.situacaoVenda}
                      color={
                        order.situacaoVenda === 'Pago' ? 'success' :
                        order.situacaoVenda === 'Parcialmente Pago' ? 'info' :
                        order.situacaoVenda === 'Aguardando Aprovação' ? 'warning' :
                        order.situacaoVenda === 'Cancelado' ? 'error' :
                        'default'
                      }
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{order.operador || '-'}</TableCell>
                  <TableCell>
                    <Tooltip title="Ver detalhes">
                      <IconButton size="small" color="primary">
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  Nenhum pedido encontrado
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Diálogo de novo pedido */}
      <Dialog
        open={newOrderDialogOpen}
        onClose={handleCloseNewOrderDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Novo Pedido
          <IconButton
            aria-label="close"
            onClick={handleCloseNewOrderDialog}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
          <Grid container spacing={2}>
            {/* Informações do cliente */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 500 }}>
                Informações do Cliente
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Nome do Cliente"
                name="cliente"
                value={newOrderForm.cliente}
                onChange={handleFormChange}
                error={!!formErrors.cliente}
                helperText={formErrors.cliente}
                required
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Telefone"
                name="telefone"
                value={newOrderForm.telefone}
                onChange={handleFormChange}
                error={!!formErrors.telefone}
                helperText={formErrors.telefone}
                required
                placeholder="(00) 00000-0000"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TextField
                  fullWidth
                  label="CPF"
                  name="documentoCliente"
                  value={newOrderForm.documentoCliente}
                  onChange={handleFormChange}
                  error={!!formErrors.documentoCliente}
                  helperText={formErrors.documentoCliente}
                  required
                  placeholder="000.000.000-00"
                />
                <Box sx={{ ml: 1, minWidth: 100 }}>
                  {renderCpfStatus()}
                </Box>
              </Box>
            </Grid>

            {/* Informações do pedido */}
            <Grid item xs={12} sx={{ mt: 2 }}>
              <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 500 }}>
                Informações do Pedido
              </Typography>
            </Grid>

            <Grid item xs={12} md={8}>
              <FormControl fullWidth error={!!formErrors.ofertaId} required>
                <InputLabel id="oferta-label">Oferta/Produto</InputLabel>
                <Select
                  labelId="oferta-label"
                  name="ofertaId"
                  value={newOrderForm.ofertaId}
                  onChange={handleSelectChange}
                  label="Oferta/Produto"
                >
                  {availableOffers.map((offer) => (
                    <MenuItem key={offer.id} value={offer.id}>
                      {offer.displayName} - R$ {offer.price.toFixed(2)}
                    </MenuItem>
                  ))}
                </Select>
                {formErrors.ofertaId && (
                  <Typography variant="caption" color="error">
                    {formErrors.ofertaId}
                  </Typography>
                )}
              </FormControl>
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Valor da Venda"
                name="valorVenda"
                value={newOrderForm.valorVenda}
                onChange={handleFormChange}
                error={!!formErrors.valorVenda}
                helperText={formErrors.valorVenda}
                required
                InputProps={{
                  startAdornment: <InputAdornment position="start">R$</InputAdornment>,
                  readOnly: !!selectedOffer, // Tornar o campo somente leitura quando uma oferta estiver selecionada
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Verificação de duplicidade:
                </Typography>
                {renderDuplicateStatus()}
              </Box>
            </Grid>

            {/* Endereço de entrega */}
            <Grid item xs={12} sx={{ mt: 2 }}>
              <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 500 }}>
                Endereço de Entrega
              </Typography>
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="CEP"
                name="cepDestinatario"
                value={newOrderForm.cepDestinatario}
                onChange={handleFormChange}
                error={!!formErrors.cepDestinatario}
                helperText={formErrors.cepDestinatario}
                required
                placeholder="00000-000"
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Estado"
                name="estadoDestinatario"
                value={newOrderForm.estadoDestinatario}
                onChange={handleFormChange}
                error={!!formErrors.estadoDestinatario}
                helperText={formErrors.estadoDestinatario}
                required
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Cidade"
                name="cidadeDestinatario"
                value={newOrderForm.cidadeDestinatario}
                onChange={handleFormChange}
                error={!!formErrors.cidadeDestinatario}
                helperText={formErrors.cidadeDestinatario}
                required
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Rua"
                name="ruaDestinatario"
                value={newOrderForm.ruaDestinatario}
                onChange={handleFormChange}
                error={!!formErrors.ruaDestinatario}
                helperText={formErrors.ruaDestinatario}
                required
              />
            </Grid>

            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Número"
                name="numeroEnderecoDestinatario"
                value={newOrderForm.numeroEnderecoDestinatario}
                onChange={handleFormChange}
                error={!!formErrors.numeroEnderecoDestinatario}
                helperText={formErrors.numeroEnderecoDestinatario}
                required
              />
            </Grid>

            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Complemento"
                name="complementoDestinatario"
                value={newOrderForm.complementoDestinatario}
                onChange={handleFormChange}
                error={!!formErrors.complementoDestinatario}
                helperText={formErrors.complementoDestinatario}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Bairro"
                name="bairroDestinatario"
                value={newOrderForm.bairroDestinatario}
                onChange={handleFormChange}
                error={!!formErrors.bairroDestinatario}
                helperText={formErrors.bairroDestinatario}
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleCloseNewOrderDialog}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleCreateOrder}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Criar Pedido'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notificação */}
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

export default VendedorPage;
