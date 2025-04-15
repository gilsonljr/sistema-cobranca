import React, { useState, useEffect } from 'react';
import { 
  Grid, Paper, Typography, Box, 
  Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Avatar, Chip,
  LinearProgress, Rating, Card, CardContent,
  FormControl, InputLabel, Select, MenuItem,
  SelectChangeEvent, Divider, Alert, AlertTitle
} from '@mui/material';
import { Order } from '../../types/Order';

// Simulação de operadores
const mockOperators = [
  { id: 1, name: 'João Silva', email: 'joao.silva@exemplo.com', role: 'Operador Sênior', avatar: 'JS' },
  { id: 2, name: 'Maria Oliveira', email: 'maria.oliveira@exemplo.com', role: 'Operador Pleno', avatar: 'MO' },
  { id: 3, name: 'Pedro Santos', email: 'pedro.santos@exemplo.com', role: 'Operador Júnior', avatar: 'PS' },
  { id: 4, name: 'Ana Souza', email: 'ana.souza@exemplo.com', role: 'Operador Sênior', avatar: 'AS' },
  { id: 5, name: 'Carlos Ferreira', email: 'carlos.ferreira@exemplo.com', role: 'Operador Pleno', avatar: 'CF' },
];

interface OperatorPerformanceProps {
  orders: Order[];
  startDate?: Date;
  endDate?: Date;
}

