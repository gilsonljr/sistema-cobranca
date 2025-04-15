import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  List,
  ListItem,
  ListItemText,
  Divider,
  CircularProgress,
  Alert,
} from '@mui/material';

const CheckOrdersPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const checkOrders = () => {
    setLoading(true);
    setResults([]);
    setError(null);

    try {
      // Obter pedidos do localStorage
      const ordersJson = localStorage.getItem('orders');
      if (!ordersJson) {
        setResults(prev => [...prev, 'Nenhum pedido encontrado no localStorage']);
        setLoading(false);
        return;
      }

      const orders = JSON.parse(ordersJson);
      setResults(prev => [...prev, `Total de pedidos no localStorage: ${orders.length}`]);

      // Mostrar os primeiros 5 pedidos
      if (orders.length > 0) {
        setResults(prev => [...prev, 'Primeiros 5 pedidos:']);
        orders.slice(0, 5).forEach((order: any, index: number) => {
          setResults(prev => [...prev, `Pedido ${index + 1}: ID=${order.idVenda}, Cliente=${order.cliente}, Data=${order.dataVenda}, Status=${order.situacaoVenda}`]);
        });
      }

      // Verificar se há alguma limitação no código
      setResults(prev => [...prev, '\nVerificando possíveis limitações:']);
      
      // Verificar se há algum filtro aplicado
      const filteredOrders = orders.filter((order: any) => order.situacaoVenda !== 'Cancelado');
      setResults(prev => [...prev, `Pedidos após filtro (excluindo cancelados): ${filteredOrders.length}`]);

      // Verificar se há alguma paginação
      const page = 0;
      const rowsPerPage = 10;
      const paginatedOrders = orders.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
      setResults(prev => [...prev, `Pedidos na primeira página (${rowsPerPage} por página): ${paginatedOrders.length}`]);

      // Verificar produtos no localStorage
      const productsJson = localStorage.getItem('products');
      if (productsJson) {
        const products = JSON.parse(productsJson);
        setResults(prev => [...prev, `\nTotal de produtos no localStorage: ${products.length}`]);
        
        // Verificar se há ofertas
        let totalOffers = 0;
        products.forEach((product: any) => {
          totalOffers += product.offers ? product.offers.length : 0;
        });
        setResults(prev => [...prev, `Total de ofertas: ${totalOffers}`]);
      } else {
        setResults(prev => [...prev, '\nNenhum produto encontrado no localStorage']);
      }
    } catch (error) {
      console.error('Erro ao verificar pedidos:', error);
      setError(`Erro ao verificar pedidos: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Verificação de Pedidos
      </Typography>
      
      <Paper sx={{ p: 3, mb: 3, borderRadius: '12px' }}>
        <Typography variant="body1" paragraph>
          Esta página verifica o estado atual dos pedidos no sistema e identifica possíveis limitações.
        </Typography>
        
        <Button
          variant="contained"
          color="primary"
          onClick={checkOrders}
          disabled={loading}
          sx={{ mb: 3 }}
        >
          {loading ? <CircularProgress size={24} /> : 'Verificar Pedidos'}
        </Button>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        {results.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Resultados:
            </Typography>
            
            <List>
              {results.map((line, index) => (
                <React.Fragment key={index}>
                  <ListItem>
                    <ListItemText primary={line} />
                  </ListItem>
                  {index < results.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </Box>
        )}
      </Paper>
      
      <Button
        variant="outlined"
        color="primary"
        href="/"
        sx={{ mt: 2 }}
      >
        Voltar para a Página Principal
      </Button>
    </Box>
  );
};

export default CheckOrdersPage;
