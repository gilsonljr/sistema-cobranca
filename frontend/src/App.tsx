import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Navbar from './components/Navbar';
import AuthCheck from './components/AuthCheck';
import Sidebar, { StatusFilter } from './components/Sidebar';
import DashboardPage from './pages/DashboardPage';
import ReportsPage from './pages/ReportsPage';
import AdvancedReportsPage from './pages/AdvancedReportsPage';
import SettingsPage from './pages/SettingsPage';
import TrackingPage from './pages/TrackingPage';
import DuplicateOrdersPage from './pages/DuplicateOrdersPage';
import LoginPage from './pages/LoginPage';
// Import new financial pages
import FacebookAdsPage from './pages/financeiro/FacebookAdsPage';
import WhatsAppPage from './pages/financeiro/WhatsAppPage';
import VendasPage from './pages/financeiro/VendasPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import PasswordResetPage from './pages/PasswordResetPage';
import TestLoginPage from './pages/TestLoginPage';
import ExamplePage from './pages/ExamplePage';
// Import Nutra Logistics pages
import NutraDashboardPage from './pages/nutra/NutraDashboardPage';
import NutraProductsPage from './pages/nutra/ProductsPage';
import UsersPage from './pages/UsersPage';
import UsersPageSimple from './pages/UsersPageSimple';
import UsersPageBasic from './pages/UsersPageBasic';
import UsersPageFull from './pages/UsersPageFull';
import EditUserPage from './pages/EditUserPage';
import NewUserPage from './pages/NewUserPage';
import ImportPageNew from './pages/ImportPageNew';
import VendedorPage from './pages/VendedorPage';
import ProductsPage from './pages/ProductsPage';
import CreateOffersPage from './pages/CreateOffersPage';
import CheckOrdersPage from './pages/CheckOrdersPage';
import AllOrdersPage from './pages/AllOrdersPage';
import ProfilePage from './pages/ProfilePage';
import RestoreDataPage from './pages/RestoreDataPage';
import PasswordDiagnosticPage from './pages/PasswordDiagnosticPage';
import WebhookPage from './pages/WebhookPage';
import CorreiosApiManagementPage from './pages/CorreiosApiManagementPage';
import { Order } from './types/Order';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { ptBR } from 'date-fns/locale'; // Import ptBR locale
import CorreiosService from './services/CorreiosService';
import AuthService from './services/AuthService';
import UserPasswordService from './services/UserPasswordService';

// Import custom contexts
import { ThemeProvider } from './contexts/ThemeContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { UserProvider } from './contexts/UserContext';
import { AuthProvider } from './contexts/AuthContext';
import { OrderDataProvider } from './contexts/OrderDataContext';
import { ConversionProvider } from './contexts/ConversionContext';
import ErrorBoundary from './components/ErrorBoundary';

// Função para sincronizar usuários entre diferentes locais de armazenamento
const syncAllUsers = () => {
  try {
    console.log('Sincronizando usuários entre diferentes locais de armazenamento...');

    // 1. Coletar usuários de todas as fontes
    const sources = {
      users: localStorage.getItem('users') ? JSON.parse(localStorage.getItem('users') || '[]') : [],
      defaultUsers: localStorage.getItem('default_users') ? JSON.parse(localStorage.getItem('default_users') || '{}') : {},
      mockUsers: localStorage.getItem('mockUsers') ? JSON.parse(localStorage.getItem('mockUsers') || '[]') : []
    };

    // 2. Unificar usuários - apenas considerando usuários existentes
    const emailMap = new Map();

    // Adicionar usuários do contexto principal
    sources.users.forEach((user: any) => {
      if (user.email) {
        emailMap.set(user.email.toLowerCase(), user);
      }
    });

    // Adicionar usuários do sistema de emergência
    Object.entries(sources.defaultUsers).forEach(([email, userData]: [string, any]) => {
      const lowerEmail = email.toLowerCase();
      if (!emailMap.has(lowerEmail)) {
        // Converter papel para papéis
        const papeis: string[] = [];
        if (userData.role === 'admin') papeis.push('admin');
        else if (userData.role === 'supervisor') papeis.push('supervisor');
        else if (userData.role === 'collector') papeis.push('collector');
        else if (userData.role === 'seller') papeis.push('seller');

        emailMap.set(lowerEmail, {
          id: userData.id || Date.now(),
          nome: userData.fullName || email.split('@')[0],
          email: email,
          papeis: papeis,
          permissoes: [],
          ativo: true
        });
      }
    });

    // Adicionar mock users
    sources.mockUsers.forEach((user: any) => {
      if (user.email) {
        const lowerEmail = user.email.toLowerCase();
        if (!emailMap.has(lowerEmail)) {
          // Converter perfil para papéis
          const papeis: string[] = [];
          if (user.perfil === 'Administrador') papeis.push('admin');
          else if (user.perfil === 'Supervisor') papeis.push('supervisor');
          else if (user.perfil === 'Operador') papeis.push('collector');
          else if (user.perfil === 'Vendedor') papeis.push('seller');

          emailMap.set(lowerEmail, {
            id: user.id || Date.now(),
            nome: user.nome || user.email.split('@')[0],
            email: user.email,
            papeis: papeis,
            permissoes: [],
            ativo: user.ativo !== undefined ? user.ativo : true
          });
        }
      }
    });

    // Não vamos mais criar usuários automaticamente para vendedores/operadores
    // encontrados nos pedidos. Em vez disso, usaremos a página de padronização
    // para vincular manualmente vendedores/operadores a usuários existentes.

    // 3. Salvar usuários unificados
    const unifiedUsers = Array.from(emailMap.values());
    localStorage.setItem('users', JSON.stringify(unifiedUsers));

    console.log(`Sincronização concluída: ${unifiedUsers.length} usuários unificados.`);
    return unifiedUsers;
  } catch (error) {
    console.error('Erro ao sincronizar usuários:', error);
    return [];
  }
};

