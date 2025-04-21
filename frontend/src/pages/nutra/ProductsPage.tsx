import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Chip,
  MenuItem,
  Grid,
  CircularProgress,
  Alert,
  Tooltip,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Collapse
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Inventory as InventoryIcon,
  History as HistoryIcon
} from '@mui/icons-material';
import NutraService from '../../services/NutraService';
import { Product, ProductCreate, ProductUpdate, ProductType, StockChangeReason, ProductVariation, ProductVariationCreate } from '../../types/NutraTypes';
import { formatCurrency } from '../../utils/formatters';
import { useNotificationContext } from '../../contexts/NotificationContext';

const ProductsPage: React.FC = () => {
  const { showNotification } = useNotificationContext();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  // Extended form data to include both product and variation fields
  const [formData, setFormData] = useState({
    // Product fields
    name: '',
    description: '',
    active: true,
    // Variation fields
    type: ProductType.CAPSULAS,
    cost: 0,
    sale_price: 0,
    minimum_stock: 10,
    current_stock: 0
  });

  // Stock adjustment dialog
  const [openStockDialog, setOpenStockDialog] = useState(false);
  const [selectedVariationId, setSelectedVariationId] = useState<number | null>(null);
  const [stockChange, setStockChange] = useState<number>(0);
  const [stockNotes, setStockNotes] = useState<string>('');

  // Variation dialog
  const [openVariationDialog, setOpenVariationDialog] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [variationFormData, setVariationFormData] = useState<ProductVariationCreate>({
    product_id: 0,
    type: ProductType.CAPSULAS,
    cost: 0,
    sale_price: 0,
    minimum_stock: 10,
    current_stock: 0,
    active: true
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await NutraService.getProducts(false); // Get all products including inactive
      setProducts(data);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to load products. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      // For editing, we need to find the first variation to populate the form
      const firstVariation = product.variations && product.variations.length > 0 ? product.variations[0] : null;

      setFormData({
        name: product.name,
        description: product.description || '',
        active: product.active,
        type: firstVariation ? firstVariation.type : ProductType.CAPSULAS,
        cost: firstVariation ? firstVariation.cost : 0,
        sale_price: firstVariation ? firstVariation.sale_price : 0,
        minimum_stock: firstVariation ? firstVariation.minimum_stock : 10,
        current_stock: firstVariation ? firstVariation.current_stock : 0
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        description: '',
        active: true,
        type: ProductType.CAPSULAS,
        cost: 0,
        sale_price: 0,
        minimum_stock: 10,
        current_stock: 0
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };



  const handleSubmit = async () => {
    try {
      if (editingProduct) {
        // Update existing product
        console.log('Updating product with data:', formData);
        const updatedProduct = await NutraService.updateProduct(
          editingProduct.id,
          {
            name: formData.name,
            description: formData.description,
            active: formData.active
          } as ProductUpdate
        );
        setProducts(products.map(p => (p.id === updatedProduct.id ? updatedProduct : p)));
        showNotification('Produto atualizado com sucesso!', 'success');
      } else {
        // Create new product
        // Make sure we're sending the correct data structure
        const productData: ProductCreate = {
          name: formData.name,
          description: formData.description,
          active: formData.active
        };

        console.log('Creating product with data:', productData);
        const newProduct = await NutraService.createProduct(productData);
        console.log('Response from create product:', newProduct);

        // If we successfully created the product, add a variation
        if (newProduct && newProduct.id) {
          try {
            const variationData: ProductVariationCreate = {
              product_id: newProduct.id,
              type: formData.type,
              cost: formData.cost,
              sale_price: formData.sale_price,
              minimum_stock: formData.minimum_stock,
              current_stock: formData.current_stock,
              active: true
            };

            console.log('Adding variation with data:', variationData);
            await NutraService.addProductVariation(newProduct.id, variationData);

            // Refresh products to get the updated product with variation
            await fetchProducts();
            showNotification('Produto criado com sucesso!', 'success');
          } catch (variationErr) {
            console.error('Error adding variation:', variationErr);
            // We still created the product, so show a partial success message
            showNotification('Produto criado, mas houve um erro ao adicionar a variação.', 'warning');
            await fetchProducts();
          }
        } else {
          setProducts([...products, newProduct]);
          showNotification('Produto criado com sucesso!', 'success');
        }
      }
      handleCloseDialog();
    } catch (err) {
      console.error('Error saving product:', err);
      showNotification('Erro ao salvar produto. Tente novamente.', 'error');
    }
  };

  const handleDeleteProduct = async (id: number) => {
    if (window.confirm('Tem certeza que deseja desativar este produto?')) {
      try {
        await NutraService.deleteProduct(id);
        // Update the product in the list (mark as inactive)
        setProducts(
          products.map(p => (p.id === id ? { ...p, active: false } : p))
        );
        showNotification('Produto desativado com sucesso!', 'success');
      } catch (err) {
        console.error('Error deleting product:', err);
        showNotification('Erro ao desativar produto. Tente novamente.', 'error');
      }
    }
  };

  const handleOpenStockDialog = (variationId: number) => {
    setSelectedVariationId(variationId);
    setStockChange(0);
    setStockNotes('');
    setOpenStockDialog(true);
  };

  const handleCloseStockDialog = () => {
    setOpenStockDialog(false);
  };

  const handleAdjustStock = async () => {
    if (!selectedVariationId) return;

    try {
      await NutraService.adjustStock(selectedVariationId, {
        variation_id: selectedVariationId,
        change_amount: stockChange,
        reason: StockChangeReason.MANUAL,
        notes: stockNotes
      });

      // Refresh products to get updated stock
      await fetchProducts();
      showNotification('Estoque ajustado com sucesso!', 'success');
      handleCloseStockDialog();
    } catch (err) {
      console.error('Error adjusting stock:', err);
      showNotification('Erro ao ajustar estoque. Tente novamente.', 'error');
    }
  };

  // Variation dialog handlers
  const handleOpenVariationDialog = (productId: number) => {
    setSelectedProductId(productId);
    setVariationFormData({
      product_id: productId,
      type: ProductType.CAPSULAS,
      cost: 0,
      sale_price: 0,
      minimum_stock: 10,
      current_stock: 0,
      active: true
    });
    setOpenVariationDialog(true);
  };

  const handleCloseVariationDialog = () => {
    setOpenVariationDialog(false);
  };

  const handleVariationInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setVariationFormData({
      ...variationFormData,
      [name]: type === 'checkbox' ? checked : type === 'number' ? Number(value) : value
    });
  };

  const handleAddVariation = async () => {
    if (!selectedProductId) return;

    try {
      await NutraService.addProductVariation(selectedProductId, variationFormData);
      await fetchProducts();
      showNotification('Variação adicionada com sucesso!', 'success');
      handleCloseVariationDialog();
    } catch (err) {
      console.error('Error adding variation:', err);
      showNotification('Erro ao adicionar variação. Tente novamente.', 'error');
    }
  };

  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Handle page change
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };



  if (loading && products.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Gerenciamento de Produtos</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Novo Produto
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer sx={{ maxHeight: 'calc(100vh - 250px)' }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Nome</TableCell>
                <TableCell>Variações</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {products
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((product) => (
                  <React.Fragment key={product.id}>
                    <TableRow>
                      <TableCell>{product.id}</TableCell>
                      <TableCell>{product.name}</TableCell>
                      <TableCell>
                        {product.variations && product.variations.length > 0 ? (
                          <Typography variant="body2">
                            {product.variations.length} variações
                          </Typography>
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            Sem variações
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={product.active ? 'Ativo' : 'Inativo'}
                          size="small"
                          color={product.active ? 'success' : 'default'}
                        />
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Tooltip title="Editar">
                            <IconButton
                              size="small"
                              onClick={() => handleOpenDialog(product)}
                              color="primary"
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>

                          <Tooltip title="Adicionar Variação">
                            <IconButton
                              size="small"
                              onClick={() => handleOpenVariationDialog(product.id)}
                              color="secondary"
                            >
                              <AddIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>

                          <Tooltip title="Histórico">
                            <IconButton
                              size="small"
                              onClick={() => {/* TODO: Implement history view */}}
                              color="info"
                            >
                              <HistoryIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>

                          {product.active && (
                            <Tooltip title="Desativar">
                              <IconButton
                                size="small"
                                onClick={() => handleDeleteProduct(product.id)}
                                color="error"
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                    {product.variations && product.variations.length > 0 && (
                      <TableRow>
                        <TableCell colSpan={5} sx={{ py: 0 }}>
                          <Collapse in={true} timeout="auto" unmountOnExit>
                            <Box sx={{ margin: 1 }}>
                              <Typography variant="subtitle2" gutterBottom component="div">
                                Variações
                              </Typography>
                              <Table size="small">
                                <TableHead>
                                  <TableRow>
                                    <TableCell>Tipo</TableCell>
                                    <TableCell>Custo</TableCell>
                                    <TableCell>Preço Venda</TableCell>
                                    <TableCell>Estoque Atual</TableCell>
                                    <TableCell>Estoque Mínimo</TableCell>
                                    <TableCell>Ações</TableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {product.variations.map((variation) => (
                                    <TableRow key={variation.id}>
                                      <TableCell>
                                        <Chip
                                          label={variation.type}
                                          size="small"
                                          color="primary"
                                          variant="outlined"
                                        />
                                      </TableCell>
                                      <TableCell>{formatCurrency(variation.cost)}</TableCell>
                                      <TableCell>{formatCurrency(variation.sale_price)}</TableCell>
                                      <TableCell>
                                        <Chip
                                          label={variation.current_stock}
                                          size="small"
                                          color={variation.current_stock === 0 ? 'error' :
                                                 variation.current_stock < variation.minimum_stock ? 'warning' : 'success'}
                                        />
                                      </TableCell>
                                      <TableCell>{variation.minimum_stock}</TableCell>
                                      <TableCell>
                                        <Tooltip title="Ajustar Estoque">
                                          <IconButton
                                            size="small"
                                            onClick={() => handleOpenStockDialog(variation.id)}
                                            color="secondary"
                                          >
                                            <InventoryIcon fontSize="small" />
                                          </IconButton>
                                        </Tooltip>
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </Box>
                          </Collapse>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[10, 25, 50]}
          component="div"
          count={products.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      {/* Product Form Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingProduct ? 'Editar Produto' : 'Novo Produto'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                name="name"
                label="Nome do Produto"
                value={formData.name}
                onChange={handleInputChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="description"
                label="Descrição"
                value={formData.description}
                onChange={handleInputChange}
                fullWidth
                multiline
                rows={3}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                name="type"
                label="Tipo"
                select
                value={formData.type}
                onChange={handleInputChange}
                fullWidth
                required
              >
                {Object.values(ProductType).map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                name="cost"
                label="Custo (R$)"
                type="number"
                value={formData.cost}
                onChange={handleInputChange}
                fullWidth
                required
                inputProps={{ min: 0, step: 0.01 }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                name="sale_price"
                label="Preço de Venda (R$)"
                type="number"
                value={formData.sale_price}
                onChange={handleInputChange}
                fullWidth
                required
                inputProps={{ min: 0, step: 0.01 }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                name="minimum_stock"
                label="Estoque Mínimo"
                type="number"
                value={formData.minimum_stock}
                onChange={handleInputChange}
                fullWidth
                required
                inputProps={{ min: 0 }}
              />
            </Grid>

            {!editingProduct && (
              <Grid item xs={12} sm={6}>
                <TextField
                  name="current_stock"
                  label="Estoque Inicial"
                  type="number"
                  value={formData.current_stock}
                  onChange={handleInputChange}
                  fullWidth
                  inputProps={{ min: 0 }}
                />
              </Grid>
            )}

            {!editingProduct && (
              <Grid item xs={12}>
                <Alert severity="info" sx={{ mt: 2 }}>
                  Após criar o produto, você poderá adicionar variações (Cápsula, Gotas, Gel) e gerenciar o estoque de cada variação.
                </Alert>
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            Salvar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Stock Adjustment Dialog */}
      <Dialog open={openStockDialog} onClose={handleCloseStockDialog}>
        <DialogTitle>Ajustar Estoque</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            {(() => {
              // Find the variation and its product
              let selectedVariation: ProductVariation | undefined;
              let parentProduct: Product | undefined;

              for (const product of products) {
                if (product.variations) {
                  const variation = product.variations.find(v => v.id === selectedVariationId);
                  if (variation) {
                    selectedVariation = variation;
                    parentProduct = product;
                    break;
                  }
                }
              }

              return (
                <>
                  <Typography variant="subtitle2" gutterBottom>
                    Produto: {parentProduct?.name || 'Não encontrado'}
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    Variação: {selectedVariation?.type || 'Não encontrada'}
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    Estoque Atual: {selectedVariation?.current_stock || 0}
                  </Typography>
                </>
              );
            })()}
            <Divider sx={{ my: 2 }} />
            <TextField
              label="Quantidade"
              type="number"
              value={stockChange}
              onChange={(e) => setStockChange(Number(e.target.value))}
              fullWidth
              helperText="Use valores positivos para adicionar e negativos para remover"
              sx={{ mb: 2 }}
            />
            <TextField
              label="Observações"
              value={stockNotes}
              onChange={(e) => setStockNotes(e.target.value)}
              fullWidth
              multiline
              rows={2}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseStockDialog}>Cancelar</Button>
          <Button
            onClick={handleAdjustStock}
            variant="contained"
            color="primary"
            disabled={stockChange === 0}
          >
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Variation Dialog */}
      <Dialog open={openVariationDialog} onClose={handleCloseVariationDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Adicionar Variação</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <Typography variant="subtitle2" gutterBottom>
              Produto: {products.find(p => p.id === selectedProductId)?.name || 'Não encontrado'}
            </Typography>
            <Divider sx={{ my: 2 }} />

            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  name="type"
                  label="Tipo de Variação"
                  select
                  value={variationFormData.type}
                  onChange={handleVariationInputChange}
                  fullWidth
                  required
                >
                  {Object.values(ProductType).map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="cost"
                  label="Custo (R$)"
                  type="number"
                  value={variationFormData.cost}
                  onChange={handleVariationInputChange}
                  fullWidth
                  required
                  inputProps={{ min: 0, step: 0.01 }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="sale_price"
                  label="Preço de Venda (R$)"
                  type="number"
                  value={variationFormData.sale_price}
                  onChange={handleVariationInputChange}
                  fullWidth
                  required
                  inputProps={{ min: 0, step: 0.01 }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="current_stock"
                  label="Estoque Inicial"
                  type="number"
                  value={variationFormData.current_stock}
                  onChange={handleVariationInputChange}
                  fullWidth
                  inputProps={{ min: 0 }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="minimum_stock"
                  label="Estoque Mínimo"
                  type="number"
                  value={variationFormData.minimum_stock}
                  onChange={handleVariationInputChange}
                  fullWidth
                  required
                  inputProps={{ min: 0 }}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseVariationDialog}>Cancelar</Button>
          <Button onClick={handleAddVariation} variant="contained" color="primary">
            Adicionar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProductsPage;
