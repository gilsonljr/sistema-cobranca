import React, { useState, useMemo } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  TablePagination,
  Toolbar,
  Typography,
  TextField,
  InputAdornment,
  Checkbox,
  IconButton,
  Tooltip,
  Chip,
  Skeleton,
  useTheme,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Refresh as RefreshIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';
import { debounce } from '../../utils/performance';

// Column definition
export interface Column<T> {
  id: string;
  label: string;
  minWidth?: number;
  align?: 'left' | 'right' | 'center';
  format?: (value: any, row: T) => React.ReactNode;
  sortable?: boolean;
  filterable?: boolean;
  hidden?: boolean;
}

// Action definition
export interface Action<T> {
  icon: React.ReactNode;
  label: string;
  onClick: (row: T) => void;
  disabled?: (row: T) => boolean;
  hidden?: (row: T) => boolean;
  color?: 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' | 'default';
}

// Props
interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  title?: string;
  loading?: boolean;
  selectable?: boolean;
  actions?: Action<T>[];
  defaultSortBy?: string;
  defaultSortDirection?: 'asc' | 'desc';
  onRefresh?: () => void;
  onRowClick?: (row: T) => void;
  onSelectionChange?: (selectedRows: T[]) => void;
  getRowId?: (row: T) => string | number;
  emptyMessage?: string;
  searchPlaceholder?: string;
  hideToolbar?: boolean;
  dense?: boolean;
  stickyHeader?: boolean;
  maxHeight?: number | string;
  rowsPerPageOptions?: number[];
  defaultRowsPerPage?: number;
}

