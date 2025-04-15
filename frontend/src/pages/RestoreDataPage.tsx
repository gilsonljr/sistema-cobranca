import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Alert,
  CircularProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@mui/material';
import RestoreIcon from '@mui/icons-material/Restore';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import WarningIcon from '@mui/icons-material/Warning';
import InfoIcon from '@mui/icons-material/Info';
import { useNavigate } from 'react-router-dom';

const RestoreDataPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  // Sample orders data
  const sampleOrders = [
    {
      idVenda: "W001",
      dataVenda: "2023-05-01",
      cliente: "João Silva",
      telefone: "(11) 98765-4321",
      oferta: "Potencia Azul - 2 Gel + 2 Cápsulas",
      valorVenda: 197.90,
      situacaoVenda: "Aprovado",
      vendedor: "Maria Oliveira",
      operador: "Ludimila",
      cep: "01310-200",
      endereco: "Av. Paulista, 1000",
      bairro: "Bela Vista",
      cidade: "São Paulo",
      estado: "SP",
      formaPagamento: "Cartão de Crédito",
      statusPagamento: "Pago",
      codigoRastreio: "BR123456789BR",
      statusEntrega: "Entregue"
    },
    {
      idVenda: "W002",
      dataVenda: "2023-05-02",
      cliente: "Maria Santos",
      telefone: "(11) 91234-5678",
      oferta: "Potencia Azul - 3 Gel",
      valorVenda: 147.90,
      situacaoVenda: "Aprovado",
      vendedor: "Maria Oliveira",
      operador: "Ana Souza",
      cep: "04538-132",
      endereco: "Rua Itaim, 500",
      bairro: "Itaim Bibi",
      cidade: "São Paulo",
      estado: "SP",
      formaPagamento: "Boleto",
      statusPagamento: "Pago",
      codigoRastreio: "BR987654321BR",
      statusEntrega: "Em trânsito"
    },
    {
      idVenda: "W003",
      dataVenda: "2023-05-03",
      cliente: "Pedro Oliveira",
      telefone: "(21) 98888-7777",
      oferta: "Potencia Azul - 2 Cápsulas",
      valorVenda: 97.90,
      situacaoVenda: "Pendente",
      vendedor: "Vendedor",
      operador: "Carlos Ferreira",
      cep: "22031-070",
      endereco: "Rua Copacabana, 100",
      bairro: "Copacabana",
      cidade: "Rio de Janeiro",
      estado: "RJ",
      formaPagamento: "Pix",
      statusPagamento: "Aguardando",
      codigoRastreio: "",
      statusEntrega: "Aguardando pagamento"
    },
    {
      idVenda: "W004",
      dataVenda: "2023-05-04",
      cliente: "Ana Pereira",
      telefone: "(31) 97777-6666",
      oferta: "Potencia Azul - 1 Gel + 1 Cápsulas",
      valorVenda: 97.90,
      situacaoVenda: "Aprovado",
      vendedor: "Maria Oliveira",
      operador: "Pedro Santos",
      cep: "30130-110",
      endereco: "Av. Afonso Pena, 1500",
      bairro: "Centro",
      cidade: "Belo Horizonte",
      estado: "MG",
      formaPagamento: "Cartão de Crédito",
      statusPagamento: "Pago",
      codigoRastreio: "BR555666777BR",
      statusEntrega: "Entregue"
    },
    {
      idVenda: "W005",
      dataVenda: "2023-05-05",
      cliente: "Carlos Souza",
      telefone: "(41) 96666-5555",
      oferta: "Potencia Azul - 4 Gel",
      valorVenda: 197.90,
      situacaoVenda: "Cancelado",
      vendedor: "Vendedor",
      operador: "João Silva",
      cep: "80010-010",
      endereco: "Rua XV de Novembro, 700",
      bairro: "Centro",
      cidade: "Curitiba",
      estado: "PR",
      formaPagamento: "Boleto",
      statusPagamento: "Cancelado",
      codigoRastreio: "",
      statusEntrega: "Cancelado"
    }
  ];

  // Sample products data
  const sampleProducts = [
    {
      id: 1,
      name: "Potencia Azul",
      description: "Suplemento para saúde masculina",
      active: true,
      offers: [
        {
          id: 1,
          name: "2 Gel + 2 Cápsulas",
          description: "Combo completo",
          price: 197.90,
          active: true,
          variation: "gel",
          gelQuantity: 2,
          capsulasQuantity: 2
        },
        {
          id: 2,
          name: "3 Gel",
          description: "Tratamento intensivo gel",
          price: 147.90,
          active: true,
          variation: "gel",
          gelQuantity: 3,
          capsulasQuantity: 0
        },
        {
          id: 3,
          name: "2 Cápsulas",
          description: "Tratamento com cápsulas",
          price: 97.90,
          active: true,
          variation: "capsulas",
          gelQuantity: 0,
          capsulasQuantity: 2
        },
        {
          id: 4,
          name: "1 Gel + 1 Cápsulas",
          description: "Combo inicial",
          price: 97.90,
          active: true,
          variation: "gel",
          gelQuantity: 1,
          capsulasQuantity: 1
        },
        {
          id: 5,
          name: "4 Gel",
          description: "Tratamento completo gel",
          price: 197.90,
          active: true,
          variation: "gel",
          gelQuantity: 4,
          capsulasQuantity: 0
        }
      ]
    }
  ];

  // Sample users data
  const sampleUsers = [
    {
      id: 1,
      nome: "Admin",
      email: "admin@sistema.com",
      papeis: ["admin"],
      permissoes: ["criar_usuario", "editar_usuario", "excluir_usuario", "ver_relatorios", "editar_configuracoes", "ver_todos_pedidos", "editar_pedidos"],
      ativo: true
    },
    {
      id: 2,
      nome: "Supervisor",
      email: "supervisor@sistema.com",
      papeis: ["supervisor"],
      permissoes: ["ver_relatorios", "ver_todos_pedidos", "editar_pedidos"],
      ativo: true
    },
    {
      id: 3,
      nome: "Operador",
      email: "operador@sistema.com",
      papeis: ["collector"],
      permissoes: ["ver_pedidos_atribuidos", "editar_pedidos_atribuidos"],
      ativo: true
    },
    {
      id: 4,
      nome: "Vendedor",
      email: "vendedor@sistema.com",
      papeis: ["seller"],
      permissoes: ["ver_pedidos_proprios", "criar_pedidos"],
      ativo: true
    },
    {
      id: 101,
      nome: "João Silva",
      email: "joao@wolf.com",
      papeis: ["collector"],
      permissoes: ["ver_pedidos_atribuidos", "editar_pedidos_atribuidos"],
      ativo: true
    },
    {
      id: 102,
      nome: "Ana Souza",
      email: "ana@wolf.com",
      papeis: ["collector"],
      permissoes: ["ver_pedidos_atribuidos", "editar_pedidos_atribuidos"],
      ativo: true
    },
    {
      id: 103,
      nome: "Maria Oliveira",
      email: "maria@wolf.com",
      papeis: ["seller"],
      permissoes: ["ver_pedidos_proprios", "criar_pedidos"],
      ativo: true
    },
    {
      id: 104,
      nome: "Ludimila",
      email: "ludimila@wolf.com",
      papeis: ["collector"],
      permissoes: ["ver_pedidos_atribuidos", "editar_pedidos_atribuidos"],
      ativo: true
    },
    {
      id: 105,
      nome: "Carlos Ferreira",
      email: "carlos@wolf.com",
      papeis: ["collector"],
      permissoes: ["ver_pedidos_atribuidos", "editar_pedidos_atribuidos"],
      ativo: true
    },
    {
      id: 106,
      nome: "Pedro Santos",
      email: "pedro@wolf.com",
      papeis: ["collector"],
      permissoes: ["ver_pedidos_atribuidos", "editar_pedidos_atribuidos"],
      ativo: true
    }
  ];

  // User passwords
  const userPasswords = {
    "admin@sistema.com": "admin123",
    "supervisor@sistema.com": "supervisor123",
    "operador@sistema.com": "operador123",
    "vendedor@sistema.com": "vendedor123",
    "joao@wolf.com": "operador123",
    "ana@wolf.com": "operador123",
    "maria@wolf.com": "vendedor123",
    "ludimila@wolf.com": "operador123",
    "carlos@wolf.com": "operador123",
    "pedro@wolf.com": "operador123"
  };

  // Authentication tokens for admin
  const adminAuthTokens = {
    access_token: "mock-admin-token",
    refresh_token: "mock-admin-refresh-token",
    token_type: "bearer"
  };

  // Admin user info
  const adminUserInfo = {
    id: 1,
    email: "admin@sistema.com",
    fullName: "Admin",
    role: "admin"
  };

  const handleRestoreData = () => {
    setLoading(true);
    setLogs([]);
    setError(null);
    setSuccess(false);

    try {
      // Add log
      setLogs(prev => [...prev, "Iniciando restauração de dados..."]);

      // Restore orders
      localStorage.setItem('orders', JSON.stringify(sampleOrders));
      setLogs(prev => [...prev, "✅ Pedidos restaurados com sucesso"]);

      // Restore products
      localStorage.setItem('products', JSON.stringify(sampleProducts));
      setLogs(prev => [...prev, "✅ Produtos restaurados com sucesso"]);

      // Restore users
      localStorage.setItem('users', JSON.stringify(sampleUsers));
      setLogs(prev => [...prev, "✅ Usuários restaurados com sucesso"]);

      // Restore user passwords
      localStorage.setItem('user_passwords', JSON.stringify(userPasswords));
      setLogs(prev => [...prev, "✅ Senhas de usuários restauradas com sucesso"]);

      // Set admin authentication
      localStorage.setItem('authTokens', JSON.stringify(adminAuthTokens));
      localStorage.setItem('userInfo', JSON.stringify(adminUserInfo));
      setLogs(prev => [...prev, "✅ Autenticação de administrador restaurada com sucesso"]);

      setLogs(prev => [...prev, "🎉 Todos os dados foram restaurados com sucesso!"]);
      setSuccess(true);
    } catch (error) {
      console.error('Error restoring data:', error);
      setError(`Erro ao restaurar dados: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleGoToDashboard = () => {
    navigate('/');
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Restaurar Dados do Sistema
      </Typography>

      <Paper sx={{ p: 3, mb: 3, borderRadius: '12px' }}>
        <Typography variant="body1" paragraph>
          Esta página permite restaurar os dados essenciais do sistema caso eles tenham sido perdidos ou corrompidos.
          Isso incluirá pedidos de exemplo, produtos, usuários e configurações básicas.
        </Typography>

        <Alert severity="warning" sx={{ mb: 3 }}>
          <Typography variant="subtitle2">Atenção!</Typography>
          <Typography variant="body2">
            Esta ação irá substituir todos os dados existentes. Certifique-se de que deseja continuar.
          </Typography>
        </Alert>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            Dados restaurados com sucesso! Você pode voltar para a página principal agora.
          </Alert>
        )}

        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<RestoreIcon />}
            onClick={handleRestoreData}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Restaurar Dados'}
          </Button>

          <Button
            variant="outlined"
            onClick={handleGoToDashboard}
            disabled={loading}
          >
            Voltar para o Dashboard
          </Button>
        </Box>

        {logs.length > 0 && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Log de Restauração:
            </Typography>
            <Paper variant="outlined" sx={{ p: 2, maxHeight: '300px', overflow: 'auto' }}>
              <List dense>
                {logs.map((log, index) => (
                  <ListItem key={index}>
                    <ListItemIcon sx={{ minWidth: '30px' }}>
                      {log.includes('✅') ? (
                        <CheckCircleIcon color="success" fontSize="small" />
                      ) : log.includes('❌') ? (
                        <ErrorIcon color="error" fontSize="small" />
                      ) : log.includes('⚠️') ? (
                        <WarningIcon color="warning" fontSize="small" />
                      ) : (
                        <InfoIcon color="info" fontSize="small" />
                      )}
                    </ListItemIcon>
                    <ListItemText primary={log} />
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Box>
        )}
      </Paper>

      <Divider sx={{ my: 3 }} />

      <Typography variant="h6" gutterBottom>
        Dados que serão restaurados:
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Typography variant="subtitle1">Pedidos</Typography>
          <Typography variant="body2">5 pedidos de exemplo com diferentes status e informações</Typography>
        </Paper>

        <Paper variant="outlined" sx={{ p: 2 }}>
          <Typography variant="subtitle1">Produtos</Typography>
          <Typography variant="body2">Produto "Potencia Azul" com 5 ofertas diferentes</Typography>
        </Paper>

        <Paper variant="outlined" sx={{ p: 2 }}>
          <Typography variant="subtitle1">Usuários</Typography>
          <Typography variant="body2">10 usuários incluindo Admin, Supervisor, Operadores e Vendedores</Typography>
        </Paper>

        <Paper variant="outlined" sx={{ p: 2 }}>
          <Typography variant="subtitle1">Autenticação</Typography>
          <Typography variant="body2">Configuração de autenticação para o usuário Admin</Typography>
        </Paper>
      </Box>
    </Box>
  );
};

export default RestoreDataPage;
