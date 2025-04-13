import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Grid,
  TextField,
  FormControlLabel,
  Switch,
  Divider,
  IconButton
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon
} from '@mui/icons-material';
import { DataTable, Column, formatters } from '../components/DataTable';
import { useTheme } from '../contexts/ThemeContext';
import { useNotificationContext } from '../contexts/NotificationContext';
import { useFormValidation, validationRules } from '../hooks/useFormValidation';
import { usePagination } from '../hooks/usePagination';
import { useResponsive } from '../hooks/useMediaQuery';

// Example data type
interface ExampleData {
  id: number;
  name: string;
  email: string;
  status: string;
  createdAt: string;
  amount: number;
}

// Example data
const exampleData: ExampleData[] = Array.from({ length: 50 }, (_, index) => ({
  id: index + 1,
  name: `User ${index + 1}`,
  email: `user${index + 1}@example.com`,
  status: ['active', 'inactive', 'pending'][Math.floor(Math.random() * 3)],
  createdAt: new Date(Date.now() - Math.random() * 10000000000).toISOString(),
  amount: Math.round(Math.random() * 10000) / 100,
}));

// Status options for formatting
const statusOptions = {
  active: { label: 'Ativo', color: 'success' },
  inactive: { label: 'Inativo', color: 'error' },
  pending: { label: 'Pendente', color: 'warning' },
};

