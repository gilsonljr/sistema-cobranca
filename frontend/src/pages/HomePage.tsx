import React from 'react';
import { Box, Container, Typography, Button, Grid, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const HomePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* Hero Section */}
      <Box
        sx={{
          bgcolor: 'primary.main',
          color: 'white',
          py: 8,
          textAlign: 'center',
        }}
      >
        <Container maxWidth="md">
          <Typography variant="h2" component="h1" gutterBottom>
            Sistema de Cobrança Inteligente
          </Typography>
          <Typography variant="h5" gutterBottom>
            Gerencie suas cobranças de forma eficiente e automatizada
          </Typography>
          <Button
            variant="contained"
            color="secondary"
            size="large"
            sx={{ mt: 4 }}
            onClick={() => navigate('/login')}
          >
            Acessar Sistema
          </Button>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography variant="h4" component="h2" align="center" gutterBottom>
          Funcionalidades Principais
        </Typography>
        <Grid container spacing={4} sx={{ mt: 4 }}>
          <Grid item xs={12} md={4}>
            <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                Integração Automática
              </Typography>
              <Typography>
                Receba pedidos automaticamente via webhook e distribua-os equitativamente entre os operadores.
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                Controle Avançado
              </Typography>
              <Typography>
                Gerencie pedidos, operadores e supervisores com diferentes níveis de acesso e permissões.
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                Monitoramento em Tempo Real
              </Typography>
              <Typography>
                Acompanhe o status das cobranças e o tempo de atualização de cada pedido.
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Container>

      {/* Benefits Section */}
      <Box sx={{ bgcolor: 'grey.100', py: 8 }}>
        <Container maxWidth="lg">
          <Typography variant="h4" component="h2" align="center" gutterBottom>
            Benefícios
          </Typography>
          <Grid container spacing={4} sx={{ mt: 4 }}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Eficiência Operacional
              </Typography>
              <Typography>
                Automatize processos e reduza o tempo gasto com tarefas manuais.
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Segurança
              </Typography>
              <Typography>
                Sistema seguro com diferentes níveis de acesso e autenticação robusta.
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Relatórios Detalhados
              </Typography>
              <Typography>
                Acompanhe o desempenho com relatórios personalizados e filtros avançados.
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Integração com Correios
              </Typography>
              <Typography>
                Acompanhe automaticamente o status das entregas através da API dos Correios.
              </Typography>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
};

export default HomePage; 