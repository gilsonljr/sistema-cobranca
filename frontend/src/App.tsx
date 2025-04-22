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
import UnifiedLoginPage from './pages/UnifiedLoginPage';
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
import ZapConfigPage from './pages/ZapConfigPage';
import VendedorRankingPage from './pages/VendedorRankingPage';
import OperadorRankingPage from './pages/OperadorRankingPage';
import ApprovalPage from './pages/ApprovalPage';
import TrackingManagementPage from './pages/TrackingManagementPage';
import { Order } from './types/Order';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { ptBR } from 'date-fns/locale'; // Import ptBR locale
import CorreiosService from './services/CorreiosService';
import UnifiedAuthService from './services/UnifiedAuthService';

import userDataManager from './services/UserDataManager';
import UserStore from './services/UserStore';
import UserManager from './services/UserManager';
import UnifiedUsersPageWrapper from './pages/UnifiedUsersPageWrapper';
import UnifiedNewUserPageWrapper from './pages/UnifiedNewUserPageWrapper';
import UnifiedEditUserPageWrapper from './pages/UnifiedEditUserPageWrapper';

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
    console.log('Sincronizando usuários usando UserStore e UserDataManager...');

    // Obter usuários atuais do UserStore
    const usersFromStore = UserStore.getUsers();
    console.log(`UserStore: ${usersFromStore.length} usuários encontrados`);

    // Obter usuários atuais do UserDataManager (para compatibilidade)
    const usersFromManager = userDataManager.getAllUsers();
    console.log(`UserDataManager: ${usersFromManager.length} usuários encontrados`);

    // Se não houver usuários no UserStore, criar o admin padrão
    if (usersFromStore.length === 0) {
      console.log('Nenhum usuário encontrado no UserStore. Resetando para admin padrão...');
      UserStore.resetToAdmin();
    }

    // Se não houver usuários no UserDataManager, criar o admin padrão (para compatibilidade)
    if (usersFromManager.length === 0) {
      console.log('Nenhum usuário encontrado no UserDataManager. Criando admin padrão...');
      userDataManager.clearAllUsersExceptAdmin();
    }

    // Obter usuários atualizados
    const updatedUsers = UserStore.getUsers();
    console.log(`Sincronização concluída: ${updatedUsers.length} usuários sincronizados.`);
    return updatedUsers;
  } catch (error) {
    console.error('Erro ao sincronizar usuários:', error);
    return [];
  }
};

