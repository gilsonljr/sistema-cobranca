import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Grid,
  Alert,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material';
import { Product, Offer, generateId } from '../types/Product';
import ProductService from '../services/ProductService';
import { Order } from '../types/Order';

const CreateOffersPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  // Função para criar ofertas para o produto "Potencia Azul"
  const createOffersForPotenciaAzul = () => {
    setLoading(true);
    setResult([]);
    setError(null);
    setSuccess(false);

    try {
      // Obter pedidos
      const ordersJson = localStorage.getItem('orders');
      const orders: Order[] = ordersJson ? JSON.parse(ordersJson) : [];

      setResult(prev => [...prev, `Total de pedidos encontrados: ${orders.length}`]);

      if (orders.length === 0) {
        setError('Nenhum pedido encontrado. Não é possível criar ofertas.');
        setLoading(false);
        return;
      }

      // Extrair ofertas únicas dos pedidos
      const uniqueOffers = new Map<string, { name: string, price: number, count: number }>();

      orders.forEach(order => {
        // Verificar se o pedido tem oferta e valor
        if (order.oferta && order.valorVenda) {
          // Usar o nome da oferta como chave
          const offerName = order.oferta.trim();

          // Se a oferta já existe, verificar se o valor é o mesmo
          if (uniqueOffers.has(offerName)) {
            const existingOffer = uniqueOffers.get(offerName)!;

            // Se o valor for diferente, criar uma nova oferta com o valor
            if (existingOffer.price !== order.valorVenda) {
              const newOfferName = `${offerName} - ${order.valorVenda.toFixed(2)}`;
              uniqueOffers.set(newOfferName, {
                name: newOfferName,
                price: order.valorVenda,
                count: 1
              });
            } else {
              // Incrementar contador
              existingOffer.count++;
            }
          } else {
            // Adicionar nova oferta
            uniqueOffers.set(offerName, {
              name: offerName,
              price: order.valorVenda,
              count: 1
            });
          }
        }
      });

      setResult(prev => [...prev, `Ofertas únicas encontradas: ${uniqueOffers.size}`]);

      // Obter produtos
      const products = ProductService.getProducts();

      // Encontrar o produto "Potencia Azul"
      const potenciaAzulIndex = products.findIndex(p => p.name === "Potencia Azul");

      if (potenciaAzulIndex === -1) {
        setResult(prev => [...prev, 'Produto "Potencia Azul" não encontrado. Criando produto...']);

        // Criar produto
        const newProduct: Product = {
          id: generateId(),
          name: "Potencia Azul",
          description: "Produto criado automaticamente com base nas vendas existentes",
          active: true,
          offers: []
        };

        // Adicionar ofertas
        uniqueOffers.forEach(offer => {
          newProduct.offers.push({
            id: generateId(),
            name: offer.name,
            description: `Oferta criada automaticamente (${offer.count} vendas)`,
            price: offer.price,
            active: true,
            variation: 'gel', // Valor padrão, pode ser ajustado conforme necessário
            gelQuantity: 1,
            capsulasQuantity: 0
          });
        });

        // Adicionar produto à lista
        products.push(newProduct);

        // Salvar produtos
        ProductService.saveProducts(products);

        setResult(prev => [...prev, `Produto "Potencia Azul" criado com ${newProduct.offers.length} ofertas.`]);
      } else {
        setResult(prev => [...prev, `Produto "Potencia Azul" encontrado. Adicionando ofertas...`]);

        // Obter produto
        const potenciaAzul = products[potenciaAzulIndex];

        // Criar mapa de ofertas existentes
        const existingOffers = new Map<string, Offer>();
        potenciaAzul.offers.forEach(offer => {
          existingOffers.set(offer.name, offer);
        });

        // Contador de ofertas adicionadas
        let addedCount = 0;

        // Adicionar ofertas que não existem
        uniqueOffers.forEach(offer => {
          if (!existingOffers.has(offer.name)) {
            potenciaAzul.offers.push({
              id: generateId(),
              name: offer.name,
              description: `Oferta criada automaticamente (${offer.count} vendas)`,
              price: offer.price,
              active: true,
              variation: 'gel', // Valor padrão, pode ser ajustado conforme necessário
              gelQuantity: 1,
              capsulasQuantity: 0
            });
            addedCount++;
          }
        });

        // Salvar produtos
        ProductService.saveProducts(products);

        setResult(prev => [...prev, `${addedCount} novas ofertas adicionadas ao produto "Potencia Azul".`]);
      }

      setResult(prev => [...prev, 'Processo concluído!']);
      setSuccess(true);
    } catch (error) {
      console.error('Erro ao criar ofertas:', error);
      setError(`Erro ao criar ofertas: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Criar Ofertas para Potencia Azul
      </Typography>

      <Paper sx={{ p: 3, mb: 3, borderRadius: '12px' }}>
        <Typography variant="body1" paragraph>
          Esta página irá analisar todos os pedidos existentes no sistema e criar ofertas para o produto "Potencia Azul" com base nos valores encontrados.
        </Typography>

        <Button
          variant="contained"
          color="primary"
          onClick={createOffersForPotenciaAzul}
          disabled={loading}
          sx={{ mb: 3 }}
        >
          {loading ? <CircularProgress size={24} /> : 'Criar Ofertas'}
        </Button>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Ofertas criadas com sucesso!
          </Alert>
        )}

        {result.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Resultado:
            </Typography>

            <List>
              {result.map((line, index) => (
                <React.Fragment key={index}>
                  <ListItem>
                    <ListItemText primary={line} />
                  </ListItem>
                  {index < result.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </Box>
        )}
      </Paper>

      <Button
        variant="outlined"
        color="primary"
        href="/products"
        sx={{ mt: 2 }}
      >
        Ir para Gerenciamento de Produtos
      </Button>
    </Box>
  );
};

export default CreateOffersPage;