const OperatorPerformanceSimple: React.FC<OperatorPerformanceProps> = ({ 
  orders, startDate, endDate 
}) => {
  const [selectedOperator, setSelectedOperator] = useState<string | 'all'>('all');
  const [performanceData, setPerformanceData] = useState<any[]>([]);
  const [operators] = useState(mockOperators);
  
  useEffect(() => {
    // Calcular métricas de performance
    calculatePerformanceMetrics();
  }, [orders, selectedOperator, startDate, endDate]);
  
  const calculatePerformanceMetrics = () => {
    // Calcular métricas para cada operador
    const metrics = operators.map(operator => {
      // Filtrar pedidos por operador (simulado)
      const operatorOrders = orders.filter((_, index) => index % operators.length === operator.id - 1);
      
      // Calcular métricas
      const totalOrders = operatorOrders.length;
      const totalValue = operatorOrders.reduce((sum, order) => sum + order.valorVenda, 0);
      const receivedValue = operatorOrders.reduce((sum, order) => sum + order.valorRecebido, 0);
      const conversionRate = totalValue > 0 ? (receivedValue / totalValue) * 100 : 0;
      const averageValue = totalOrders > 0 ? totalValue / totalOrders : 0;
      
      // Calcular tempo médio de cobrança (simulado)
      const avgCollectionTime = Math.floor(Math.random() * 10) + 1; // 1-10 dias
      
      // Calcular taxa de sucesso (simulado)
      const successfulOrders = operatorOrders.filter(order => 
        order.situacaoVenda?.toLowerCase() === 'completo' || 
        order.valorRecebido >= order.valorVenda
      ).length;
      const successRate = totalOrders > 0 ? (successfulOrders / totalOrders) * 100 : 0;
      
      // Determinar eficiência com base nas métricas
      let efficiency = 'Média';
      if (conversionRate > 80 && avgCollectionTime < 5) {
        efficiency = 'Alta';
      } else if (conversionRate < 50 || avgCollectionTime > 8) {
        efficiency = 'Baixa';
      }
      
      // Calcular performance geral (1-5)
      const performance = (
        (conversionRate / 100) * 2.5 + 
        (successRate / 100) * 1.5 + 
        (1 - (avgCollectionTime / 10)) * 1
      );
      
      return {
        id: operator.id,
        name: operator.name,
        avatar: operator.avatar,
        role: operator.role,
        email: operator.email,
        totalOrders,
        totalValue,
        receivedValue,
        conversionRate: Math.round(conversionRate),
        averageValue,
        successRate: Math.round(successRate),
        avgCollectionTime,
        efficiency,
        performance: Math.min(5, Math.max(1, performance))
      };
    });
    
    setPerformanceData(metrics);
  };
  
  const handleOperatorChange = (event: SelectChangeEvent) => {
    setSelectedOperator(event.target.value);
  };
  
  // Obter dados do operador selecionado
  const selectedOperatorData = selectedOperator !== 'all' 
    ? performanceData.find(op => op.id === Number(selectedOperator))
    : null;
  
  return (
    <Box sx={{ p: 3 }}>
      <Alert severity="info" sx={{ mb: 3 }}>
        <AlertTitle>Versão Simplificada</AlertTitle>
        Esta é uma versão simplificada da Performance de Operadores sem gráficos. Para visualizar a versão completa com gráficos, instale a biblioteca Recharts:
        <Box component="pre" sx={{ mt: 1, p: 1, bgcolor: 'background.paper', borderRadius: 1 }}>
          npm install --save recharts @types/recharts
        </Box>
      </Alert>
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5" fontWeight={600}>
          Performance de Operadores
        </Typography>
        
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Operador</InputLabel>
          <Select
            value={selectedOperator}
            label="Operador"
            onChange={handleOperatorChange}
          >
            <MenuItem value="all">Todos os Operadores</MenuItem>
            {operators.map(op => (
              <MenuItem key={op.id} value={op.id.toString()}>{op.name}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
      
      {selectedOperator === 'all' ? (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Comparação de Performance
              </Typography>
              <Typography variant="body1" paragraph>
                Para visualizar gráficos comparativos de performance, instale a biblioteca Recharts.
              </Typography>
            </Paper>
          </Grid>
          
          <Grid item xs={12}>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Operador</TableCell>
                    <TableCell>Pedidos</TableCell>
                    <TableCell>Valor Total</TableCell>
                    <TableCell>Valor Recebido</TableCell>
                    <TableCell>Taxa de Conversão</TableCell>
                    <TableCell>Tempo Médio</TableCell>
                    <TableCell>Eficiência</TableCell>
                    <TableCell>Performance</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {performanceData.map((op) => (
                    <TableRow key={op.id}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar sx={{ mr: 2 }}>{op.avatar}</Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight={500}>
                              {op.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {op.role}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>{op.totalOrders}</TableCell>
                      <TableCell>R$ {op.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</TableCell>
                      <TableCell>R$ {op.receivedValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Box sx={{ width: '100%', mr: 1 }}>
                            <LinearProgress 
                              variant="determinate" 
                              value={op.conversionRate} 
                              color={op.conversionRate > 70 ? "success" : op.conversionRate > 40 ? "warning" : "error"}
                              sx={{ height: 8, borderRadius: 4 }}
                            />
                          </Box>
                          <Box sx={{ minWidth: 35 }}>
                            <Typography variant="body2" color="text.secondary">
                              {op.conversionRate}%
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>{op.avgCollectionTime} dias</TableCell>
                      <TableCell>
                        <Chip 
                          label={op.efficiency} 
                          color={op.efficiency === 'Alta' ? "success" : op.efficiency === 'Média' ? "warning" : "error"}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Rating value={op.performance} readOnly precision={0.5} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
        </Grid>
      ) : (
        <Grid container spacing={3}>
          {/* Detalhes do operador selecionado */}
          {selectedOperatorData && (
            <>
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar sx={{ width: 56, height: 56, mr: 2, bgcolor: 'primary.main' }}>
                        {selectedOperatorData.avatar}
                      </Avatar>
                      <Box>
                        <Typography variant="h6">
                          {selectedOperatorData.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {selectedOperatorData.role}
                        </Typography>
                      </Box>
                    </Box>
                    
                    <Divider sx={{ my: 2 }} />
                    
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Performance Geral
                      </Typography>
                      <Rating value={selectedOperatorData.performance} readOnly precision={0.5} size="large" />
                    </Box>
                    
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Eficiência
                      </Typography>
                      <Chip 
                        label={selectedOperatorData.efficiency} 
                        color={selectedOperatorData.efficiency === 'Alta' ? "success" : selectedOperatorData.efficiency === 'Média' ? "warning" : "error"}
                      />
                    </Box>
                    
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Email
                      </Typography>
                      <Typography variant="body2">
                        {selectedOperatorData.email}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={8}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Métricas de Performance
                  </Typography>
                  
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6} md={3}>
                      <Box sx={{ textAlign: 'center', p: 2 }}>
                        <Typography variant="h4" color="primary.main" fontWeight={700}>
                          {selectedOperatorData.totalOrders}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Total de Pedidos
                        </Typography>
                      </Box>
                    </Grid>
                    
                    <Grid item xs={12} sm={6} md={3}>
                      <Box sx={{ textAlign: 'center', p: 2 }}>
                        <Typography variant="h4" color="primary.main" fontWeight={700}>
                          {selectedOperatorData.conversionRate}%
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Taxa de Conversão
                        </Typography>
                      </Box>
                    </Grid>
                    
                    <Grid item xs={12} sm={6} md={3}>
                      <Box sx={{ textAlign: 'center', p: 2 }}>
                        <Typography variant="h4" color="primary.main" fontWeight={700}>
                          {selectedOperatorData.successRate}%
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Taxa de Sucesso
                        </Typography>
                      </Box>
                    </Grid>
                    
                    <Grid item xs={12} sm={6} md={3}>
                      <Box sx={{ textAlign: 'center', p: 2 }}>
                        <Typography variant="h4" color="primary.main" fontWeight={700}>
                          {selectedOperatorData.avgCollectionTime}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Tempo Médio (dias)
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                  
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      Valores
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
                          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                            Valor Total
                          </Typography>
                          <Typography variant="h5" color="text.primary">
                            R$ {selectedOperatorData.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </Typography>
                        </Paper>
                      </Grid>
                      
                      <Grid item xs={12} sm={6}>
                        <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
                          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                            Valor Recebido
                          </Typography>
                          <Typography variant="h5" color="success.main">
                            R$ {selectedOperatorData.receivedValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </Typography>
                        </Paper>
                      </Grid>
                    </Grid>
                  </Box>
                </Paper>
              </Grid>
              
              <Grid item xs={12}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Análise de Competências
                  </Typography>
                  <Typography variant="body1">
                    Para visualizar gráficos de análise de competências, instale a biblioteca Recharts.
                  </Typography>
                </Paper>
              </Grid>
            </>
          )}
        </Grid>
      )}
    </Box>
  );
};

export default OperatorPerformanceSimple;
