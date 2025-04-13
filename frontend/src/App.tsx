import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Navbar from './components/Navbar';
import Sidebar, { StatusFilter } from './components/Sidebar';
import DashboardPage from './pages/DashboardPage';
import ReportsPage from './pages/ReportsPage';
import SettingsPage from './pages/SettingsPage';
import TrackingPage from './pages/TrackingPage';
import DuplicateOrdersPage from './pages/DuplicateOrdersPage';
import LoginPage from './pages/LoginPage';
import PasswordResetPage from './pages/PasswordResetPage';
import TestLoginPage from './pages/TestLoginPage';
import ExamplePage from './pages/ExamplePage';
import { Order } from './types/Order';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { ptBR } from 'date-fns/locale'; // Import ptBR locale
import CorreiosService from './services/CorreiosService';
import AuthService from './services/AuthService';

// Import custom contexts
import { ThemeProvider } from './contexts/ThemeContext';
import { NotificationProvider } from './contexts/NotificationContext';

// Theme is now managed by ThemeContext
/*const theme = createTheme({
  palette: {
    primary: {
      main: '#2196f3',
      light: '#e3f2fd',
    },
    secondary: {
      main: '#f50057',
    },
    background: {
      default: '#fafafa',
      paper: '#ffffff',
    },
    text: {
      primary: '#2c3e50',
      secondary: '#7f8c8d',
    },
    success: {
      main: '#4caf50',
      light: '#e8f5e9',
    },
    error: {
      main: '#f44336',
      light: '#ffebee',
    },
    warning: {
      main: '#ff9800',
      light: '#fff3e0',
    },
    info: {
      main: '#03a9f4',
      light: '#e1f5fe',
    },
  },
  typography: {
    fontFamily: [
      'Inter',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    h5: {
      fontWeight: 600,
      color: '#2c3e50',
    },
    h6: {
      fontWeight: 500,
      color: '#2c3e50',
    },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.03)',
          borderRadius: 12,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
          fontSize: '0.875rem',
          fontWeight: 500,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          height: 28,
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: '1px solid rgba(224, 224, 224, 0.4)',
          padding: '12px 16px',
        },
        head: {
          fontWeight: 600,
          backgroundColor: '#fafafa',
          color: '#2c3e50',
        },
      },
    },
  },
});*/

