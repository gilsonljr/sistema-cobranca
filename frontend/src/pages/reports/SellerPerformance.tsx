import React, { useState, useEffect } from 'react';
import {
  Grid, Paper, Typography, Box,
  Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Avatar, Chip,
  LinearProgress, Rating, Card, CardContent,
  FormControl, InputLabel, Select, MenuItem,
  SelectChangeEvent, Divider
} from '@mui/material';
import {
  BarChart, Bar, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, LineChart, Line
} from 'recharts';
import { Order } from '../../types/Order';

// Define the SellerData interface
interface SellerData {
  id: string;
  name: string;
  avatar: string;
  role: string;
  email: string;
  totalOrders: number;
  totalValue: number;
  receivedValue: number;
  conversionRate: number;
  averageValue: number;
  successRate: number;
  averageTicket: number;
  efficiency: string;
  performance: number;
}

// Simulação de vendedores (será substituída por dados reais)
const mockSellers = [
  { id: 1, name: 'Maria Oliveira', email: 'maria@wolf.com', role: 'Vendedor Sênior', avatar: 'MO' },
  { id: 2, name: 'Roberto Almeida', email: 'roberto@wolf.com', role: 'Vendedor Pleno', avatar: 'RA' },
  { id: 3, name: 'Juliana Costa', email: 'juliana@wolf.com', role: 'Vendedor Júnior', avatar: 'JC' },
  { id: 4, name: 'Fernando Gomes', email: 'fernando@wolf.com', role: 'Vendedor Sênior', avatar: 'FG' },
  { id: 5, name: 'Camila Dias', email: 'camila@wolf.com', role: 'Vendedor Pleno', avatar: 'CD' },
];

interface SellerPerformanceProps {
  orders: Order[];
  startDate?: Date;
  endDate?: Date;
}

