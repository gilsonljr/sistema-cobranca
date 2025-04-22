import React, { useState, useEffect } from 'react';
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
  Card, CardContent,
  Grid,
  Badge,
  Chip,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  SelectChangeEvent,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  EmojiEvents as EmojiEventsIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Remove as RemoveIcon,
} from '@mui/icons-material';
import { Order } from '../types/Order';
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface OperadorRanking {
  operador: string;
  totalPedidos: number;
  pedidosPagos: number;
  valorTotal: number;
  taxaConversao: number;
  posicao: number;
  posicaoAnterior: number;
  tendencia: 'up' | 'down' | 'stable';
}

const OperadorRankingPage: React.FC = () => {
  const [rankings, setRankings] = useState<OperadorRanking[]>([]);
  const [previousRankings, setPreviousRankings] = useState<OperadorRanking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<string>('month');

  // Função para calcular o ranking com base nos pedidos
  const calculateRanking = (orders: Order[], previousOrders: Order[] = []): { current: OperadorRanking[], previous: OperadorRanking[] } => {
    // Agrupar pedidos por operador
    const operadorMap = new Map<string, { totalPedidos: number, pedidosPagos: number, valorTotal: number }>();
    
    // Processar pedidos atuais
    orders.forEach(order => {
      if (!order.operador) return;
      
      const operador = order.operador;
      const isPago = order.situacaoVenda === 'Pago';
      
      if (!operadorMap.has(operador)) {
        operadorMap.set(operador, { totalPedidos: 0, pedidosPagos: 0, valorTotal: 0 });
      }
      
      const stats = operadorMap.get(operador)!;
      stats.totalPedidos += 1;
      if (isPago) {
        stats.pedidosPagos += 1;
        stats.valorTotal += order.valorVenda;
      }
    });
    
    // Converter para array e calcular taxa de conversão
    let rankingArray = Array.from(operadorMap.entries()).map(([operador, stats]) => {
      const taxaConversao = stats.totalPedidos > 0 ? (stats.pedidosPagos / stats.totalPedidos) * 100 : 0;
      
      return {
        operador,
        totalPedidos: stats.totalPedidos,
        pedidosPagos: stats.pedidosPagos,
        valorTotal: stats.valorTotal,
        taxaConversao,
        posicao: 0, // Será definido após a ordenação
        posicaoAnterior: 0, // Será atualizado depois
        tendencia: 'stable' as 'up' | 'down' | 'stable',
      };
    });
    
    // Ordenar por valor total (decrescente)
    rankingArray.sort((a, b) => b.valorTotal - a.valorTotal);
    
    // Atribuir posições
    rankingArray.forEach((item, index) => {
      item.posicao = index + 1;
    });
    
    // Calcular ranking anterior usando a mesma lógica
    const previousOperadorMap = new Map<string, { totalPedidos: number, pedidosPagos: number, valorTotal: number }>();
    
    previousOrders.forEach(order => {
      if (!order.operador) return;
      
      const operador = order.operador;
      const isPago = order.situacaoVenda === 'Pago';
      
      if (!previousOperadorMap.has(operador)) {
        previousOperadorMap.set(operador, { totalPedidos: 0, pedidosPagos: 0, valorTotal: 0 });
      }
      
      const stats = previousOperadorMap.get(operador)!;
      stats.totalPedidos += 1;
      if (isPago) {
        stats.pedidosPagos += 1;
        stats.valorTotal += order.valorVenda;
      }
    });
    
    let previousRankingArray = Array.from(previousOperadorMap.entries()).map(([operador, stats]) => {
      const taxaConversao = stats.totalPedidos > 0 ? (stats.pedidosPagos / stats.totalPedidos) * 100 : 0;
      
      return {
        operador,
        totalPedidos: stats.totalPedidos,
        pedidosPagos: stats.pedidosPagos,
        valorTotal: stats.valorTotal,
        taxaConversao,
        posicao: 0,
        posicaoAnterior: 0,
        tendencia: 'stable' as 'up' | 'down' | 'stable',
      };
    });
    
    // Ordenar por valor total (decrescente)
    previousRankingArray.sort((a, b) => b.valorTotal - a.valorTotal);
    
    // Atribuir posições
    previousRankingArray.forEach((item, index) => {
      item.posicao = index + 1;
    });
    
    // Atualizar posições anteriores e tendências no ranking atual
    rankingArray.forEach(item => {
      const previousItem = previousRankingArray.find(prev => prev.operador === item.operador);
      
      if (previousItem) {
        item.posicaoAnterior = previousItem.posicao;
        
        if (item.posicao < item.posicaoAnterior) {
          item.tendencia = 'up';
        } else if (item.posicao > item.posicaoAnterior) {
          item.tendencia = 'down';
        } else {
          item.tendencia = 'stable';
        }
      } else {
        item.posicaoAnterior = 0; // Novo operador
        item.tendencia = 'stable';
      }
    });
    
    return { current: rankingArray, previous: previousRankingArray };
  };

  // Função para buscar dados de ranking
  const fetchRankingData = () => {
    setLoading(true);
    setError(null);
    
    try {
      // Obter todos os pedidos do localStorage
      const storedOrders = localStorage.getItem('orders');
      if (!storedOrders) {
        setError('Nenhum pedido encontrado');
        setLoading(false);
        return;
      }
      
      const allOrders: Order[] = JSON.parse(storedOrders);
      
      // Definir datas de início e fim com base no período selecionado
      const today = new Date();
      let startDate: Date;
      let previousStartDate: Date;
      let previousEndDate: Date;
      
      switch (period) {
        case 'week':
          startDate = subDays(today, 7);
          previousStartDate = subDays(startDate, 7);
          previousEndDate = subDays(startDate, 1);
          break;
        case 'month':
          startDate = startOfMonth(today);
          previousStartDate = startOfMonth(subDays(startDate, 1));
          previousEndDate = endOfMonth(previousStartDate);
          break;
        case 'quarter':
          startDate = subDays(today, 90);
          previousStartDate = subDays(startDate, 90);
          previousEndDate = subDays(startDate, 1);
          break;
        default:
          startDate = startOfMonth(today);
          previousStartDate = startOfMonth(subDays(startDate, 1));
          previousEndDate = endOfMonth(previousStartDate);
      }
      
      // Filtrar pedidos para o período atual
      const currentPeriodOrders = allOrders.filter(order => {
        const orderDate = new Date(order.dataVenda.split('/').reverse().join('-'));
        return orderDate >= startDate && orderDate <= today;
      });
      
      // Filtrar pedidos para o período anterior
      const previousPeriodOrders = allOrders.filter(order => {
        const orderDate = new Date(order.dataVenda.split('/').reverse().join('-'));
        return orderDate >= previousStartDate && orderDate <= previousEndDate;
      });
      
      // Calcular rankings
      const { current, previous } = calculateRanking(currentPeriodOrders, previousPeriodOrders);
      
      setRankings(current);
      setPreviousRankings(previous);
    } catch (err) {
      setError('Erro ao carregar dados de ranking: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setLoading(false);
    }
  };

  // Carregar dados quando o componente montar ou o período mudar
  useEffect(() => {
    fetchRankingData();
  }, [period]);

  // Função para lidar com a mudança de período
  const handlePeriodChange = (event: SelectChangeEvent) => {
    setPeriod(event.target.value);
  };

  // Função para renderizar o ícone de tendência
  const renderTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <TrendingUpIcon fontSize="small" sx={{ color: 'success.main' }} />;
      case 'down':
        return <TrendingDownIcon fontSize="small" sx={{ color: 'error.main' }} />;
      default:
        return <RemoveIcon fontSize="small" sx={{ color: 'text.secondary' }} />;
    }
  };

  // Função para formatar valor monetário
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  // Função para formatar percentual
  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" gutterBottom>
          Ranking de Operadores
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          <FormControl variant="outlined" size="small" sx={{ minWidth: 150 }}>
            <InputLabel id="period-select-label">Período</InputLabel>
            <Select
              labelId="period-select-label"
              id="period-select"
              value={period}
              onChange={handlePeriodChange}
              label="Período"
            >
              <MenuItem value="week">Última Semana</MenuItem>
              <MenuItem value="month">Mês Atual</MenuItem>
              <MenuItem value="quarter">Último Trimestre</MenuItem>
            </Select>
          </FormControl>
          
          <Button
            variant="outlined"
            onClick={fetchRankingData}
            disabled={loading}
          >
            Atualizar
          </Button>
        </Box>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* Top 3 Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {rankings.slice(0, 3).map((operador, index) => (
              <Grid item xs={12} md={4} key={operador.operador}>
                <Paper
                  elevation={3}
                  sx={{
                    p: 3,
                    borderRadius: '12px',
                    bgcolor: index === 0 ? 'rgba(255, 215, 0, 0.05)' : 'background.paper',
                    border: index === 0 ? '1px solid rgba(255, 215, 0, 0.3)' : 'none',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: index === 0 ? '#FFD700' : index === 1 ? '#C0C0C0' : '#CD7F32',
                        color: 'common.white',
                        mr: 2,
                        fontWeight: 'bold',
                      }}
                    >
                      {index + 1}
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 500, flexGrow: 1 }}>
                      {operador.operador}
                    </Typography>
                    {operador.tendencia !== 'stable' && (
                      <Chip
                        icon={renderTrendIcon(operador.tendencia)}
                        label={operador.posicaoAnterior > 0 ? `#${operador.posicaoAnterior}` : 'Novo'}
                        size="small"
                        color={operador.tendencia === 'up' ? 'success' : 'error'}
                        variant="outlined"
                      />
                    )}
                  </Box>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Pedidos Pagos
                      </Typography>
                      <Typography variant="h6">
                        {operador.pedidosPagos}/{operador.totalPedidos}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Conversão
                      </Typography>
                      <Typography variant="h6">
                        {formatPercentage(operador.taxaConversao)}
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="body2" color="text.secondary">
                        Valor Total
                      </Typography>
                      <Typography variant="h5" sx={{ fontWeight: 600, color: index === 0 ? '#FFD700' : 'text.primary' }}>
                        {formatCurrency(operador.valorTotal)}
                      </Typography>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
            ))}
          </Grid>
          
          {/* Tabela de Ranking Completa */}
          <TableContainer component={Paper} sx={{ borderRadius: '12px' }}>
            <Table>
              <TableHead sx={{ bgcolor: 'background.neutral' }}>
                <TableRow>
                  <TableCell>Posição</TableCell>
                  <TableCell>Operador</TableCell>
                  <TableCell align="right">Pedidos</TableCell>
                  <TableCell align="right">Pagos</TableCell>
                  <TableCell align="right">Taxa de Conversão</TableCell>
                  <TableCell align="right">Valor Total</TableCell>
                  <TableCell align="center">Tendência</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rankings.map((operador) => (
                  <TableRow key={operador.operador} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {operador.posicao <= 3 ? (
                          <EmojiEventsIcon
                            sx={{
                              color:
                                operador.posicao === 1
                                  ? '#FFD700'
                                  : operador.posicao === 2
                                  ? '#C0C0C0'
                                  : '#CD7F32',
                              mr: 1,
                            }}
                          />
                        ) : null}
                        #{operador.posicao}
                      </Box>
                    </TableCell>
                    <TableCell>{operador.operador}</TableCell>
                    <TableCell align="right">{operador.totalPedidos}</TableCell>
                    <TableCell align="right">{operador.pedidosPagos}</TableCell>
                    <TableCell align="right">{formatPercentage(operador.taxaConversao)}</TableCell>
                    <TableCell align="right">{formatCurrency(operador.valorTotal)}</TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {renderTrendIcon(operador.tendencia)}
                        {operador.posicaoAnterior > 0 && operador.tendencia !== 'stable' ? (
                          <Typography variant="body2" sx={{ ml: 0.5 }}>
                            de #{operador.posicaoAnterior}
                          </Typography>
                        ) : operador.posicaoAnterior === 0 ? (
                          <Chip label="Novo" size="small" color="info" sx={{ ml: 1 }} />
                        ) : null}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
                {rankings.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      Nenhum dado de ranking disponível para o período selecionado.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}
    </Box>
  );
};

export default OperadorRankingPage;