// Generic data table component
export function DataTable<T>({
  columns,
  data,
  title,
  loading = false,
  selectable = false,
  actions = [],
  defaultSortBy,
  defaultSortDirection = 'asc',
  onRefresh,
  onRowClick,
  onSelectionChange,
  getRowId = (row: T) => (row as any).id,
  emptyMessage = 'Nenhum dado encontrado',
  searchPlaceholder = 'Buscar...',
  hideToolbar = false,
  dense = false,
  stickyHeader = true,
  maxHeight = 600,
  rowsPerPageOptions = [10, 25, 50, 100],
  defaultRowsPerPage = 10,
}: DataTableProps<T>) {
  const theme = useTheme();
  
  // State
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(defaultRowsPerPage);
  const [sortBy, setSortBy] = useState<string | undefined>(defaultSortBy);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>(defaultSortDirection);
  const [searchQuery, setSearchQuery] = useState('');
  const [selected, setSelected] = useState<(string | number)[]>([]);
  
  // Visible columns
  const visibleColumns = useMemo(
    () => columns.filter((column) => !column.hidden),
    [columns]
  );
  
  // Handle search
  const handleSearch = debounce((value: string) => {
    setSearchQuery(value);
    setPage(0); // Reset to first page when searching
  }, 300);
  
  // Filter data based on search query
  const filteredData = useMemo(() => {
    if (!searchQuery) return data;
    
    const query = searchQuery.toLowerCase();
    return data.filter((row) => {
      return columns.some((column) => {
        if (!column.filterable) return false;
        
        const value = (row as any)[column.id];
        if (value == null) return false;
        
        return String(value).toLowerCase().includes(query);
      });
    });
  }, [data, searchQuery, columns]);
  
  // Sort data
  const sortedData = useMemo(() => {
    if (!sortBy) return filteredData;
    
    return [...filteredData].sort((a, b) => {
      const aValue = (a as any)[sortBy];
      const bValue = (b as any)[sortBy];
      
      if (aValue == null) return sortDirection === 'asc' ? -1 : 1;
      if (bValue == null) return sortDirection === 'asc' ? 1 : -1;
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      
      return sortDirection === 'asc'
        ? aValue > bValue ? 1 : -1
        : aValue < bValue ? 1 : -1;
    });
  }, [filteredData, sortBy, sortDirection]);
  
  // Paginated data
  const paginatedData = useMemo(() => {
    const startIndex = page * rowsPerPage;
    return sortedData.slice(startIndex, startIndex + rowsPerPage);
  }, [sortedData, page, rowsPerPage]);
  
  // Handle sort
  const handleSort = (columnId: string) => {
    const isAsc = sortBy === columnId && sortDirection === 'asc';
    setSortDirection(isAsc ? 'desc' : 'asc');
    setSortBy(columnId);
  };
  
  // Handle page change
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };
  
  // Handle rows per page change
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  // Handle select all
  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelected = sortedData.map((row) => getRowId(row));
      setSelected(newSelected);
      if (onSelectionChange) {
        onSelectionChange(sortedData);
      }
    } else {
      setSelected([]);
      if (onSelectionChange) {
        onSelectionChange([]);
      }
    }
  };
  
  // Handle select one
  const handleSelectOne = (event: React.ChangeEvent<HTMLInputElement>, row: T) => {
    event.stopPropagation();
    const id = getRowId(row);
    const selectedIndex = selected.indexOf(id);
    let newSelected: (string | number)[] = [];
    
    if (selectedIndex === -1) {
      newSelected = [...selected, id];
    } else {
      newSelected = selected.filter((item) => item !== id);
    }
    
    setSelected(newSelected);
    
    if (onSelectionChange) {
      const selectedRows = sortedData.filter((row) => 
        newSelected.includes(getRowId(row))
      );
      onSelectionChange(selectedRows);
    }
  };
  
  // Check if row is selected
  const isSelected = (row: T) => selected.indexOf(getRowId(row)) !== -1;
  
  // Render loading skeleton
  const renderSkeleton = () => {
    return Array.from({ length: rowsPerPage }).map((_, index) => (
      <TableRow key={`skeleton-${index}`}>
        {selectable && (
          <TableCell padding="checkbox">
            <Skeleton variant="rectangular" width={24} height={24} />
          </TableCell>
        )}
        {visibleColumns.map((column) => (
          <TableCell key={`skeleton-cell-${column.id}-${index}`} align={column.align}>
            <Skeleton variant="text" width="80%" />
          </TableCell>
        ))}
        {actions.length > 0 && (
          <TableCell align="right">
            <Box display="flex" justifyContent="flex-end">
              {actions.map((_, actionIndex) => (
                <Skeleton
                  key={`skeleton-action-${actionIndex}-${index}`}
                  variant="circular"
                  width={32}
                  height={32}
                  sx={{ ml: 1 }}
                />
              ))}
            </Box>
          </TableCell>
        )}
      </TableRow>
    ));
  };
  
  return (
    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
      {/* Toolbar */}
      {!hideToolbar && (
        <Toolbar
          sx={{
            pl: { sm: 2 },
            pr: { xs: 1, sm: 1 },
            ...(selected.length > 0 && {
              bgcolor: (theme) =>
                theme.palette.mode === 'light'
                  ? theme.palette.primary.light
                  : theme.palette.primary.dark,
            }),
          }}
        >
          {/* Title or selected count */}
          {selected.length > 0 ? (
            <Typography
              sx={{ flex: '1 1 100%' }}
              color="inherit"
              variant="subtitle1"
              component="div"
            >
              {selected.length} selecionado{selected.length > 1 ? 's' : ''}
            </Typography>
          ) : (
            <Typography
              sx={{ flex: '1 1 100%' }}
              variant="h6"
              id="tableTitle"
              component="div"
            >
              {title}
            </Typography>
          )}
          
          {/* Search field */}
          {selected.length === 0 && (
            <TextField
              size="small"
              placeholder={searchPlaceholder}
              onChange={(e) => handleSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ mr: 2, width: 250 }}
            />
          )}
          
          {/* Refresh button */}
          {onRefresh && selected.length === 0 && (
            <Tooltip title="Atualizar">
              <IconButton onClick={onRefresh}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          )}
          
          {/* Filter button */}
          {selected.length === 0 && (
            <Tooltip title="Filtrar">
              <IconButton>
                <FilterListIcon />
              </IconButton>
            </Tooltip>
          )}
          
          {/* Delete button when items are selected */}
          {selected.length > 0 && (
            <Tooltip title="Excluir">
              <IconButton>
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          )}
        </Toolbar>
      )}
      
      {/* Table */}
      <TableContainer sx={{ maxHeight }}>
        <Table
          stickyHeader={stickyHeader}
          size={dense ? 'small' : 'medium'}
          aria-label={title || 'data-table'}
        >
          {/* Table header */}
          <TableHead>
            <TableRow>
              {/* Checkbox column */}
              {selectable && (
                <TableCell padding="checkbox">
                  <Checkbox
                    indeterminate={
                      selected.length > 0 && selected.length < sortedData.length
                    }
                    checked={
                      sortedData.length > 0 && selected.length === sortedData.length
                    }
                    onChange={handleSelectAll}
                    inputProps={{ 'aria-label': 'select all' }}
                  />
                </TableCell>
              )}
              
              {/* Column headers */}
              {visibleColumns.map((column) => (
                <TableCell
                  key={column.id}
                  align={column.align}
                  style={{ minWidth: column.minWidth }}
                  sortDirection={sortBy === column.id ? sortDirection : false}
                >
                  {column.sortable ? (
                    <TableSortLabel
                      active={sortBy === column.id}
                      direction={sortBy === column.id ? sortDirection : 'asc'}
                      onClick={() => handleSort(column.id)}
                    >
                      {column.label}
                    </TableSortLabel>
                  ) : (
                    column.label
                  )}
                </TableCell>
              ))}
              
              {/* Actions column */}
              {actions.length > 0 && (
                <TableCell align="right">Ações</TableCell>
              )}
            </TableRow>
          </TableHead>
          
          {/* Table body */}
          <TableBody>
            {loading ? (
              renderSkeleton()
            ) : paginatedData.length > 0 ? (
              paginatedData.map((row, index) => {
                const isItemSelected = isSelected(row);
                const rowId = getRowId(row);
                
                return (
                  <TableRow
                    hover
                    role="checkbox"
                    aria-checked={isItemSelected}
                    tabIndex={-1}
                    key={`row-${rowId}`}
                    selected={isItemSelected}
                    onClick={onRowClick ? () => onRowClick(row) : undefined}
                    sx={{ cursor: onRowClick ? 'pointer' : 'default' }}
                  >
                    {/* Checkbox */}
                    {selectable && (
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={isItemSelected}
                          onChange={(event) => handleSelectOne(event, row)}
                          onClick={(event) => event.stopPropagation()}
                          inputProps={{ 'aria-labelledby': `row-${rowId}` }}
                        />
                      </TableCell>
                    )}
                    
                    {/* Data cells */}
                    {visibleColumns.map((column) => {
                      const value = (row as any)[column.id];
                      return (
                        <TableCell key={`cell-${column.id}-${rowId}`} align={column.align}>
                          {column.format ? column.format(value, row) : value}
                        </TableCell>
                      );
                    })}
                    
                    {/* Actions */}
                    {actions.length > 0 && (
                      <TableCell align="right">
                        <Box display="flex" justifyContent="flex-end">
                          {actions.map((action, actionIndex) => {
                            // Check if action should be hidden
                            if (action.hidden && action.hidden(row)) {
                              return null;
                            }
                            
                            return (
                              <Tooltip key={`action-${actionIndex}-${rowId}`} title={action.label}>
                                <span>
                                  <IconButton
                                    size="small"
                                    color={action.color || 'default'}
                                    onClick={(event) => {
                                      event.stopPropagation();
                                      action.onClick(row);
                                    }}
                                    disabled={action.disabled ? action.disabled(row) : false}
                                  >
                                    {action.icon}
                                  </IconButton>
                                </span>
                              </Tooltip>
                            );
                          })}
                        </Box>
                      </TableCell>
                    )}
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell
                  colSpan={
                    visibleColumns.length +
                    (selectable ? 1 : 0) +
                    (actions.length > 0 ? 1 : 0)
                  }
                  align="center"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      
      {/* Pagination */}
      <TablePagination
        rowsPerPageOptions={rowsPerPageOptions}
        component="div"
        count={sortedData.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        labelRowsPerPage="Linhas por página:"
        labelDisplayedRows={({ from, to, count }) =>
          `${from}-${to} de ${count}`
        }
      />
    </Paper>
  );
}

// Common actions
export const commonActions = {
  view: (onClick: (row: any) => void): Action<any> => ({
    icon: <ViewIcon />,
    label: 'Visualizar',
    onClick,
    color: 'info',
  }),
  edit: (onClick: (row: any) => void): Action<any> => ({
    icon: <EditIcon />,
    label: 'Editar',
    onClick,
    color: 'primary',
  }),
  delete: (onClick: (row: any) => void): Action<any> => ({
    icon: <DeleteIcon />,
    label: 'Excluir',
    onClick,
    color: 'error',
  }),
};

// Common formatters
export const formatters = {
  date: (value: string | Date) => {
    if (!value) return '';
    const date = typeof value === 'string' ? new Date(value) : value;
    return date.toLocaleDateString('pt-BR');
  },
  
  dateTime: (value: string | Date) => {
    if (!value) return '';
    const date = typeof value === 'string' ? new Date(value) : value;
    return date.toLocaleString('pt-BR');
  },
  
  currency: (value: number) => {
    if (value === undefined || value === null) return '';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  },
  
  number: (value: number, options?: Intl.NumberFormatOptions) => {
    if (value === undefined || value === null) return '';
    return new Intl.NumberFormat('pt-BR', options).format(value);
  },
  
  percent: (value: number) => {
    if (value === undefined || value === null) return '';
    return new Intl.NumberFormat('pt-BR', {
      style: 'percent',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value / 100);
  },
  
  status: (value: string, options: Record<string, { label: string; color: string }>) => {
    const option = options[value];
    if (!option) return value;
    
    return (
      <Chip
        label={option.label}
        color={option.color as any}
        size="small"
        variant="outlined"
      />
    );
  },
  
  boolean: (value: boolean, trueLabel = 'Sim', falseLabel = 'Não') => {
    return value ? trueLabel : falseLabel;
  },
  
  truncate: (value: string, maxLength = 50) => {
    if (!value) return '';
    if (value.length <= maxLength) return value;
    return `${value.substring(0, maxLength)}...`;
  },
};
