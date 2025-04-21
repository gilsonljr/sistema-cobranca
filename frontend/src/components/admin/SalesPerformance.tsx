import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  IconButton,
  TextField,
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  SelectChangeEvent,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { formatCurrency } from '../../utils/formatters';

// Mock data for sales by date
const mockSalesByDate = Array.from({ length: 30 }, (_, i) => {
  const date = new Date();
  date.setDate(date.getDate() - i);

  // Generate random data
  const totalSales = Math.floor(Math.random() * 20) + 5;
  const revenue = totalSales * (Math.floor(Math.random() * 200) + 300);
  const completed = Math.floor(Math.random() * totalSales);
  const pending = totalSales - completed;

  return {
    id: i + 1,
    date: date,
    totalSales,
    revenue,
    completed,
    pending,
    conversionRate: Math.floor(Math.random() * 30) + 40,
  };
});

const SalesPerformance: React.FC = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  const handleFilterChange = (event: SelectChangeEvent) => {
    setFilterStatus(event.target.value);
    setPage(0);
  };

  // Format date to DD/MM/YYYY
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR');
  };

  // Filter and sort data
  const filteredData = mockSalesByDate
    .filter(row => {
      const dateStr = formatDate(row.date);
      return dateStr.includes(searchTerm);
    })
    .filter(row => {
      if (filterStatus === 'all') return true;
      if (filterStatus === 'high' && row.conversionRate >= 60) return true;
      if (filterStatus === 'medium' && row.conversionRate >= 40 && row.conversionRate < 60) return true;
      if (filterStatus === 'low' && row.conversionRate < 40) return true;
      return false;
    });

  return (
    <Paper sx={{ p: 2, height: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Desempenho de Vendas por Data</Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            size="small"
            placeholder="Buscar por data"
            value={searchTerm}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel id="filter-status-label">Conversão</InputLabel>
            <Select
              labelId="filter-status-label"
              id="filter-status"
              value={filterStatus}
              label="Conversão"
              onChange={handleFilterChange}
              startAdornment={
                <InputAdornment position="start">
                  <FilterListIcon fontSize="small" />
                </InputAdornment>
              }
            >
              <MenuItem value="all">Todas</MenuItem>
              <MenuItem value="high">Alta (&gt;60%)</MenuItem>
              <MenuItem value="medium">Média (40-60%)</MenuItem>
              <MenuItem value="low">Baixa (&lt;40%)</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>

      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Data</TableCell>
              <TableCell align="right">Vendas</TableCell>
              <TableCell align="right">Faturamento</TableCell>
              <TableCell align="right">Completas</TableCell>
              <TableCell align="right">Pendentes</TableCell>
              <TableCell align="right">Taxa de Conversão</TableCell>
              <TableCell align="center">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredData
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((row) => (
                <TableRow key={row.id} hover>
                  <TableCell component="th" scope="row">
                    {formatDate(row.date)}
                  </TableCell>
                  <TableCell align="right">{row.totalSales}</TableCell>
                  <TableCell align="right">{formatCurrency(row.revenue)}</TableCell>
                  <TableCell align="right">{row.completed}</TableCell>
                  <TableCell align="right">{row.pending}</TableCell>
                  <TableCell align="right">
                    <Chip
                      label={`${row.conversionRate}%`}
                      size="small"
                      color={
                        row.conversionRate >= 60
                          ? 'success'
                          : row.conversionRate >= 40
                          ? 'primary'
                          : 'warning'
                      }
                      sx={{ minWidth: 60 }}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <IconButton size="small">
                      <VisibilityIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={filteredData.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        labelRowsPerPage="Linhas por página:"
        labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
      />
    </Paper>
  );
};

export default SalesPerformance;
