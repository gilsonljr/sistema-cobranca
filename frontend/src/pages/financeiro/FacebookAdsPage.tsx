import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  Divider,
  SelectChangeEvent,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '../../utils/formatters';

// Interface for Facebook Ad data
interface FacebookAd {
  id: string;
  name: string;
  cost: number;
  date: string;
  status: 'active' | 'paused' | 'completed';
  performance: number; // ROI or performance metric
}

const FacebookAdsPage: React.FC = () => {
  const [ads, setAds] = useState<FacebookAd[]>([]);
  const [filteredAds, setFilteredAds] = useState<FacebookAd[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingAd, setEditingAd] = useState<FacebookAd | null>(null);
  const [newAd, setNewAd] = useState<Omit<FacebookAd, 'id'>>({
    name: '',
    cost: 0,
    date: new Date().toISOString().split('T')[0],
    status: 'active',
    performance: 0,
  });
  const [dateFilter, setDateFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Load sample data on component mount
  useEffect(() => {
    const sampleAds: FacebookAd[] = [
      {
        id: '1',
        name: 'Campanha Potência Azul',
        cost: 1500,
        date: '2023-05-01',
        status: 'active',
        performance: 2.3,
      },
      {
        id: '2',
        name: 'Promoção Frete Grátis',
        cost: 800,
        date: '2023-05-02',
        status: 'active',
        performance: 1.8,
      },
      {
        id: '3',
        name: 'Campanha Dia das Mães',
        cost: 2000,
        date: '2023-05-03',
        status: 'completed',
        performance: 3.1,
      },
      {
        id: '4',
        name: 'Remarketing Clientes',
        cost: 500,
        date: '2023-05-04',
        status: 'paused',
        performance: 1.2,
      },
    ];

    setAds(sampleAds);
    setFilteredAds(sampleAds);
  }, []);

  // Apply filters when filter state changes
  useEffect(() => {
    let filtered = [...ads];

    if (dateFilter) {
      filtered = filtered.filter(ad => ad.date === dateFilter);
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(ad => ad.status === statusFilter);
    }

    setFilteredAds(filtered);
  }, [ads, dateFilter, statusFilter]);

  // Calculate total cost
  const totalCost = filteredAds.reduce((sum, ad) => sum + ad.cost, 0);

  // Handle dialog open/close
  const handleOpenDialog = (ad?: FacebookAd) => {
    if (ad) {
      setEditingAd(ad);
      setNewAd({
        name: ad.name,
        cost: ad.cost,
        date: ad.date,
        status: ad.status,
        performance: ad.performance,
      });
    } else {
      setEditingAd(null);
      setNewAd({
        name: '',
        cost: 0,
        date: new Date().toISOString().split('T')[0],
        status: 'active',
        performance: 0,
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    setNewAd(prev => ({
      ...prev,
      [name as string]: value,
    }));
  };

  // Handle select changes
  const handleSelectChange = (e: SelectChangeEvent) => {
    const { name, value } = e.target;
    setNewAd(prev => ({
      ...prev,
      [name as string]: value,
    }));
  };

  // Handle save ad
  const handleSaveAd = () => {
    if (editingAd) {
      // Update existing ad
      setAds(prevAds =>
        prevAds.map(ad =>
          ad.id === editingAd.id
            ? {
                ...ad,
                name: newAd.name,
                cost: newAd.cost,
                date: newAd.date,
                status: newAd.status,
                performance: newAd.performance,
              }
            : ad
        )
      );
    } else {
      // Add new ad
      const newAdWithId: FacebookAd = {
        ...newAd,
        id: Date.now().toString(),
      };
      setAds(prevAds => [...prevAds, newAdWithId]);
    }
    handleCloseDialog();
  };

  // Handle delete ad
  const handleDeleteAd = (id: string) => {
    setAds(prevAds => prevAds.filter(ad => ad.id !== id));
  };

  // Prepare data for chart
  const chartData = filteredAds.map(ad => ({
    name: ad.name,
    custo: ad.cost,
    desempenho: ad.performance * ad.cost, // Calculate ROI value
  }));

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Relatório de Anúncios do Facebook
      </Typography>

      {/* Filters and Actions */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={3}>
            <TextField
              label="Filtrar por Data"
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                label="Status"
                onChange={(e) => setStatusFilter(e.target.value as string)}
              >
                <MenuItem value="all">Todos</MenuItem>
                <MenuItem value="active">Ativos</MenuItem>
                <MenuItem value="paused">Pausados</MenuItem>
                <MenuItem value="completed">Concluídos</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
              fullWidth
            >
              Novo Anúncio
            </Button>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Typography variant="h6" align="right">
              Total: {formatCurrency(totalCost)}
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Custo Total
              </Typography>
              <Typography variant="h4" color="primary">
                {formatCurrency(totalCost)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {filteredAds.length} anúncios ativos
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Desempenho Médio
              </Typography>
              <Typography variant="h4" color="success.main">
                {filteredAds.length > 0
                  ? (
                      filteredAds.reduce((sum, ad) => sum + ad.performance, 0) /
                      filteredAds.length
                    ).toFixed(2) + 'x'
                  : '0x'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Retorno sobre investimento
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Valor Estimado de Retorno
              </Typography>
              <Typography variant="h4" color="success.main">
                {formatCurrency(
                  filteredAds.reduce(
                    (sum, ad) => sum + ad.cost * ad.performance,
                    0
                  )
                )}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Baseado no ROI dos anúncios
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Chart */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Desempenho dos Anúncios
        </Typography>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip formatter={(value) => formatCurrency(Number(value))} />
            <Legend />
            <Bar dataKey="custo" name="Custo" fill="#8884d8" />
            <Bar dataKey="desempenho" name="Retorno Estimado" fill="#82ca9d" />
          </BarChart>
        </ResponsiveContainer>
      </Paper>

      {/* Table */}
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer sx={{ maxHeight: 440 }}>
          <Table stickyHeader aria-label="sticky table">
            <TableHead>
              <TableRow>
                <TableCell>Nome do Anúncio</TableCell>
                <TableCell>Data</TableCell>
                <TableCell>Custo</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Desempenho (ROI)</TableCell>
                <TableCell>Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredAds.map((ad) => (
                <TableRow key={ad.id} hover>
                  <TableCell>{ad.name}</TableCell>
                  <TableCell>{new Date(ad.date).toLocaleDateString('pt-BR')}</TableCell>
                  <TableCell>{formatCurrency(ad.cost)}</TableCell>
                  <TableCell>
                    {ad.status === 'active' && 'Ativo'}
                    {ad.status === 'paused' && 'Pausado'}
                    {ad.status === 'completed' && 'Concluído'}
                  </TableCell>
                  <TableCell>{ad.performance.toFixed(2)}x</TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={() => handleOpenDialog(ad)}
                      color="primary"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteAd(ad.id)}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingAd ? 'Editar Anúncio' : 'Novo Anúncio do Facebook'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                name="name"
                label="Nome do Anúncio"
                value={newAd.name}
                onChange={handleInputChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="cost"
                label="Custo (R$)"
                type="number"
                value={newAd.cost}
                onChange={handleInputChange}
                fullWidth
                required
                inputProps={{ min: 0, step: 0.01 }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="date"
                label="Data"
                type="date"
                value={newAd.date}
                onChange={handleInputChange}
                fullWidth
                required
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  name="status"
                  value={newAd.status}
                  label="Status"
                  onChange={handleSelectChange}
                >
                  <MenuItem value="active">Ativo</MenuItem>
                  <MenuItem value="paused">Pausado</MenuItem>
                  <MenuItem value="completed">Concluído</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="performance"
                label="Desempenho (ROI)"
                type="number"
                value={newAd.performance}
                onChange={handleInputChange}
                fullWidth
                required
                inputProps={{ min: 0, step: 0.1 }}
                helperText="Multiplicador de retorno sobre investimento"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button onClick={handleSaveAd} variant="contained" color="primary">
            Salvar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FacebookAdsPage;
