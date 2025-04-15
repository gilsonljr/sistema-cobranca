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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Chip,
  Switch,
  FormControlLabel,
  Divider,
  Snackbar,
  Alert,
  Tooltip,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
  Search as SearchIcon,
  AddCircleOutline as AddCircleOutlineIcon,
} from '@mui/icons-material';
import { Product, Offer, VariationType, generateId } from '../types/Product';
import ProductService from '../services/ProductService';

const ProductsPage: React.FC = () => {
  // Estado para produtos
  const [products, setProducts] = useState<Product[]>([]);

  // Estado para busca
  const [searchTerm, setSearchTerm] = useState('');

  // Estado para diálogos
  const [productDialogOpen, setProductDialogOpen] = useState(false);
  const [offerDialogOpen, setOfferDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Estado para produto/oferta selecionados
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);

  // Estado para formulários
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    active: true,
  });

  const [offerForm, setOfferForm] = useState({
    name: '',
    description: '',
    price: '',
    active: true,
    gelQuantity: 0,
    capsulasQuantity: 0,
  });

  // Estado para notificações
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'info' | 'warning',
  });

  // Estado para modo de edição
  const [isEditMode, setIsEditMode] = useState(false);

  // Carregar produtos
  useEffect(() => {
    loadProducts();
  }, []);

  // Função para carregar produtos
  const loadProducts = () => {
    const loadedProducts = ProductService.getProducts();
    setProducts(loadedProducts);
  };

  // Função para filtrar produtos
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Funções para diálogo de produto
  const handleOpenProductDialog = (product?: Product) => {
    if (product) {
      setProductForm({
        name: product.name,
        description: product.description || '',
        active: product.active,
      });
      setSelectedProduct(product);
      setIsEditMode(true);
    } else {
      setProductForm({
        name: '',
        description: '',
        active: true,
      });
      setSelectedProduct(null);
      setIsEditMode(false);
    }
    setProductDialogOpen(true);
  };

  const handleCloseProductDialog = () => {
    setProductDialogOpen(false);
  };

  // Funções para diálogo de oferta
  const handleOpenOfferDialog = (product: Product, offer?: Offer) => {
    setSelectedProduct(product);

    if (offer) {
      setOfferForm({
        name: offer.name,
        description: offer.description || '',
        price: offer.price.toString(),
        active: offer.active,
        gelQuantity: offer.gelQuantity || 0,
        capsulasQuantity: offer.capsulasQuantity || 0,
      });
      setSelectedOffer(offer);
      setIsEditMode(true);
    } else {
      setOfferForm({
        name: '',
        description: '',
        price: '',
        active: true,
        gelQuantity: 0,
        capsulasQuantity: 0,
      });
      setSelectedOffer(null);
      setIsEditMode(false);
    }
    setOfferDialogOpen(true);
  };

  const handleCloseOfferDialog = () => {
    setOfferDialogOpen(false);
  };

  // Funções para diálogo de exclusão
  const handleOpenDeleteDialog = (product: Product, offer?: Offer) => {
    setSelectedProduct(product);
    setSelectedOffer(offer || null);
    setDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
  };

  // Funções para formulários
  const handleProductFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked } = e.target;
    setProductForm(prev => ({
      ...prev,
      [name]: name === 'active' ? checked : value,
    }));
  };

  // Manipulador para campos de texto (TextField)
  const handleOfferTextChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setOfferForm(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  // Manipulador para campos de seleção (Select)
  const handleOfferSelectChange = (e: SelectChangeEvent) => {
    const { name, value } = e.target;
    setOfferForm(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  // Manipulador para switches
  const handleOfferSwitchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setOfferForm(prev => ({
      ...prev,
      [name]: checked,
    }));
  };

  // Funções para salvar
  const handleSaveProduct = () => {
    if (!productForm.name.trim()) {
      setNotification({
        open: true,
        message: 'O nome do produto é obrigatório',
        severity: 'error',
      });
      return;
    }

    try {
      if (isEditMode && selectedProduct) {
        // Atualizar produto existente
        ProductService.updateProduct(selectedProduct.id, {
          name: productForm.name,
          description: productForm.description,
          active: productForm.active,
        });
      } else {
        // Adicionar novo produto
        ProductService.addProduct({
          name: productForm.name,
          description: productForm.description,
          active: productForm.active,
          offers: [],
        });
      }

      loadProducts();
      handleCloseProductDialog();

      setNotification({
        open: true,
        message: isEditMode ? 'Produto atualizado com sucesso' : 'Produto criado com sucesso',
        severity: 'success',
      });
    } catch (error) {
      console.error('Erro ao salvar produto:', error);
      setNotification({
        open: true,
        message: 'Erro ao salvar produto',
        severity: 'error',
      });
    }
  };

  const handleSaveOffer = () => {
    if (!offerForm.name.trim()) {
      setNotification({
        open: true,
        message: 'O nome da oferta é obrigatório',
        severity: 'error',
      });
      return;
    }

    if (!offerForm.price.trim() || isNaN(parseFloat(offerForm.price))) {
      setNotification({
        open: true,
        message: 'O preço da oferta é obrigatório e deve ser um número válido',
        severity: 'error',
      });
      return;
    }

    // Verificar se pelo menos uma quantidade foi especificada
    if (offerForm.gelQuantity <= 0 && offerForm.capsulasQuantity <= 0) {
      setNotification({
        open: true,
        message: 'Especifique pelo menos uma quantidade (Gel ou Cápsulas)',
        severity: 'error',
      });
      return;
    }

    // Determinar a variação automaticamente com base nas quantidades
    let variation: VariationType = 'gel';
    if (offerForm.gelQuantity <= 0 && offerForm.capsulasQuantity > 0) {
      variation = 'capsulas';
    }

    try {
      if (isEditMode && selectedProduct && selectedOffer) {
        // Atualizar oferta existente
        ProductService.updateOffer(selectedProduct.id, selectedOffer.id, {
          name: offerForm.name,
          description: offerForm.description,
          price: parseFloat(offerForm.price),
          active: offerForm.active,
          variation: variation, // Usa a variação determinada automaticamente
          gelQuantity: offerForm.gelQuantity,
          capsulasQuantity: offerForm.capsulasQuantity,
        });
      } else if (selectedProduct) {
        // Adicionar nova oferta
        ProductService.addOffer(selectedProduct.id, {
          name: offerForm.name,
          description: offerForm.description,
          price: parseFloat(offerForm.price),
          active: offerForm.active,
          variation: variation, // Usa a variação determinada automaticamente
          gelQuantity: offerForm.gelQuantity,
          capsulasQuantity: offerForm.capsulasQuantity,
        });
      }

      loadProducts();
      handleCloseOfferDialog();

      setNotification({
        open: true,
        message: isEditMode ? 'Oferta atualizada com sucesso' : 'Oferta criada com sucesso',
        severity: 'success',
      });
    } catch (error) {
      console.error('Erro ao salvar oferta:', error);
      setNotification({
        open: true,
        message: 'Erro ao salvar oferta',
        severity: 'error',
      });
    }
  };

  // Função para excluir
  const handleDelete = () => {
    try {
      if (selectedOffer && selectedProduct) {
        // Excluir oferta
        const result = ProductService.deleteOffer(selectedProduct.id, selectedOffer.id);

        if (result.success) {
          if (result.inactivated) {
            setNotification({
              open: true,
              message: 'Oferta inativada com sucesso (não pode ser excluída pois está sendo usada em pedidos)',
              severity: 'info',
            });
          } else {
            setNotification({
              open: true,
              message: 'Oferta excluída com sucesso',
              severity: 'success',
            });
          }
        } else {
          setNotification({
            open: true,
            message: 'Não foi possível excluir a oferta',
            severity: 'error',
          });
        }
      } else if (selectedProduct) {
        // Excluir produto
        ProductService.deleteProduct(selectedProduct.id);
        setNotification({
          open: true,
          message: 'Produto excluído com sucesso',
          severity: 'success',
        });
      }

      loadProducts();
      handleCloseDeleteDialog();
    } catch (error) {
      console.error('Erro ao excluir:', error);
      setNotification({
        open: true,
        message: 'Erro ao excluir',
        severity: 'error',
      });
    }
  };

  // Função para fechar notificação
  const handleCloseNotification = () => {
    setNotification({
      ...notification,
      open: false,
    });
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Cabeçalho */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 500 }}>
          Gerenciamento de Produtos e Ofertas
        </Typography>

        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpenProductDialog()}
          sx={{ borderRadius: '8px' }}
        >
          Novo Produto
        </Button>
      </Box>

      {/* Filtros e busca */}
      <Paper sx={{ p: 2, mb: 3, borderRadius: '12px' }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Buscar produtos..."
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
                {filteredProducts.length} produtos encontrados
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Lista de produtos */}
      {filteredProducts.length > 0 ? (
        filteredProducts.map((product) => (
          <Paper
            key={product.id}
            sx={{
              mb: 3,
              borderRadius: '12px',
              overflow: 'hidden',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}
          >
            {/* Cabeçalho do produto */}
            <Box
              sx={{
                p: 2,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                bgcolor: product.active ? 'rgba(33, 150, 243, 0.05)' : 'rgba(0, 0, 0, 0.05)'
              }}
            >
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 500 }}>
                  {product.name}
                  {!product.active && (
                    <Chip
                      label="Inativo"
                      size="small"
                      color="default"
                      sx={{ ml: 1, fontSize: '0.7rem' }}
                    />
                  )}
                </Typography>
                {product.description && (
                  <Typography variant="body2" color="text.secondary">
                    {product.description}
                  </Typography>
                )}
              </Box>

              <Box>
                <Tooltip title="Adicionar Oferta">
                  <IconButton
                    color="primary"
                    onClick={() => handleOpenOfferDialog(product)}
                  >
                    <AddCircleOutlineIcon />
                  </IconButton>
                </Tooltip>

                <Tooltip title="Editar Produto">
                  <IconButton
                    color="primary"
                    onClick={() => handleOpenProductDialog(product)}
                  >
                    <EditIcon />
                  </IconButton>
                </Tooltip>

                <Tooltip title="Excluir Produto">
                  <IconButton
                    color="error"
                    onClick={() => handleOpenDeleteDialog(product)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>

            {/* Tabela de ofertas */}
            <TableContainer>
              <Table size="small">
                <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                  <TableRow>
                    <TableCell>Nome da Oferta</TableCell>
                    <TableCell>Descrição</TableCell>
                    <TableCell align="right">Preço</TableCell>
                    <TableCell align="center">Gel</TableCell>
                    <TableCell align="center">Cápsulas</TableCell>
                    <TableCell align="center">Status</TableCell>
                    <TableCell align="right">Ações</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {product.offers.length > 0 ? (
                    product.offers.map((offer) => (
                      <TableRow key={offer.id}>
                        <TableCell>{offer.name}</TableCell>
                        <TableCell>{offer.description || '-'}</TableCell>
                        <TableCell align="right">
                          R$ {offer.price.toFixed(2)}
                        </TableCell>
                        <TableCell align="center">
                          {offer.gelQuantity > 0 ? (
                            <Chip
                              label={`${offer.gelQuantity} un.`}
                              color="primary"
                              size="small"
                              variant="outlined"
                            />
                          ) : '-'}
                        </TableCell>
                        <TableCell align="center">
                          {offer.capsulasQuantity > 0 ? (
                            <Chip
                              label={`${offer.capsulasQuantity} un.`}
                              color="secondary"
                              size="small"
                              variant="outlined"
                            />
                          ) : '-'}
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={offer.active ? 'Ativo' : 'Inativo'}
                            color={offer.active ? 'success' : 'default'}
                            size="small"
                          />
                          {offer.inUse && (
                            <Chip
                              label="Em uso"
                              color="info"
                              size="small"
                              sx={{ ml: 1 }}
                            />
                          )}
                        </TableCell>
                        <TableCell align="right">
                          <Tooltip title="Editar Oferta">
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => handleOpenOfferDialog(product, offer)}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>

                          <Tooltip title="Excluir Oferta">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleOpenDeleteDialog(product, offer)}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        Nenhuma oferta cadastrada para este produto
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        ))
      ) : (
        <Paper sx={{ p: 3, borderRadius: '12px', textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary">
            Nenhum produto encontrado
          </Typography>
        </Paper>
      )}

      {/* Diálogo de produto */}
      <Dialog
        open={productDialogOpen}
        onClose={handleCloseProductDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {isEditMode ? 'Editar Produto' : 'Novo Produto'}
          <IconButton
            aria-label="close"
            onClick={handleCloseProductDialog}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Nome do Produto"
                name="name"
                value={productForm.name}
                onChange={handleProductFormChange}
                required
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Descrição"
                name="description"
                value={productForm.description}
                onChange={handleProductFormChange}
                multiline
                rows={3}
              />
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={productForm.active}
                    onChange={handleProductFormChange}
                    name="active"
                    color="primary"
                  />
                }
                label="Produto Ativo"
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleCloseProductDialog}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSaveProduct}
          >
            Salvar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo de oferta */}
      <Dialog
        open={offerDialogOpen}
        onClose={handleCloseOfferDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {isEditMode ? 'Editar Oferta' : 'Nova Oferta'}
          <IconButton
            aria-label="close"
            onClick={handleCloseOfferDialog}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Produto: {selectedProduct?.name}
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Nome da Oferta"
                name="name"
                value={offerForm.name}
                onChange={handleOfferTextChange}
                required
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Descrição"
                name="description"
                value={offerForm.description}
                onChange={handleOfferTextChange}
                multiline
                rows={2}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Preço"
                name="price"
                value={offerForm.price}
                onChange={handleOfferTextChange}
                required
                InputProps={{
                  startAdornment: <InputAdornment position="start">R$</InputAdornment>,
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>
                Quantidades por Variação
              </Typography>
            </Grid>

            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Quantidade de Gel"
                name="gelQuantity"
                type="number"
                value={offerForm.gelQuantity}
                onChange={handleOfferTextChange}
                InputProps={{
                  inputProps: { min: 0 }
                }}
              />
            </Grid>

            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Quantidade de Cápsulas"
                name="capsulasQuantity"
                type="number"
                value={offerForm.capsulasQuantity}
                onChange={handleOfferTextChange}
                InputProps={{
                  inputProps: { min: 0 }
                }}
              />
            </Grid>



            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={offerForm.active}
                    onChange={handleOfferSwitchChange}
                    name="active"
                    color="primary"
                  />
                }
                label="Oferta Ativa"
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleCloseOfferDialog}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSaveOffer}
          >
            Salvar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo de exclusão */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>
          Confirmar Exclusão
        </DialogTitle>

        <DialogContent>
          <Typography variant="body1">
            {selectedOffer
              ? `Tem certeza que deseja excluir a oferta "${selectedOffer.name}"?`
              : `Tem certeza que deseja excluir o produto "${selectedProduct?.name}" e todas as suas ofertas?`
            }
          </Typography>

          <Typography variant="body2" color="error" sx={{ mt: 2 }}>
            Esta ação não pode ser desfeita.
          </Typography>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDelete}
          >
            Excluir
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

export default ProductsPage;