const ExamplePage: React.FC = () => {
  const { mode, toggleTheme } = useTheme();
  const { showNotification } = useNotificationContext();
  const { isMobile } = useResponsive();

  // State for the example
  const [data, setData] = useState<ExampleData[]>(exampleData);
  const [refreshing, setRefreshing] = useState(false);

  // Form validation
  const form = useFormValidation({
    name: {
      value: '',
      rules: [
        validationRules.required(),
        validationRules.minLength(3),
      ],
    },
    email: {
      value: '',
      rules: [
        validationRules.required(),
        validationRules.email(),
      ],
    },
    amount: {
      value: 0,
      rules: [
        validationRules.min(0),
      ],
    },
  });

  // Pagination
  const pagination = usePagination({
    totalItems: data.length,
    itemsPerPage: 10,
  });

  // Table columns
  const columns: Column<ExampleData>[] = [
    {
      id: 'id',
      label: 'ID',
      minWidth: 50,
      align: 'left',
      sortable: true,
    },
    {
      id: 'name',
      label: 'Nome',
      minWidth: 150,
      align: 'left',
      sortable: true,
      filterable: true,
    },
    {
      id: 'email',
      label: 'Email',
      minWidth: 200,
      align: 'left',
      sortable: true,
      filterable: true,
    },
    {
      id: 'status',
      label: 'Status',
      minWidth: 100,
      align: 'center',
      sortable: true,
      format: (value) => formatters.status(value, statusOptions),
    },
    {
      id: 'createdAt',
      label: 'Data de Criação',
      minWidth: 150,
      align: 'right',
      sortable: true,
      format: formatters.dateTime,
    },
    {
      id: 'amount',
      label: 'Valor',
      minWidth: 100,
      align: 'right',
      sortable: true,
      format: formatters.currency,
    },
  ];

  // Handle refresh
  const handleRefresh = () => {
    setRefreshing(true);

    // Simulate API call
    setTimeout(() => {
      // Generate new data
      const newData = Array.from({ length: 50 }, (_, index) => ({
        id: index + 1,
        name: `User ${index + 1}`,
        email: `user${index + 1}@example.com`,
        status: ['active', 'inactive', 'pending'][Math.floor(Math.random() * 3)],
        createdAt: new Date(Date.now() - Math.random() * 10000000000).toISOString(),
        amount: Math.round(Math.random() * 10000) / 100,
      }));

      setData(newData);
      setRefreshing(false);
      showNotification('Dados atualizados com sucesso!', 'success');
    }, 1000);
  };

  // Handle form submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (form.validateAll()) {
      // Add new item
      const newItem: ExampleData = {
        id: data.length + 1,
        name: form.values.name,
        email: form.values.email,
        status: 'active',
        createdAt: new Date().toISOString(),
        amount: form.values.amount,
      };

      setData([newItem, ...data]);
      form.resetForm();
      showNotification('Item adicionado com sucesso!', 'success');
    } else {
      showNotification('Por favor, corrija os erros no formulário.', 'error');
    }
  };

  // Handle row click
  const handleRowClick = (row: ExampleData) => {
    showNotification(`Você clicou em ${row.name}`, 'info');
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Exemplo de Componentes
        </Typography>

        <IconButton onClick={toggleTheme} color="primary">
          {mode === 'light' ? <DarkModeIcon /> : <LightModeIcon />}
        </IconButton>
      </Box>

      <Grid container spacing={3}>
        {/* Form example */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Formulário com Validação
            </Typography>

            <form onSubmit={handleSubmit}>
              <TextField
                label="Nome"
                fullWidth
                margin="normal"
                value={form.values.name}
                onChange={(e) => form.handleChange('name', e.target.value)}
                onBlur={() => form.handleBlur('name')}
                error={!!form.errors.name && form.touched.name}
                helperText={form.touched.name && form.errors.name}
              />

              <TextField
                label="Email"
                fullWidth
                margin="normal"
                value={form.values.email}
                onChange={(e) => form.handleChange('email', e.target.value)}
                onBlur={() => form.handleBlur('email')}
                error={!!form.errors.email && form.touched.email}
                helperText={form.touched.email && form.errors.email}
              />

              <TextField
                label="Valor"
                fullWidth
                margin="normal"
                type="number"
                value={form.values.amount}
                onChange={(e) => form.handleChange('amount', parseFloat(e.target.value))}
                onBlur={() => form.handleBlur('amount')}
                error={!!form.errors.amount && form.touched.amount}
                helperText={form.touched.amount && form.errors.amount}
              />

              <Box sx={{ mt: 2 }}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  fullWidth
                >
                  Adicionar Item
                </Button>
              </Box>
            </form>
          </Paper>
        </Grid>

        {/* Notifications example */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Notificações
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Button
                  variant="outlined"
                  color="success"
                  fullWidth
                  onClick={() => showNotification('Operação realizada com sucesso!', 'success')}
                >
                  Sucesso
                </Button>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Button
                  variant="outlined"
                  color="error"
                  fullWidth
                  onClick={() => showNotification('Ocorreu um erro!', 'error')}
                >
                  Erro
                </Button>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Button
                  variant="outlined"
                  color="warning"
                  fullWidth
                  onClick={() => showNotification('Atenção! Isso é um aviso.', 'warning')}
                >
                  Aviso
                </Button>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Button
                  variant="outlined"
                  color="info"
                  fullWidth
                  onClick={() => showNotification('Esta é uma informação importante.', 'info')}
                >
                  Informação
                </Button>
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />

            <Typography variant="h6" gutterBottom>
              Responsividade
            </Typography>

            <Typography variant="body1">
              Tamanho da tela atual: {isMobile ? 'Mobile' : 'Desktop'}
            </Typography>

            <FormControlLabel
              control={
                <Switch
                  checked={mode === 'dark'}
                  onChange={toggleTheme}
                  color="primary"
                />
              }
              label={`Tema ${mode === 'dark' ? 'Escuro' : 'Claro'}`}
            />
          </Paper>
        </Grid>

        {/* DataTable example */}
        <Grid item xs={12}>
          <DataTable
            columns={columns}
            data={data}
            title="Tabela de Dados"
            loading={refreshing}
            selectable
            onRefresh={handleRefresh}
            onRowClick={handleRowClick}
            actions={[
              {
                icon: <RefreshIcon />,
                label: 'Atualizar',
                onClick: (row) => {
                  showNotification(`Atualizando ${row.name}...`, 'info');
                },
                color: 'primary',
              },
            ]}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default ExamplePage;