function App() {
  const [orders, setOrders] = useState<Order[]>(() => {
    // Tenta carregar os pedidos do localStorage ao inicializar
    const savedOrders = localStorage.getItem('orders');
    return savedOrders ? JSON.parse(savedOrders) : [];
  });
  const [selectedStatus, setSelectedStatus] = useState<StatusFilter | null>(null);

  // Salva os pedidos no localStorage sempre que houver mudanças
  useEffect(() => {
    localStorage.setItem('orders', JSON.stringify(orders));
  }, [orders]);

  // Verifica atualizações dos códigos de rastreio a cada 60 minutos
  useEffect(() => {
    const updateTrackingStatus = async () => {
      if (orders.length === 0) return;

      // Filtra apenas pedidos com código de rastreio válido
      const ordersWithTracking = orders.filter(order => order.codigoRastreio && order.codigoRastreio.trim() !== '');

      if (ordersWithTracking.length === 0) return;

      try {
        // Prepara os dados para consulta com o formato esperado pelo serviço
        const trackingData = ordersWithTracking.map(order => ({
          idVenda: order.idVenda,
          codigoRastreio: order.codigoRastreio,
          statusCorreios: order.statusCorreios || ''
        }));

        // Verifica atualizações para todos os códigos
        const updates = await CorreiosService.verificarAtualizacoes(trackingData);

        if (updates && updates.length > 0) {
          // Atualiza os pedidos com as novas informações
          const updatedOrders = [...orders];

          updates.forEach((update: any) => {
            const orderIndex = updatedOrders.findIndex(
              order => order.codigoRastreio === update.trackingCode
            );

            if (orderIndex >= 0) {
              updatedOrders[orderIndex] = {
                ...updatedOrders[orderIndex],
                statusCorreios: update.newStatus,
                ultimaAtualizacao: new Date().toLocaleString('pt-BR'),
                statusCritico: update.isCritical
              };
            }
          });

          setOrders(updatedOrders);
        }
      } catch (error) {
        console.error('Erro ao atualizar status de rastreio:', error);
      }
    };

    // Executa imediatamente ao montar o componente
    updateTrackingStatus();

    // Configura o intervalo de verificação (a cada 60 minutos)
    const interval = setInterval(updateTrackingStatus, 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, [orders]);

  const handleOrdersUpdate = (newOrders: Order[]) => {
    setOrders(newOrders);
  };

  const handleStatusSelect = (filter: StatusFilter | null) => {
    setSelectedStatus(filter);
  };

  // Função para processar webhook
  const processWebhookData = (webhookData: any) => {
    // Converter dados do webhook para o formato Order
    const newOrder: Order = {
      dataVenda: webhookData.dataVenda || '',
      idVenda: webhookData.idVenda || '',
      cliente: webhookData.cliente || '',
      telefone: webhookData.telefone || '',
      oferta: webhookData.oferta || '',
      valorVenda: Number(webhookData.valorVenda) || 0,
      status: webhookData.status || '',
      situacaoVenda: webhookData.situacaoVenda || '',
      valorRecebido: Number(webhookData.valorRecebido) || 0,
      historico: webhookData.historico || '',
      ultimaAtualizacao: webhookData.ultimaAtualizacao || '',
      codigoRastreio: webhookData.codigoRastreio || '',
      statusCorreios: webhookData.statusCorreios || '',
      vendedor: webhookData.vendedor || '',
      operador: webhookData.operador || '',
      zap: webhookData.zap || '',
      estadoDestinatario: webhookData.estadoDestinatario || '',
      cidadeDestinatario: webhookData.cidadeDestinatario || '',
      ruaDestinatario: webhookData.ruaDestinatario || '',
      cepDestinatario: webhookData.cepDestinatario || '',
      complementoDestinatario: webhookData.complementoDestinatario || '',
      bairroDestinatario: webhookData.bairroDestinatario || '',
      numeroEnderecoDestinatario: webhookData.numeroEnderecoDestinatario || '',
      dataEstimadaChegada: webhookData.dataEstimadaChegada || '',
      codigoAfiliado: webhookData.codigoAfiliado || '',
      nomeAfiliado: webhookData.nomeAfiliado || '',
      emailAfiliado: webhookData.emailAfiliado || '',
      documentoAfiliado: webhookData.documentoAfiliado || '',
      dataRecebimento: webhookData.dataRecebimento || '',
      dataNegociacao: webhookData.dataNegociacao || '',
      formaPagamento: webhookData.formaPagamento || '',
      documentoCliente: webhookData.documentoCliente || '',
      parcial: webhookData.parcial === 'Sim' || webhookData.parcial === true,
      pagamentoParcial: Number(webhookData.pagamentoParcial) || 0,
      formaPagamentoParcial: webhookData.formaPagamentoParcial || '',
      dataPagamentoParcial: webhookData.dataPagamentoParcial || '',
    };

    // Verificar se o pedido já existe
    const existingOrderIndex = orders.findIndex(o => o.idVenda === newOrder.idVenda);

    if (existingOrderIndex >= 0) {
      // Atualizar pedido existente
      const updatedOrders = [...orders];
      updatedOrders[existingOrderIndex] = newOrder;
      setOrders(updatedOrders);
    } else {
      // Adicionar novo pedido
      setOrders([...orders, newOrder]);
    }
  };

  // Função para expor endpoint de webhook
  useEffect(() => {
    // Criar um handler para o webhook
    const handleWebhook = async (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        if (data && data.type === 'webhook' && data.payload) {
          processWebhookData(data.payload);
        }
      } catch (error) {
        console.error('Erro ao processar webhook:', error);
      }
    };

    // Adicionar um ouvinte para receber mensagens (simulando webhook)
    window.addEventListener('message', handleWebhook);

    return () => {
      window.removeEventListener('message', handleWebhook);
    };
  }, [orders]);

  return (
    <ThemeProvider>
      <NotificationProvider>
        <CssBaseline />
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
          <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/reset-password" element={<PasswordResetPage />} />
            <Route path="/test-login" element={<TestLoginPage />} />
            <Route path="/*" element={
              AuthService.isAuthenticated() ? (
                <Box sx={{ display: 'flex' }}>
                  <Navbar />
                  <Sidebar
                    orders={orders}
                    onStatusSelect={handleStatusSelect}
                    selectedStatus={selectedStatus}
                  />
                  <Box
                    component="main"
                    sx={{
                      flexGrow: 1,
                      p: 3,
                      bgcolor: 'background.default',
                      minHeight: '100vh',
                      pt: 10
                    }}
                  >
                    <Routes>
                      <Route
                        path="/"
                        element={
                          <DashboardPage
                            orders={selectedStatus ?
                              orders.filter(order => {
                                if (selectedStatus.field === 'situacaoVenda') {
                                  // Log para depuração
                                  console.log(`[App.tsx] Filtrando pedido ${order.idVenda}:`,
                                    order.situacaoVenda?.toLowerCase(), selectedStatus.value.toLowerCase(),
                                    order.situacaoVenda?.toLowerCase() === selectedStatus.value.toLowerCase());

                                  return order.situacaoVenda &&
                                    order.situacaoVenda.toLowerCase() === selectedStatus.value.toLowerCase();
                                } else if (selectedStatus.field === 'special' && selectedStatus.value === 'dataRecebimento') {
                                  // Caso especial para "Receber Hoje"
                                  const today = new Date().toLocaleDateString('pt-BR');
                                  return order.dataRecebimento === today;
                                }
                                return true;
                              }) :
                              orders
                            }
                            onOrdersUpdate={handleOrdersUpdate}
                            selectedStatus={selectedStatus}
                            onStatusSelect={handleStatusSelect}
                          />
                        }
                      />
                      <Route path="/reports" element={<ReportsPage orders={orders} />} />
                      <Route path="/tracking" element={<TrackingPage />} />
                      <Route path="/duplicates" element={<DuplicateOrdersPage />} />
                      <Route path="/settings" element={<SettingsPage />} />
                      <Route path="/example" element={<ExamplePage />} />
                    </Routes>
                  </Box>
                </Box>
              ) : (
                <Navigate to="/login" replace />
              )
            } />
          </Routes>
          </BrowserRouter>
        </LocalizationProvider>
      </NotificationProvider>
    </ThemeProvider>
  );
}

export default App;