import React, { useState, useEffect } from 'react';
import {
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  Box,
  Chip,
  Typography,
  TableSortLabel,
  Tooltip,
  Drawer,
  IconButton,
  Grid,
  Divider,
  Button,
  Stack,
  TextField,
  List,
  ListItem,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import { Order } from '../types/Order';
import StatusChip from './StatusChip';
import TrackingStatusChip from './TrackingStatusChip';
import AdminEditForm from './AdminEditForm';
import UserEditForm from './UserEditForm';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import PendingOutlinedIcon from '@mui/icons-material/PendingOutlined';
import HandshakeOutlinedIcon from '@mui/icons-material/HandshakeOutlined';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import useUserPermissions from '../hooks/useUserPermissions';

interface OrdersTableProps {
  orders: Order[];
  onOrderUpdate?: (updatedOrder: Order) => void;
}

// Função auxiliar para converter data BR (DD/MM/YYYY) para formato comparável
const parseDate = (dateStr: string): Date => {
  if (!dateStr) return new Date(0); // Data mínima para valores vazios

  const parts = dateStr.split('/');
  // Se não tiver formato DD/MM/YYYY, retornar como string
  if (parts.length !== 3) return new Date(dateStr);

  const [day, month, year] = parts.map(Number);
  return new Date(year, month - 1, day);
};

// Função para formatar tempo relativo
const formatRelativeTime = (dateStr: string): string => {
  if (!dateStr) return '-';

  try {
    const date = parseDate(dateStr);
    if (isNaN(date.getTime())) return dateStr;

    return `há ${formatDistanceToNow(date, { locale: ptBR })}`;
  } catch (error) {
    console.error('Erro ao formatar data relativa:', error);
    return dateStr;
  }
};

// Verifica se o pedido está em uma situação crítica
const isCriticalStatus = (status: string): boolean => {
  if (!status) return false;

  const lowerStatus = status.toLowerCase();
  return (
    lowerStatus.includes('confirmar entrega') ||
    lowerStatus.includes('entrega falha') ||
    lowerStatus.includes('retirar nos correios')
  );
};

// Tipo para acompanhar o estado de ordenação
type Order_Direction = 'asc' | 'desc';
type OrderBy = 'dataVenda' | 'ultimaAtualizacao' | 'dataNegociacao' | 'atualizacaoCorreios' | '';

interface CobrancaHistorico {
  data: string;
  observacao: string;
  situacao: string;
}

const OrdersTable: React.FC<OrdersTableProps> = ({ orders, onOrderUpdate }) => {
  // Definir ordenação padrão por data de venda, do mais recente para o mais antigo
  const [orderBy, setOrderBy] = useState<OrderBy>('dataVenda');
  const [order, setOrder] = useState<Order_Direction>('desc');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [newObservacao, setNewObservacao] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Estado para armazenar os valores editados
  const [editedValues, setEditedValues] = useState<Partial<Order>>({});

  // Utilizar o hook de permissões
  const {
    isAdmin,
    canDeleteOrders,
    canViewDeletedOrders,
    filterOrdersByPermission
  } = useUserPermissions();

  // Histórico de cobrança simulado (em uma aplicação real, isso viria do backend)
  const [historicoCobranca, setHistoricoCobranca] = useState<CobrancaHistorico[]>([
    {
      data: '12/04/2023 14:32',
      observacao: 'Cliente solicitou mais tempo para pagamento',
      situacao: 'Negociação'
    },
    {
      data: '10/04/2023 09:15',
      observacao: 'Primeira tentativa de contato',
      situacao: 'Pagamento Pendente'
    }
  ]);

  // Função para lidar com solicitações de ordenação
  const handleRequestSort = (property: OrderBy) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  // Função para criar um comparador de ordenação
  const getComparator = (
    order: Order_Direction,
    orderBy: OrderBy
  ): (a: Order, b: Order) => number => {
    return order === 'desc'
      ? (a, b) => -compareValues(a, b, orderBy) // Invertido para ordem decrescente (mais recente primeiro)
      : (a, b) => compareValues(a, b, orderBy);
  };

  // Função para comparar valores
  const compareValues = (a: Order, b: Order, orderBy: OrderBy): number => {
    if (orderBy === '') return 0;

    if (orderBy === 'dataVenda' || orderBy === 'ultimaAtualizacao' || orderBy === 'dataNegociacao' || orderBy === 'atualizacaoCorreios') {
      // Tratar valores vazios ou nulos
      const valueA = a[orderBy] as string || '';
      const valueB = b[orderBy] as string || '';

      // Se ambos os valores estão vazios, considerar iguais
      if (!valueA && !valueB) return 0;
      // Se apenas um está vazio, colocar o vazio por último
      if (!valueA) return 1;
      if (!valueB) return -1;

      const dateA = parseDate(valueA);
      const dateB = parseDate(valueB);

      // Comparar as datas (ordem normal - o sinal será invertido na função getComparator quando order='desc')
      return dateA.getTime() - dateB.getTime();
    }

    return 0;
  };

  // Garantir que todos os pedidos tenham valores numéricos válidos
  const validatedOrders = orders.map(order => ({
    ...order,
    valorVenda: order.valorVenda !== undefined && order.valorVenda !== null ? order.valorVenda : 0,
    valorRecebido: order.valorRecebido !== undefined && order.valorRecebido !== null ? order.valorRecebido : 0,
    pagamentoParcial: order.pagamentoParcial !== undefined && order.pagamentoParcial !== null ? order.pagamentoParcial : 0
  }));

  // Aplicar ordenação aos pedidos - sem limitação de quantidade
  const sortedOrders = orderBy
    ? [...validatedOrders].sort(getComparator(order, orderBy))
    : validatedOrders;

  // Exibir o número total de pedidos no console para debug
  console.log(`Total de pedidos a serem exibidos: ${sortedOrders.length}`);
  console.log(`Ordenação atual: ${orderBy} - ${order}`);

  // Verificar as primeiras datas para debug (apenas em desenvolvimento)
  if (process.env.NODE_ENV !== 'production' && sortedOrders.length > 1 && orderBy === 'dataVenda') {
    console.log('Primeiras datas ordenadas:');
    sortedOrders.slice(0, 3).forEach((order, index) => {
      console.log(`${index + 1}. ${order.dataVenda}`);
    });
  }

  const createSortHandler = (property: OrderBy) => () => {
    handleRequestSort(property);
  };

  // Função para abrir o painel com os detalhes do pedido
  const handleOpenDrawer = (order: Order) => {
    setSelectedOrder(order);
    setDrawerOpen(true);
    setEditMode(false);
    setNewObservacao('');
  };

  // Função para fechar o painel
  const handleCloseDrawer = () => {
    setDrawerOpen(false);
    setEditMode(false);
    setSelectedOrder(null);
  };

  // Alternar modo de edição
  const handleEditClick = () => {
    if (!editMode) {
      // Inicializar os valores editados com os valores atuais do pedido
      setEditedValues(selectedOrder || {});
    } else {
      // Limpar os valores editados ao sair do modo de edição
      setEditedValues({});
    }
    setEditMode(!editMode);
  };

  // Função para salvar as alterações no pedido
  const handleSaveEdit = () => {
    if (selectedOrder && onOrderUpdate) {
      // Criar o pedido atualizado com os valores editados
      const updatedOrder = {
        ...selectedOrder,
        ...editedValues,
        ultimaAtualizacao: new Date().toLocaleDateString('pt-BR')
      };

      // Se o status for "Completo" e o valor recebido estiver vazio, usar o valor da venda
      if (
        typeof updatedOrder.situacaoVenda === 'string' &&
        updatedOrder.situacaoVenda.toLowerCase() === 'completo' &&
        (!updatedOrder.valorRecebido || updatedOrder.valorRecebido === 0) &&
        updatedOrder.valorVenda
      ) {
        updatedOrder.valorRecebido = updatedOrder.valorVenda;
      }

      console.log('Saving edited values:', editedValues);
      console.log('Updated order:', updatedOrder);

      // Chamar o callback de atualização
      onOrderUpdate(updatedOrder);

      // Atualizar o pedido selecionado
      setSelectedOrder(updatedOrder);

      // Adicionar registro ao histórico de cobrança
      const currentDate = new Date();
      const formattedDate = `${currentDate.getDate().toString().padStart(2, '0')}/${(currentDate.getMonth() + 1).toString().padStart(2, '0')}/${currentDate.getFullYear()} ${currentDate.getHours().toString().padStart(2, '0')}:${currentDate.getMinutes().toString().padStart(2, '0')}`;

      const newHistoricoItem: CobrancaHistorico = {
        data: formattedDate,
        observacao: `Informações do pedido atualizadas`,
        situacao: updatedOrder.situacaoVenda
      };

      setHistoricoCobranca([newHistoricoItem, ...historicoCobranca]);

      // Mostrar alerta de sucesso
      alert('Alterações salvas com sucesso!');
    }

    // Limpar os valores editados e sair do modo de edição
    setEditedValues({});
    setEditMode(false);
  };

  // Função para atualizar os valores editados
  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    console.log(`Editing field ${name} with value ${value}`);

    setEditedValues(prev => {
      const newValues = {
        ...prev,
        [name]: value
      };
      console.log('Updated editedValues:', newValues);
      return newValues;
    });
  };

  // Função para atualizar o status do pedido
  const handleUpdateStatus = (newStatus: string) => {
    if (selectedOrder && onOrderUpdate) {
      // Criar o pedido atualizado com o novo status
      const updatedOrder = {
        ...selectedOrder,
        situacaoVenda: newStatus
      };

      // Se o status for "Completo" e o valor recebido estiver vazio, usar o valor da venda
      if (
        newStatus.toLowerCase() === 'completo' &&
        (!selectedOrder.valorRecebido || selectedOrder.valorRecebido === 0) &&
        selectedOrder.valorVenda
      ) {
        updatedOrder.valorRecebido = selectedOrder.valorVenda;
      }

      // Chamar o callback de atualização
      onOrderUpdate(updatedOrder);

      // Adicionar registro ao histórico de cobrança
      const currentDate = new Date();
      const formattedDate = `${currentDate.getDate().toString().padStart(2, '0')}/${(currentDate.getMonth() + 1).toString().padStart(2, '0')}/${currentDate.getFullYear()} ${currentDate.getHours().toString().padStart(2, '0')}:${currentDate.getMinutes().toString().padStart(2, '0')}`;

      const newHistoricoItem: CobrancaHistorico = {
        data: formattedDate,
        observacao: `Status atualizado para: ${newStatus}`,
        situacao: newStatus
      };

      setHistoricoCobranca([newHistoricoItem, ...historicoCobranca]);
    }
  };

  // Função para abrir o diálogo de confirmação de exclusão
  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
  };

  // Função para cancelar a exclusão
  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
  };

  // Função para confirmar a exclusão
  const handleDeleteConfirm = () => {
    if (selectedOrder && onOrderUpdate) {
      // Alterar o status do pedido para "Deletado"
      const updatedOrder = {
        ...selectedOrder,
        situacaoVenda: 'Deletado',
      };

      onOrderUpdate(updatedOrder);
      setDeleteDialogOpen(false);
      handleCloseDrawer(); // Fechar o drawer após a exclusão
    }
  };

  // Adicionar observação ao histórico de cobrança
  const handleAddCobranca = () => {
    if (newObservacao.trim()) {
      const currentDate = new Date();
      const formattedDate = `${currentDate.getDate().toString().padStart(2, '0')}/${(currentDate.getMonth() + 1).toString().padStart(2, '0')}/${currentDate.getFullYear()} ${currentDate.getHours().toString().padStart(2, '0')}:${currentDate.getMinutes().toString().padStart(2, '0')}`;

      const newHistoricoItem: CobrancaHistorico = {
        data: formattedDate,
        observacao: newObservacao.trim(),
        situacao: selectedOrder?.situacaoVenda || 'Pendente'
      };

      setHistoricoCobranca([newHistoricoItem, ...historicoCobranca]);
      setNewObservacao('');
    }
  };

  // Função para filtrar pedidos deletados e mostrar apenas para admin
  const filterOrders = (orders: Order[]) => {
    return filterOrdersByPermission(orders, isAdmin);
  };

  // Aplicar o filtro de pedidos deletados
  const visibleOrders = filterOrders(sortedOrders);

  return (
    <>
      <TableContainer
        component={Paper}
        elevation={0}
        sx={{
          borderRadius: 2,
          overflow: 'hidden',
        }}
      >
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID Venda</TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'dataVenda'}
                  direction={orderBy === 'dataVenda' ? order : 'asc'}
                  onClick={createSortHandler('dataVenda')}
                >
                  Data Venda
                  <Box component="span" sx={{ border: 0, clip: 'rect(0 0 0 0)', height: 1, margin: -1, overflow: 'hidden', padding: 0, position: 'absolute', top: 20, width: 1 }}>
                    {order === 'desc' ? 'Ordenar decrescente' : 'Ordenar crescente'}
                  </Box>
                </TableSortLabel>
              </TableCell>
              <TableCell>Cliente</TableCell>
              <TableCell>Situação</TableCell>
              <TableCell>Rastreio</TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'atualizacaoCorreios'}
                  direction={orderBy === 'atualizacaoCorreios' ? order : 'asc'}
                  onClick={createSortHandler('atualizacaoCorreios')}
                >
                  Atualização Correios
                  <Box component="span" sx={{ border: 0, clip: 'rect(0 0 0 0)', height: 1, margin: -1, overflow: 'hidden', padding: 0, position: 'absolute', top: 20, width: 1 }}>
                    {order === 'desc' ? 'Ordenar decrescente' : 'Ordenar crescente'}
                  </Box>
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'dataNegociacao'}
                  direction={orderBy === 'dataNegociacao' ? order : 'asc'}
                  onClick={createSortHandler('dataNegociacao')}
                >
                  Última Cobrança
                  <Box component="span" sx={{ border: 0, clip: 'rect(0 0 0 0)', height: 1, margin: -1, overflow: 'hidden', padding: 0, position: 'absolute', top: 20, width: 1 }}>
                    {order === 'desc' ? 'Ordenar decrescente' : 'Ordenar crescente'}
                  </Box>
                </TableSortLabel>
              </TableCell>
              <TableCell>Data Recebimento</TableCell>
              <TableCell>Data Negociação</TableCell>
              <TableCell>Vendedor</TableCell>
              <TableCell>Operador</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {visibleOrders.map((order, index) => {
              const isCritical = isCriticalStatus(order.situacaoVenda);
              return (
                <TableRow
                  key={order.idVenda || index}
                  sx={{
                    '&:hover': {
                      bgcolor: 'primary.light',
                    },
                    ...(isCritical && {
                      bgcolor: 'rgba(255, 72, 66, 0.12)',
                      '&:hover': {
                        bgcolor: 'rgba(255, 72, 66, 0.18)',
                      },
                      borderLeft: '3px solid',
                      borderColor: 'error.main',
                    }),
                    cursor: 'pointer',
                  }}
                  onClick={() => handleOpenDrawer(order)}
                >
                  <TableCell>{order.idVenda}</TableCell>
                  <TableCell>{order.dataVenda}</TableCell>
                  <TableCell sx={{ fontWeight: 500 }}>{order.cliente}</TableCell>
                  <TableCell>
                    <StatusChip status={order.situacaoVenda} />
                  </TableCell>
                  <TableCell>
                    {order.codigoRastreio ? (
                      <TrackingStatusChip
                        trackingCode={order.codigoRastreio}
                        refreshInterval={7200000} // 2 horas
                        onStatusUpdate={(status, formattedTimestamp) => {
                          // Update the order with the new status and timestamp
                          if (onOrderUpdate && formattedTimestamp) {
                            const updatedOrder = {
                              ...order,
                              statusCorreios: status,
                              atualizacaoCorreios: formattedTimestamp
                            };
                            onOrderUpdate(updatedOrder);
                          }
                        }}
                      />
                    ) : (
                      <Typography variant="body2" color="text.secondary">Sem rastreio</Typography>
                    )}
                  </TableCell>
                  <TableCell sx={{ color: 'text.secondary' }}>{order.atualizacaoCorreios || '-'}</TableCell>
                  <TableCell>
                    <Tooltip title={order.dataNegociacao || "Sem cobrança"}>
                      <Typography variant="body2">
                        {order.dataNegociacao ? formatRelativeTime(order.dataNegociacao) : "-"}
                      </Typography>
                    </Tooltip>
                  </TableCell>
                  <TableCell>{order.dataRecebimento || "-"}</TableCell>
                  <TableCell>{order.dataNegociacao || "-"}</TableCell>
                  <TableCell>{order.vendedor || "-"}</TableCell>
                  <TableCell>{order.operador || "-"}</TableCell>
                </TableRow>
              );
            })}
            {orders.length === 0 && (
              <TableRow>
                <TableCell colSpan={11} align="center" sx={{ py: 3 }}>
                  <Typography variant="body1" color="text.secondary">
                    Nenhum pedido encontrado
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Painel lateral com detalhes do pedido */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={handleCloseDrawer}
        sx={{
          '& .MuiDrawer-paper': {
            width: { xs: '100%', sm: '550px' },
            overflow: 'auto',
            p: 0,
            bgcolor: '#FAFAFA',
          },
        }}
      >
        {selectedOrder && (
          <>
            {/* Cabeçalho */}
            <Box
              sx={{
                p: 3,
                background: 'linear-gradient(to right, #f5f7ff, #eef1fd)',
                borderBottom: '1px solid rgba(0,0,0,0.08)',
                position: 'sticky',
                top: 0,
                zIndex: 10,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="h6" fontWeight={600} sx={{ color: '#2c3e50' }}>
                  #{selectedOrder.idVenda}
                </Typography>
                <Box>
                  {/* Botão de edição */}
                  <IconButton
                    aria-label="editar"
                    onClick={handleEditClick}
                    sx={{ color: '#2c3e50' }}
                  >
                    <EditIcon />
                  </IconButton>

                  {/* Botão de excluir apenas para admins */}
                  {canDeleteOrders() && (
                    <IconButton
                      aria-label="excluir"
                      onClick={handleDeleteClick}
                      sx={{ color: '#d32f2f' }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  )}

                  {/* Botão de fechar */}
                  <IconButton
                    aria-label="fechar"
                    onClick={handleCloseDrawer}
                    sx={{ color: '#2c3e50' }}
                  >
                    <CloseIcon />
                  </IconButton>
                </Box>
              </Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {selectedOrder.dataVenda} • {selectedOrder.cliente}
              </Typography>

              <StatusChip status={selectedOrder.situacaoVenda} />
            </Box>

            {/* Conteúdo principal com scroll */}
            <Box sx={{ p: 3 }}>
              {/* Botões de ações rápidas */}
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  mb: 3,
                  borderRadius: 2,
                  border: '1px solid rgba(0,0,0,0.08)',
                  bgcolor: 'white'
                }}
              >
                <Typography variant="subtitle2" sx={{ mb: 1.5, color: '#637381', fontWeight: 600 }}>
                  Ações Rápidas
                </Typography>

                <Grid container spacing={1}>
                  <Grid item xs={6} sm={3}>
                    <Button
                      variant="outlined"
                      startIcon={<CheckCircleOutlineIcon />}
                      onClick={() => handleUpdateStatus('Completo')}
                      color="success"
                      size="small"
                      fullWidth
                      sx={{
                        borderRadius: 1.5,
                        textTransform: 'none',
                        py: 0.7,
                      }}
                    >
                      Finalizar
                    </Button>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Button
                      variant="outlined"
                      startIcon={<PendingOutlinedIcon />}
                      onClick={() => handleUpdateStatus('Pagamento Pendente')}
                      color="warning"
                      size="small"
                      fullWidth
                      sx={{
                        borderRadius: 1.5,
                        textTransform: 'none',
                        py: 0.7,
                      }}
                    >
                      Pendente
                    </Button>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Button
                      variant="outlined"
                      startIcon={<HandshakeOutlinedIcon />}
                      onClick={() => handleUpdateStatus('Negociação')}
                      color="info"
                      size="small"
                      fullWidth
                      sx={{
                        borderRadius: 1.5,
                        textTransform: 'none',
                        py: 0.7,
                      }}
                    >
                      Negociação
                    </Button>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Button
                      variant="outlined"
                      startIcon={<CancelOutlinedIcon />}
                      onClick={() => handleUpdateStatus('Frustrado')}
                      color="error"
                      size="small"
                      fullWidth
                      sx={{
                        borderRadius: 1.5,
                        textTransform: 'none',
                        py: 0.7,
                      }}
                    >
                      Frustrado
                    </Button>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Button
                      variant="outlined"
                      startIcon={<EditIcon />}
                      onClick={() => {
                        const obsField = document.getElementById('observacao-field');
                        if (obsField) {
                          obsField.scrollIntoView({ behavior: 'smooth' });
                          obsField.focus();
                        }
                      }}
                      color="primary"
                      size="small"
                      fullWidth
                      sx={{
                        borderRadius: 1.5,
                        textTransform: 'none',
                        py: 0.7,
                      }}
                    >
                      Obs.
                    </Button>
                  </Grid>
                </Grid>

                <Box sx={{ mt: 1.5, display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    variant={editMode ? "contained" : "text"}
                    startIcon={<EditIcon />}
                    onClick={handleEditClick}
                    color="primary"
                    size="small"
                    sx={{
                      borderRadius: 1.5,
                      textTransform: 'none',
                    }}
                  >
                    {editMode ? 'Cancelar Edição' : 'Editar Informações'}
                  </Button>
                </Box>
              </Paper>

              {/* Informações principais */}
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  mb: 3,
                  borderRadius: 2,
                  border: '1px solid rgba(0,0,0,0.08)',
                  bgcolor: 'white'
                }}
              >
                <Typography variant="subtitle2" sx={{ mb: 2, color: '#637381', fontWeight: 600 }}>
                  Informações do Pedido
                </Typography>

                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                      Cliente
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {selectedOrder.cliente || '-'}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                      Telefone
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {selectedOrder.telefone || '-'}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                      Documento Cliente
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {selectedOrder.documentoCliente || '-'}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                      Oferta
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {selectedOrder.oferta || '-'}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                      Última Cobrança
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {selectedOrder.dataNegociacao || '-'}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                      Valor da Venda
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500, color: '#4caf50' }}>
                      {selectedOrder.valorVenda !== undefined && selectedOrder.valorVenda !== null
                        ? `R$ ${selectedOrder.valorVenda.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                        : 'R$ 0,00'}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                      Código de Rastreio
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {selectedOrder.codigoRastreio || '-'}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                      Vendedor
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {selectedOrder.vendedor || '-'}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                      Operador
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {selectedOrder.operador || '-'}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                      Zap
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {selectedOrder.zap || '-'}
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>

              {/* Endereço de Entrega */}
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  mb: 3,
                  borderRadius: 2,
                  border: '1px solid rgba(0,0,0,0.08)',
                  bgcolor: 'white'
                }}
              >
                <Typography variant="subtitle2" sx={{ mb: 2, color: '#637381', fontWeight: 600 }}>
                  Endereço de Entrega
                </Typography>

                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                      Rua
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {selectedOrder.ruaDestinatario}, {selectedOrder.numeroEnderecoDestinatario}
                    </Typography>
                  </Grid>

                  {selectedOrder.complementoDestinatario && (
                    <Grid item xs={12} sm={6}>
                      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                        Complemento
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {selectedOrder.complementoDestinatario}
                      </Typography>
                    </Grid>
                  )}

                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                      Bairro
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {selectedOrder.bairroDestinatario}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                      CEP
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {selectedOrder.cepDestinatario}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                      Cidade
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {selectedOrder.cidadeDestinatario}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                      Estado
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {selectedOrder.estadoDestinatario}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                      Última Atualização
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {selectedOrder.ultimaAtualizacao || '-'}
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>

              {/* Informações de Pagamento */}
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  mb: 3,
                  borderRadius: 2,
                  border: '1px solid rgba(0,0,0,0.08)',
                  bgcolor: 'white'
                }}
              >
                <Typography variant="subtitle2" sx={{ mb: 2, color: '#637381', fontWeight: 600 }}>
                  Pagamento
                </Typography>

                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                      Valor Recebido
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500, color: '#4caf50' }}>
                      {(() => {
                        // For completed sales with empty valor recebido, use the valor venda
                        if (
                          typeof selectedOrder.situacaoVenda === 'string' &&
                          selectedOrder.situacaoVenda.toLowerCase() === 'completo' &&
                          (!selectedOrder.valorRecebido || selectedOrder.valorRecebido === 0)
                        ) {
                          return `R$ ${selectedOrder.valorVenda.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} (valor da venda)`;
                        } else {
                          return selectedOrder.valorRecebido !== undefined && selectedOrder.valorRecebido !== null
                            ? `R$ ${selectedOrder.valorRecebido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                            : 'R$ 0,00';
                        }
                      })()}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                      Forma de Pagamento
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {selectedOrder.formaPagamento || '-'}
                    </Typography>
                  </Grid>

                  {selectedOrder.parcial && (
                    <Grid item xs={12} sm={6}>
                      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                        Pagamento Parcial
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {selectedOrder.pagamentoParcial !== undefined && selectedOrder.pagamentoParcial !== null
                          ? `R$ ${selectedOrder.pagamentoParcial.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                          : 'R$ 0,00'}
                      </Typography>
                    </Grid>
                  )}

                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                      Data Recebimento
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {selectedOrder.dataRecebimento || '-'}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                      Data Negociação
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {selectedOrder.dataNegociacao || '-'}
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>

              {/* Formulário de Edição (visível apenas em modo de edição) */}
              {editMode && (
                <>
                  {isAdmin ? (
                    <AdminEditForm
                      selectedOrder={selectedOrder}
                      editedValues={editedValues}
                      handleEditChange={handleEditChange}
                      handleSaveEdit={handleSaveEdit}
                    />
                  ) : (
                    <UserEditForm
                      selectedOrder={selectedOrder}
                      editedValues={editedValues}
                      handleEditChange={handleEditChange}
                      handleSaveEdit={handleSaveEdit}
                    />
                  )}
                </>
              )}

              {/* Histórico de Cobrança */}
              <Paper
                elevation={0}
                sx={{
                  borderRadius: 2,
                  border: '1px solid rgba(0,0,0,0.08)',
                  bgcolor: 'white',
                  overflow: 'hidden'
                }}
              >
                <Box sx={{ p: 2, borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
                  <Typography variant="subtitle2" sx={{ color: '#637381', fontWeight: 600 }}>
                    Histórico de Cobrança
                  </Typography>
                </Box>

                <Box sx={{ p: 2, bgcolor: 'rgba(0,0,0,0.02)' }}>
                  <TextField
                    id="observacao-field"
                    label="Nova observação"
                    multiline
                    rows={2}
                    value={newObservacao}
                    onChange={(e) => setNewObservacao(e.target.value)}
                    fullWidth
                    variant="outlined"
                    size="small"
                    sx={{
                      mb: 1.5,
                      '.MuiOutlinedInput-root': {
                        bgcolor: 'white',
                      }
                    }}
                  />

                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleAddCobranca}
                    disabled={!newObservacao.trim()}
                    size="small"
                    sx={{
                      borderRadius: 1.5,
                      textTransform: 'none',
                    }}
                  >
                    Adicionar Registro
                  </Button>
                </Box>

                <List sx={{ maxHeight: 300, overflow: 'auto' }}>
                  {historicoCobranca.map((item, index) => (
                    <React.Fragment key={index}>
                      <ListItem
                        alignItems="flex-start"
                        sx={{
                          py: 1.5,
                          px: 2,
                          '&:hover': { bgcolor: 'rgba(0,0,0,0.02)' },
                        }}
                      >
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                {item.data}
                              </Typography>
                              <StatusChip status={item.situacao} />
                            </Box>
                          }
                          secondary={
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{
                                display: 'block',
                                bgcolor: 'rgba(0,0,0,0.02)',
                                p: 1,
                                borderRadius: 1,
                                mt: 0.5
                              }}
                            >
                              {item.observacao}
                            </Typography>
                          }
                        />
                      </ListItem>
                      {index < historicoCobranca.length - 1 && (
                        <Divider component="li" sx={{ borderStyle: 'dashed' }} />
                      )}
                    </React.Fragment>
                  ))}
                  {historicoCobranca.length === 0 && (
                    <ListItem sx={{ py: 3 }}>
                      <ListItemText
                        primary={
                          <Typography
                            align="center"
                            color="text.secondary"
                            sx={{ fontStyle: 'italic' }}
                          >
                            Nenhum histórico de cobrança registrado
                          </Typography>
                        }
                      />
                    </ListItem>
                  )}
                </List>
              </Paper>
            </Box>
          </>
        )}
      </Drawer>

      {/* Diálogo de confirmação de exclusão */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          Confirmar exclusão do pedido
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Tem certeza que deseja marcar este pedido como deletado? Esta ação só poderá ser visualizada por administradores.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} color="primary">
            Cancelar
          </Button>
          <Button onClick={handleDeleteConfirm} color="error" autoFocus>
            Deletar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default OrdersTable;