function App() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<StatusFilter | null>(null);
  const drawerWidth = 240;

  // Syncronize users and initialize services on app start
  useEffect(() => {
    // Sync all users
    syncAllUsers();

    // Initialize password service to ensure consistent password storage
    UserPasswordService.initialize();
    console.log("UserPasswordService initialized on app start");
  }, []);

  // Handle status selection
  const handleStatusSelect = (filter: StatusFilter | null) => {
    setSelectedStatus(filter);
  };

  // Função para limpar todos os pedidos
  const clearAllOrders = () => {
    setOrders([]);
    localStorage.removeItem('orders');
    console.log('Todos os pedidos foram removidos');
  };

  // Load orders from localStorage on component mount
  useEffect(() => {
    const storedOrders = localStorage.getItem('orders');
    if (storedOrders) {
      setOrders(JSON.parse(storedOrders));
    }
  }, []);

  // Handle webhook messages (simulated)
  const handleWebhook = (event: MessageEvent) => {
    if (event.data && event.data.type === 'webhook' && event.data.order) {
      const newOrder = event.data.order;
      setOrders(prevOrders => {
        const updatedOrders = [...prevOrders, newOrder];
        localStorage.setItem('orders', JSON.stringify(updatedOrders));
        return updatedOrders;
      });
    }
  };

  // Função para mesclar pedidos novos com existentes
  const mergeOrders = (newOrders: Order[]) => {
    console.log(`Iniciando importação de ${newOrders.length} pedidos...`);

    // Criar um mapa dos pedidos existentes por ID
    const existingOrdersMap = new Map(orders.map(order => [order.idVenda, order]));

    // Contadores para feedback
    let newCount = 0;
    let updatedCount = 0;
    let ignoredCount = 0;

    // Começar com os pedidos existentes
    const updatedOrders = [...orders];

    // Processar cada novo pedido
    newOrders.forEach(newOrder => {
      // Verificar se o pedido tem um ID válido
      if (!newOrder.idVenda) {
        console.warn('Pedido sem ID ignorado:', newOrder);
        ignoredCount++;
        return;
      }

      if (existingOrdersMap.has(newOrder.idVenda)) {
        // Atualizar pedido existente
        const index = updatedOrders.findIndex(o => o.idVenda === newOrder.idVenda);
        if (index !== -1) {
          updatedOrders[index] = newOrder;
          updatedCount++;
        }
      } else {
        // Adicionar novo pedido
        updatedOrders.push(newOrder);
        newCount++;
      }
    });

    console.log(`Importação concluída: ${newCount} novos, ${updatedCount} atualizados, ${ignoredCount} ignorados`);

    // Atualizar estado
    setOrders(updatedOrders);

    // Salvar no localStorage
    localStorage.setItem('orders', JSON.stringify(updatedOrders));

    // Exibir feedback com informação sobre vendedores/operadores não vinculados
    const message = `Importação concluída com sucesso!\n${newCount} registros importados\n${updatedCount} registros atualizados\n${ignoredCount} registros ignorados\n\nTotal de pedidos no sistema: ${updatedOrders.length}\n\nSe houver novos vendedores ou operadores nos pedidos, use a página "Padronizar" para vinculá-los a usuários existentes.`;

    alert(message);

    return updatedOrders;
  };

  // Set up webhook listener
  useEffect(() => {
    window.addEventListener('message', handleWebhook);
    return () => {
      window.removeEventListener('message', handleWebhook);
    };
  }, []);

  // Check for tracking updates periodically
  useEffect(() => {
    const checkTrackingUpdates = async () => {
      try {
        // Get orders with tracking codes
        const ordersWithTracking = orders.filter(order => order.codigoRastreio);

        if (ordersWithTracking.length === 0) return;

        // Prepare tracking data
        const trackingData = ordersWithTracking.map(order => ({
          idVenda: order.idVenda,
          codigoRastreio: order.codigoRastreio,
          statusCorreios: order.statusCorreios || ''
        }));

        // Verify updates for all codes
        const updates = await CorreiosService.verificarAtualizacoes(trackingData);

        if (updates && updates.length > 0) {
          // Update orders with new information
          const updatedOrders = orders.map(order => {
            const update = updates.find(u => u.orderId === order.idVenda);
            if (update) {
              return {
                ...order,
                statusCorreios: update.status
              };
            }
            return order;
          });

          setOrders(updatedOrders);
          localStorage.setItem('orders', JSON.stringify(updatedOrders));
        }
      } catch (error) {
        console.error('Error checking tracking updates:', error);
      }
    };

    // Check for updates every 30 minutes
    const interval = setInterval(checkTrackingUpdates, 30 * 60 * 1000);

    // Initial check
    checkTrackingUpdates();

    return () => clearInterval(interval);
  }, [orders]);

  // Listener para o evento do emergency-fix
  useEffect(() => {
    const handleEmergencyFixClearOrders = () => {
      console.log('Recebido evento emergency-fix-clear-orders - Limpando pedidos...');
      clearAllOrders();
    };

    window.addEventListener('emergency-fix-clear-orders', handleEmergencyFixClearOrders);

    return () => {
      window.removeEventListener('emergency-fix-clear-orders', handleEmergencyFixClearOrders);
    };
  }, [clearAllOrders]);

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <NotificationProvider>
          <UserProvider>
            <AuthProvider>
              <OrderDataProvider>
                <ConversionProvider>
                  <CssBaseline />
                  <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
                <BrowserRouter>
                  <Routes>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/reset-password" element={<PasswordResetPage />} />
                    <Route path="/test-login" element={<TestLoginPage />} />
                    <Route path="/*" element={
                      <AuthCheck>
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
                              width: { sm: `calc(100% - ${drawerWidth}px)` },
                              ml: { sm: `${drawerWidth}px` },
                              mt: '64px', // Height of the navbar
                              overflow: 'auto',
                              height: 'calc(100vh - 64px)'
                            }}
                          >
                            <Routes>
                              <Route path="/" element={<DashboardPage orders={orders} onOrdersUpdate={setOrders} selectedStatus={selectedStatus} onStatusSelect={handleStatusSelect} clearAllOrders={clearAllOrders} />} />
                              <Route path="/reports" element={<ReportsPage orders={orders} />} />
                              <Route path="/advanced-reports" element={<AdvancedReportsPage orders={orders} />} />
                              <Route path="/tracking" element={<TrackingPage />} />
                              <Route path="/duplicates" element={<DuplicateOrdersPage />} />
                              <Route path="/settings" element={<SettingsPage />} />
                              <Route path="/example" element={<ExamplePage />} />
                              <Route path="/users" element={<UsersPageFull orders={orders} />} />
                              <Route path="/new-user" element={<NewUserPage />} />
                              <Route path="/edit-user/:id" element={<EditUserPage />} />
                              <Route path="/import" element={<ImportPageNew onImportSuccess={mergeOrders} />} />
                              <Route path="/webhook" element={<WebhookPage />} />
                              <Route path="/vendedor" element={<VendedorPage orders={orders} onOrdersUpdate={setOrders} />} />
                              <Route path="/products" element={<ProductsPage />} />
                              <Route path="/create-offers" element={<CreateOffersPage />} />
                              <Route path="/check-orders" element={<CheckOrdersPage />} />
                              <Route path="/all-orders" element={<AllOrdersPage />} />
                              <Route path="/profile" element={<ProfilePage />} />
                              <Route path="/restore-data" element={<RestoreDataPage />} />
                              <Route path="/password-diagnostic" element={<PasswordDiagnosticPage />} />
                              <Route path="/correios-api" element={<CorreiosApiManagementPage />} />
                              {/* New Financial Routes */}
                              <Route path="/admin" element={<AdminDashboardPage />} />
                              <Route path="/financeiro/facebook" element={<FacebookAdsPage />} />
                              <Route path="/financeiro/whatsapp" element={<WhatsAppPage orders={orders} />} />
                              <Route path="/financeiro/vendas" element={<VendasPage orders={orders} />} />
                              {/* Nutra Logistics Routes */}
                              <Route path="/nutra" element={<NutraDashboardPage />} />
                              <Route path="/nutra/products" element={<NutraProductsPage />} />
                            </Routes>
                          </Box>
                        </Box>
                      </AuthCheck>
                    } />
                  </Routes>
                </BrowserRouter>
                </LocalizationProvider>
                </ConversionProvider>
              </OrderDataProvider>
            </AuthProvider>
          </UserProvider>
        </NotificationProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