function App() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<StatusFilter | null>(null);
  const drawerWidth = 240;

  // Initialize user management system on app start
  useEffect(() => {
    // Initialize UserManager as the single source of truth
    UserManager.initialize();

    // Migrate data from legacy storages if needed
    UserManager.migrateFromLegacyStorages();

    // Log initialization status
    const users = UserManager.getUsers();
    console.log(`UserManager initialized with ${users.length} users`);

    // For backward compatibility, sync with legacy systems
    syncAllUsers();

    // Verificar autenticação atual
    try {
      // Verificar se o usuário está autenticado
      const isAuth = UnifiedAuthService.isAuthenticated();
      console.log(`Verificação de autenticação: ${isAuth ? 'Autenticado' : 'Não autenticado'}`);

      // Se estiver autenticado, verificar se o token está válido
      if (isAuth) {
        const userInfo = UnifiedAuthService.getUserInfo();
        console.log(`Usuário autenticado: ${userInfo?.fullName} (${userInfo?.email})`);
      }
    } catch (error) {
      console.error("Erro ao verificar autenticação:", error);
    }
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

  // Listener para o evento de reset de usuários do emergency-fix
  useEffect(() => {
    const handleUserListReset = () => {
      console.log('Recebido evento user-list-reset - Forçando recarga de usuários...');

      // Usar o UserStore para garantir que os usuários estejam sincronizados
      const usersFromStore = UserStore.getUsers();
      console.log(`UserStore: ${usersFromStore.length} usuários carregados`);

      // Usar o UserDataManager para compatibilidade
      const usersFromManager = userDataManager.getAllUsers();
      console.log(`UserDataManager: ${usersFromManager.length} usuários carregados`);

      // Se não houver usuários no UserStore, criar o admin padrão
      if (usersFromStore.length === 0) {
        console.log('Nenhum usuário encontrado no UserStore. Resetando para admin padrão...');
        UserStore.resetToAdmin();
      }

      // Se não houver usuários no UserDataManager, criar o admin padrão (para compatibilidade)
      if (usersFromManager.length === 0) {
        console.log('Nenhum usuário encontrado no UserDataManager. Criando admin padrão...');
        userDataManager.clearAllUsersExceptAdmin();
      }

      // Force a page reload to ensure all components refresh their data
      setTimeout(() => {
        window.location.reload();
      }, 500);
    };

    window.addEventListener('user-list-reset', handleUserListReset);

    return () => {
      window.removeEventListener('user-list-reset', handleUserListReset);
    };
  }, []);

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
                    <Route path="/login" element={<UnifiedLoginPage />} />
                    <Route path="/login-old" element={<LoginPage />} />
                    <Route path="/reset-password" element={<PasswordResetPage />} />
                    <Route path="/test-login" element={<TestLoginPage />} />
                    <Route path="/" element={
                      UnifiedAuthService.isAuthenticated() ?
                        <Navigate to="/dashboard" /> :
                        <Navigate to="/login" />
                    } />
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
                              <Route path="/" element={<DashboardPage orders={orders} onOrdersUpdate={(updatedOrders) => {
                                setOrders(updatedOrders);
                                localStorage.setItem('orders', JSON.stringify(updatedOrders));
                              }} selectedStatus={selectedStatus} onStatusSelect={handleStatusSelect} clearAllOrders={clearAllOrders} />} />
                              <Route path="/dashboard" element={<DashboardPage orders={orders} onOrdersUpdate={(updatedOrders) => {
                                setOrders(updatedOrders);
                                localStorage.setItem('orders', JSON.stringify(updatedOrders));
                              }} selectedStatus={selectedStatus} onStatusSelect={handleStatusSelect} clearAllOrders={clearAllOrders} />} />
                              <Route path="/reports" element={<ReportsPage orders={orders} />} />
                              <Route path="/advanced-reports" element={<AdvancedReportsPage orders={orders} />} />
                              <Route path="/tracking" element={<TrackingPage />} />
                              <Route path="/duplicates" element={<DuplicateOrdersPage />} />
                              <Route path="/settings" element={<SettingsPage />} />
                              <Route path="/example" element={<ExamplePage />} />
                              {/* Rotas de usuários */}
                              <Route path="/users" element={<UnifiedUsersPageWrapper />} />
                              <Route path="/new-user" element={<UnifiedNewUserPageWrapper />} />
                              <Route path="/edit-user/:userId" element={<UnifiedEditUserPageWrapper />} />

                              {/* Rotas legadas (manter para compatibilidade) */}
                              <Route path="/unified/users" element={<UnifiedUsersPageWrapper />} />
                              <Route path="/unified/new-user" element={<UnifiedNewUserPageWrapper />} />
                              <Route path="/unified/edit-user/:userId" element={<UnifiedEditUserPageWrapper />} />
                              <Route path="/users-old" element={<UsersPageFull orders={orders} />} />
                              <Route path="/edit-user-old/:id" element={<EditUserPage />} />
                              <Route path="/new-user-old" element={<NewUserPage />} />
                              <Route path="/import" element={<ImportPageNew onImportSuccess={mergeOrders} />} />
                              <Route path="/webhook" element={<WebhookPage />} />
                              <Route path="/vendedor" element={<VendedorPage orders={orders} onOrdersUpdate={(updatedOrders) => {
                                setOrders(updatedOrders);
                                localStorage.setItem('orders', JSON.stringify(updatedOrders));
                              }} />} />
                              <Route path="/products" element={<ProductsPage />} />
                              <Route path="/create-offers" element={<CreateOffersPage />} />
                              <Route path="/check-orders" element={<CheckOrdersPage />} />
                              <Route path="/all-orders" element={<AllOrdersPage />} />
                              <Route path="/profile" element={<ProfilePage />} />
                              <Route path="/restore-data" element={<RestoreDataPage />} />
                              <Route path="/password-diagnostic" element={<PasswordDiagnosticPage />} />
                              <Route path="/correios-api" element={<CorreiosApiManagementPage />} />
                              <Route path="/zap-config" element={<ZapConfigPage />} />
                              <Route path="/ranking" element={<VendedorRankingPage />} />
                              <Route path="/ranking-operador" element={<OperadorRankingPage />} />
                              {/* New Financial Routes */}
                              <Route path="/admin" element={<AdminDashboardPage />} />
                              <Route path="/financeiro/facebook" element={<FacebookAdsPage />} />
                              <Route path="/financeiro/whatsapp" element={<WhatsAppPage orders={orders} />} />
                              <Route path="/financeiro/vendas" element={<VendasPage orders={orders} />} />
                              {/* Nutra Logistics Routes */}
                              <Route path="/nutra" element={<NutraDashboardPage />} />
                              <Route path="/nutra/products" element={<NutraProductsPage />} />
                              {/* Novas rotas para aprovação e rastreamento */}
                              <Route path="/approval" element={<ApprovalPage />} />
                              <Route path="/tracking-management" element={<TrackingManagementPage />} />
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