const SellerPerformance: React.FC<SellerPerformanceProps> = ({
  orders, startDate, endDate
}) => {
  const [timeFrame, setTimeFrame] = useState('monthly');
  const [sellerName, setSellerName] = useState<string>('');
  const [sellers, setSellers] = useState<any[]>([]);
  const [selectedSeller, setSelectedSeller] = useState<string | 'all'>('all');
  const [selectedSellerData, setSelectedSellerData] = useState<SellerData | null>(null);
  const [performanceData, setPerformanceData] = useState<any[]>([]);
  const [comparisonData, setComparisonData] = useState<any[]>([]);
  const [timeSeriesData, setTimeSeriesData] = useState<any[]>([]);
  const [radarData, setRadarData] = useState<any[]>([]);

  // Filter out deleted orders
  const nonDeletedOrders = orders.filter(order => 
    !order.situacaoVenda || order.situacaoVenda.toLowerCase() !== 'deletado'
  );

  // Extrair vendedores únicos dos pedidos
  useEffect(() => {
    // Extrair vendedores únicos dos pedidos
    console.log('Pedidos recebidos:', nonDeletedOrders.length);
    console.log('Amostra de vendedores:', nonDeletedOrders.slice(0, 5).map(order => order.vendedor));

    const uniqueSellers = Array.from(new Set(nonDeletedOrders.map(order => order.vendedor)))
      .filter(seller => seller && seller.trim() !== '')
      .map((seller, index) => ({
        id: index + 1,
        name: seller,
        email: `${seller.toLowerCase().replace(/\s+/g, '.')}@default.com`,
        role: 'Vendedor',
        avatar: seller.split(' ').map(name => name[0] || '').join('').toUpperCase().substring(0, 2) || 'VD'
      }));

    console.log('Vendedores únicos encontrados:', uniqueSellers);

    // Se não houver vendedores nos pedidos, usar os mockSellers
    setSellers(uniqueSellers.length > 0 ? uniqueSellers : mockSellers);
  }, [nonDeletedOrders]);

  useEffect(() => {
    if (sellers.length > 0) {
      // Calcular métricas de performance
      calculatePerformanceMetrics();
      // Preparar dados para comparação
      prepareComparisonData();
      // Preparar dados de série temporal
      prepareTimeSeriesData();
      // Preparar dados para o gráfico radar
      prepareRadarData();
    }
  }, [nonDeletedOrders, selectedSeller, startDate, endDate, sellers]);

  const calculatePerformanceMetrics = () => {
    // Filtrar pedidos pelo período selecionado
    let periodFilteredOrders = nonDeletedOrders;

    if (startDate || endDate) {
      const startDateTime = startDate ? new Date(startDate) : new Date(0); // Data mínima se não houver startDate
      const endDateTime = endDate ? new Date(endDate) : new Date(); // Data atual se não houver endDate

      periodFilteredOrders = nonDeletedOrders.filter(order => {
        if (!order.dataVenda) return false;

        try {
          // Verificar o formato da data (DD/MM/YYYY ou YYYY-MM-DD)
          let orderDate;
          if (order.dataVenda.includes('/')) {
            // Formato brasileiro DD/MM/YYYY
            const parts = order.dataVenda.split('/');
            if (parts.length === 3) {
              // Converter para YYYY-MM-DD para criar o objeto Date
              orderDate = new Date(`${parts[2]}-${parts[1]}-${parts[0]}T00:00:00`);
            } else {
              return false;
            }
          } else {
            // Assumir formato ISO YYYY-MM-DD
            orderDate = new Date(order.dataVenda);
          }

          if (isNaN(orderDate.getTime())) {
            console.warn('Data inválida após conversão:', order.dataVenda);
            return false;
          }

          return orderDate >= startDateTime && orderDate <= endDateTime;
        } catch (error) {
          console.warn('Data inválida encontrada:', order.dataVenda);
          return false;
        }
      });
    }

    // Calcular métricas para cada vendedor
    const metrics = sellers.map(seller => {
      // Filtrar pedidos por vendedor
      const sellerOrders = periodFilteredOrders.filter(order => {
        if (!order.vendedor || !seller) return false;

        // Normalizar strings para comparação
        const orderVendedor = order.vendedor.trim().toLowerCase();
        const sellerName = seller.trim().toLowerCase();

        console.log(`Comparando: '${orderVendedor}' com '${sellerName}'`);
        return orderVendedor === sellerName;
      });

      console.log(`Pedidos encontrados para ${seller}: ${sellerOrders.length}`);

      // Calcular métricas
      const totalOrders = sellerOrders.length;
      const totalValue = sellerOrders.reduce((sum, order) => sum + order.valorVenda, 0);
      const receivedValue = sellerOrders.reduce((sum, order) => sum + order.valorRecebido, 0);
      const conversionRate = totalValue > 0 ? (receivedValue / totalValue) * 100 : 0;
      const averageValue = totalOrders > 0 ? totalValue / totalOrders : 0;

      // Calcular taxa de sucesso
      const successfulOrders = sellerOrders.filter(order =>
        order.situacaoVenda?.toLowerCase() === 'completo' ||
        order.valorRecebido >= order.valorVenda
      ).length;
      const successRate = totalOrders > 0 ? (successfulOrders / totalOrders) * 100 : 0;

      // Calcular ticket médio
      const averageTicket = totalOrders > 0 ? totalValue / totalOrders : 0;

      // Determinar eficiência com base nas métricas
      let efficiency = 'Média';
      if (conversionRate > 80 && averageTicket > 200) {
        efficiency = 'Alta';
      } else if (conversionRate < 50 || averageTicket < 100) {
        efficiency = 'Baixa';
      }

      // Calcular performance geral (1-5)
      const performance = (
        (conversionRate / 100) * 2.5 +
        (successRate / 100) * 1.5 +
        (Math.min(1, averageTicket / 300)) * 1
      );

      return {
        id: seller.name,
        name: seller.name,
        avatar: seller.avatar,
        role: seller.role,
        email: seller.email,
        totalOrders,
        totalValue,
        receivedValue,
        conversionRate: Math.round(conversionRate),
        averageValue,
        successRate: Math.round(successRate),
        averageTicket: Math.round(averageTicket),
        efficiency,
        performance: Math.min(5, Math.max(1, performance))
      };
    });

    setPerformanceData(metrics);
  };

  const prepareComparisonData = () => {
    // Preparar dados para comparação entre vendedores
    const comparisonMetrics = performanceData.map(seller => ({
      name: seller.name,
      taxaConversao: seller.conversionRate,
      ticketMedio: Math.round(seller.averageTicket / 10), // Normalizar para o gráfico
      taxaSucesso: seller.successRate
    }));

    setComparisonData(comparisonMetrics);
  };

  const prepareTimeSeriesData = () => {
    // Preparar dados de série temporal para o vendedor selecionado
    const now = new Date();
    const data = [];

    // Gerar dados para os últimos 30 dias
    for (let i = 0; i < 30; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() - (30 - i - 1));

      // Para cada vendedor, gerar dados simulados
      const sellerData: Record<string, any> = {
        date: date.toLocaleDateString('pt-BR')
      };

      sellers.forEach(seller => {
        // Simulação de vendas diárias com alguma variação
        const baseRate = performanceData.find(p => p.name === seller.name)?.conversionRate || 70;
        const variation = Math.sin(i * 0.2) * 15; // Variação senoidal para simular tendências
        const dailyRate = Math.max(0, Math.min(100, baseRate + variation));

        sellerData[`seller${seller.name}`] = Math.round(dailyRate);
      });

      data.push(sellerData);
    }

    setTimeSeriesData(data);
  };

  const prepareRadarData = () => {
    // Preparar dados para o gráfico radar
    if (selectedSeller === 'all') {
      // Dados para todos os vendedores
      const data = [
        { subject: 'Taxa de Conversão', fullMark: 100 },
        { subject: 'Taxa de Sucesso', fullMark: 100 },
        { subject: 'Ticket Médio', fullMark: 100 },
        { subject: 'Volume de Vendas', fullMark: 100 },
        { subject: 'Valor Total', fullMark: 100 },
      ];

      // Adicionar dados de cada vendedor
      performanceData.forEach(seller => {
        // Usar tipagem segura com indexação
        (data[0] as any)[seller.name] = seller.conversionRate;
        (data[1] as any)[seller.name] = seller.successRate;

        // Normalizar ticket médio (0-100)
        const maxTicket = 500; // Valor máximo esperado para ticket médio
        (data[2] as any)[seller.name] = Math.min(100, (seller.averageTicket / maxTicket) * 100);

        // Normalizar volume de vendas (0-100)
        const maxOrders = Math.max(...performanceData.map(p => p.totalOrders));
        (data[3] as any)[seller.name] = maxOrders > 0 ? (seller.totalOrders / maxOrders) * 100 : 0;

        // Normalizar valor total (0-100)
        const maxTotalValue = Math.max(...performanceData.map(p => p.totalValue));
        (data[4] as any)[seller.name] = maxTotalValue > 0 ? (seller.totalValue / maxTotalValue) * 100 : 0;
      });

      setRadarData(data);
    } else {
      // Dados para um vendedor específico
      const sellerData = performanceData.find(seller => seller.name === selectedSeller);

      if (sellerData) {
        const maxTicket = 500; // Valor máximo esperado para ticket médio

        const data = [
          { subject: 'Taxa de Conversão', value: sellerData.conversionRate, fullMark: 100 },
          { subject: 'Taxa de Sucesso', value: sellerData.successRate, fullMark: 100 },
          { subject: 'Ticket Médio', value: Math.min(100, (sellerData.averageTicket / maxTicket) * 100), fullMark: 100 },
          { subject: 'Volume de Vendas', value: Math.min(100, sellerData.totalOrders * 5), fullMark: 100 },
          { subject: 'Valor Total', value: Math.min(100, (sellerData.totalValue / 10000) * 10), fullMark: 100 },
        ];

        setRadarData(data);
      }
    }
  };

  const handleSellerChange = (event: SelectChangeEvent) => {
    setSelectedSeller(event.target.value);
  };

  // Remove the second declaration and use useEffect to update the state value when selectedSeller or performanceData changes
  useEffect(() => {
    if (selectedSeller !== 'all' && performanceData.length > 0) {
      const sellerData = performanceData.find(seller => seller.name === selectedSeller);
      setSelectedSellerData(sellerData || null);
    } else {
      setSelectedSellerData(null);
    }
  }, [selectedSeller, performanceData]);

  return (
    <Box sx={{ p: 3, bgcolor: '#f9fafc' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 500, color: '#334155' }}>
          Performance de Vendedores
        </Typography>

        <FormControl size="small" sx={{ minWidth: 200, '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}>
          <InputLabel>Vendedor</InputLabel>
          <Select
            value={selectedSeller}
            label="Vendedor"
            onChange={handleSellerChange}
          >
            <MenuItem value="all">Todos os Vendedores</MenuItem>
            {sellers.map(seller => (
              <MenuItem key={seller.name} value={seller.name}>{seller.name}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {selectedSeller === 'all' ? (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper sx={{ p: 3, borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.1)' }}>
              <Typography variant="h6" sx={{ fontWeight: 500, color: '#334155', mb: 2 }}>
                Comparação de Performance
              </Typography>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={comparisonData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value: any) => `${value}%`} />
                  <Legend />
                  <Bar dataKey="taxaConversao" name="Taxa de Conversão (%)" fill="#8884d8" />
                  <Bar dataKey="taxaSucesso" name="Taxa de Sucesso (%)" fill="#82ca9d" />
                  <Bar dataKey="ticketMedio" name="Ticket Médio (R$ x10)" fill="#ffc658" />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.1)' }}>
              <Typography variant="h6" sx={{ fontWeight: 500, color: '#334155', mb: 2 }}>
                Análise Comparativa
              </Typography>
              <ResponsiveContainer width="100%" height={400}>
                <RadarChart outerRadius={150} data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="subject" />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} />
                  {sellers.map((seller, index) => (
                    <Radar
                      key={seller.name}
                      name={seller.name}
                      dataKey={seller.name}
                      stroke={`hsl(${index * 45}, 70%, 50%)`}
                      fill={`hsl(${index * 45}, 70%, 50%)`}
                      fillOpacity={0.3}
                    />
                  ))}
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.1)' }}>
              <Typography variant="h6" sx={{ fontWeight: 500, color: '#334155', mb: 2 }}>
                Tendência de Conversão (30 dias)
              </Typography>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={timeSeriesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  {sellers.map((seller, index) => (
                    <Line
                      key={seller.name}
                      type="monotone"
                      dataKey={`seller${seller.name}`}
                      name={seller.name}
                      stroke={`hsl(${index * 45}, 70%, 50%)`}
                      activeDot={{ r: 8 }}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          <Grid item xs={12}>
            <Paper sx={{ p: 3, borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.1)' }}>
              <Typography variant="h6" sx={{ fontWeight: 500, color: '#334155', mb: 2 }}>
                Tabela de Performance
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Vendedor</TableCell>
                      <TableCell align="center">Total de Vendas</TableCell>
                      <TableCell align="center">Valor Total (R$)</TableCell>
                      <TableCell align="center">Valor Recebido (R$)</TableCell>
                      <TableCell align="center">Taxa de Conversão</TableCell>
                      <TableCell align="center">Ticket Médio (R$)</TableCell>
                      <TableCell align="center">Eficiência</TableCell>
                      <TableCell align="center">Performance</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {performanceData.map((seller) => (
                      <TableRow key={seller.name}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Avatar sx={{ bgcolor: `hsl(${sellers.indexOf(seller.name) * 45}, 70%, 50%)`, mr: 1 }}>
                              {seller.avatar}
                            </Avatar>
                            <Box>
                              <Typography variant="body2" fontWeight={500}>
                                {seller.name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {seller.role}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell align="center">{seller.totalOrders}</TableCell>
                        <TableCell align="center">
                          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(seller.totalValue)}
                        </TableCell>
                        <TableCell align="center">
                          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(seller.receivedValue)}
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={`${seller.conversionRate}%`}
                            color={
                              seller.conversionRate >= 80 ? 'success' :
                              seller.conversionRate >= 50 ? 'primary' : 'error'
                            }
                            size="small"
                            sx={{ minWidth: 70 }}
                          />
                        </TableCell>
                        <TableCell align="center">
                          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(seller.averageTicket)}
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={seller.efficiency}
                            color={
                              seller.efficiency === 'Alta' ? 'success' :
                              seller.efficiency === 'Média' ? 'primary' : 'error'
                            }
                            size="small"
                            sx={{ minWidth: 70 }}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Rating value={seller.performance} readOnly precision={0.5} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>
        </Grid>
      ) : (
        selectedSellerData && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 3, borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.1)' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Avatar sx={{ bgcolor: `hsl(${sellers.indexOf(selectedSeller) * 45}, 70%, 50%)`, width: 64, height: 64, mr: 2 }}>
                    {selectedSellerData.avatar}
                  </Avatar>
                  <Box>
                    <Typography variant="h6" fontWeight={500}>
                      {selectedSellerData.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {selectedSellerData.role}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {selectedSellerData.email}
                    </Typography>
                  </Box>
                </Box>

                <Divider sx={{ my: 2 }} />

                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Total de Vendas
                    </Typography>
                    <Typography variant="h6" fontWeight={500}>
                      {selectedSellerData.totalOrders}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Valor Total
                    </Typography>
                    <Typography variant="h6" fontWeight={500}>
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(selectedSellerData.totalValue)}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Valor Recebido
                    </Typography>
                    <Typography variant="h6" fontWeight={500}>
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(selectedSellerData.receivedValue)}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Ticket Médio
                    </Typography>
                    <Typography variant="h6" fontWeight={500}>
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(selectedSellerData.averageTicket)}
                    </Typography>
                  </Grid>
                </Grid>

                <Divider sx={{ my: 2 }} />

                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Taxa de Conversão
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box sx={{ flexGrow: 1, mr: 1 }}>
                    <LinearProgress
                      variant="determinate"
                      value={selectedSellerData.conversionRate}
                      color={
                        selectedSellerData.conversionRate >= 80 ? 'success' :
                        selectedSellerData.conversionRate >= 50 ? 'primary' : 'error'
                      }
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                  </Box>
                  <Typography variant="body2" fontWeight={500}>
                    {selectedSellerData.conversionRate}%
                  </Typography>
                </Box>

                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Taxa de Sucesso
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box sx={{ flexGrow: 1, mr: 1 }}>
                    <LinearProgress
                      variant="determinate"
                      value={selectedSellerData.successRate}
                      color={
                        selectedSellerData.successRate >= 80 ? 'success' :
                        selectedSellerData.successRate >= 50 ? 'primary' : 'error'
                      }
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                  </Box>
                  <Typography variant="body2" fontWeight={500}>
                    {selectedSellerData.successRate}%
                  </Typography>
                </Box>

                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Performance Geral
                </Typography>
                <Rating value={selectedSellerData.performance} readOnly precision={0.5} size="large" />
              </Paper>
            </Grid>

            <Grid item xs={12} md={8}>
              <Paper sx={{ p: 3, borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.1)' }}>
                <Typography variant="h6" sx={{ fontWeight: 500, color: '#334155', mb: 2 }}>
                  Análise de Performance
                </Typography>
                <ResponsiveContainer width="100%" height={400}>
                  <RadarChart outerRadius={150} data={radarData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="subject" />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} />
                    <Radar
                      name={selectedSellerData.name}
                      dataKey="value"
                      stroke={`hsl(${sellers.indexOf(selectedSeller) * 45}, 70%, 50%)`}
                      fill={`hsl(${sellers.indexOf(selectedSeller) * 45}, 70%, 50%)`}
                      fillOpacity={0.6}
                    />
                    <Legend />
                  </RadarChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>

            <Grid item xs={12}>
              <Paper sx={{ p: 3, borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.1)' }}>
                <Typography variant="h6" sx={{ fontWeight: 500, color: '#334155', mb: 2 }}>
                  Tendência de Conversão (30 dias)
                </Typography>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={timeSeriesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey={`seller${selectedSeller}`}
                      name={selectedSeller}
                      stroke={`hsl(${sellers.indexOf(selectedSeller) * 45}, 70%, 50%)`}
                      activeDot={{ r: 8 }}
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>
          </Grid>
        )
      )}
    </Box>
  );
};

export default SellerPerformance;
