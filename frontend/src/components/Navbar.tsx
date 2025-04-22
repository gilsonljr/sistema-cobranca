import React, { useState, useEffect } from 'react';
import ConversaoChanger from './ConversaoChanger';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Divider,
  ListItemIcon,
  ListItemText,
  Switch,
  Avatar,
  Tooltip,
} from '@mui/material';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import SettingsIcon from '@mui/icons-material/Settings';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AssessmentIcon from '@mui/icons-material/Assessment';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import CodeIcon from '@mui/icons-material/Code';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import PeopleIcon from '@mui/icons-material/People';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import ImportExportIcon from '@mui/icons-material/ImportExport';
import WebhookIcon from '@mui/icons-material/Webhook';
import RestoreIcon from '@mui/icons-material/Restore';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import LeaderboardIcon from '@mui/icons-material/Leaderboard';
import UnifiedAuthService from '../services/UnifiedAuthService';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import CleaningServicesIcon from '@mui/icons-material/CleaningServices';
import AuthService from '../services/AuthService';
import { UserRole } from '../types/User';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import useAuth from '../hooks/useAuth';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth(); // Use the custom hook to get user info
  const [reportsMenuAnchor, setReportsMenuAnchor] = useState<null | HTMLElement>(null);
  const [rankingMenuAnchor, setRankingMenuAnchor] = useState<null | HTMLElement>(null);
  const [settingsMenuAnchor, setSettingsMenuAnchor] = useState<null | HTMLElement>(null);
  const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(null);
  const [darkMode, setDarkMode] = useState(false);
  const [conversaoChangerOpen, setConversaoChangerOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const authUser = AuthService.getCurrentUser();

  // Carregar informações do usuário
  useEffect(() => {
    // Use UnifiedAuthService to get current user info instead of localStorage directly
    const userInfo = UnifiedAuthService.getUserInfo();
    if (userInfo) {
      // setUserInfo(userInfo); // We're now using the useAuth hook
    }

    // Add an event listener for user login events
    const handleUserLogin = () => {
      const updatedUserInfo = UnifiedAuthService.getUserInfo();
      if (updatedUserInfo) {
        // setUserInfo(updatedUserInfo); // We're now using the useAuth hook
      }
    };

    // Listen for custom login event
    window.addEventListener('user-login', handleUserLogin);

    // Clean up the event listener when component unmounts
    return () => {
      window.removeEventListener('user-login', handleUserLogin);
    };
  }, []);

  const handleReportsMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setReportsMenuAnchor(event.currentTarget);
  };

  const handleReportsMenuClose = () => {
    setReportsMenuAnchor(null);
  };

  const handleReportSelect = (path: string) => {
    navigate(path);
    handleReportsMenuClose();
  };

  // Handlers for Ranking menu
  const handleRankingMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setRankingMenuAnchor(event.currentTarget);
  };

  const handleRankingMenuClose = () => {
    setRankingMenuAnchor(null);
  };

  const handleRankingSelect = (path: string) => {
    navigate(path);
    handleRankingMenuClose();
  };

  const handleSettingsMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setSettingsMenuAnchor(event.currentTarget);
  };

  const handleSettingsMenuClose = () => {
    setSettingsMenuAnchor(null);
  };

  const handleSettingSelect = (path: string) => {
    navigate(path);
    handleSettingsMenuClose();
  };

  const handleToggleDarkMode = () => {
    setDarkMode(!darkMode);
    // Aqui você implementaria a lógica para mudar o tema
    handleSettingsMenuClose();
  };

  // Handlers for ConversaoChanger
  const handleOpenConversaoChanger = () => {
    setConversaoChangerOpen(true);
    handleSettingsMenuClose();
  };

  const handleCloseConversaoChanger = () => {
    setConversaoChangerOpen(false);
  };

  // Funções para o menu do usuário
  const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setUserMenuAnchor(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setUserMenuAnchor(null);
  };

  // New handleLogout function using our custom hook
  const handleLogout = () => {
    logout(); // Use the logout function from our custom hook
    navigate('/login');
  };

  // Clear all data function for deep logout
  const handleLogoutAndClear = () => {
    // Clear all cache and cookies
    if (window.caches) {
      // Clear application cache
      caches.keys().then(cacheNames => {
        cacheNames.forEach(cacheName => {
          caches.delete(cacheName);
        });
      });
    }

    // Clear cookies
    document.cookie.split(';').forEach(cookie => {
      const eqPos = cookie.indexOf('=');
      const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
      document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/';
    });

    // Clear localStorage
    localStorage.clear();

    // Clear sessionStorage
    sessionStorage.clear();

    // Use our custom logout
    logout();

    // Navigate to login
    navigate('/login');
  };

  const handleProfileClick = () => {
    navigate('/profile');
    handleUserMenuClose();
  };

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const canAccessSettings = AuthService.hasRole(['admin']);

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        bgcolor: 'background.paper',
        borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
        boxShadow: 'none',
      }}
    >
      <Toolbar sx={{ minHeight: 64 }}>
        <Typography
          variant="h6"
          component={Link}
          to="/"
          sx={{
            color: 'primary.main',
            textDecoration: 'none',
            fontWeight: 600,
            letterSpacing: '-0.5px',
            flexGrow: 0,
            mr: 4,
            fontSize: '1.25rem',
          }}
        >
          Sistema de Cobrança
        </Typography>

        <Box sx={{ flexGrow: 1, display: 'flex', gap: 1 }}>
          <Button
            component={Link}
            to="/"
            startIcon={<DashboardIcon />}
            sx={{
              color: location.pathname === '/' ? 'primary.main' : 'text.secondary',
              px: 2,
              borderRadius: '8px',
              textTransform: 'none',
              fontWeight: 500,
              bgcolor: location.pathname === '/' ? 'rgba(33, 150, 243, 0.05)' : 'transparent',
              '&:hover': {
                bgcolor: location.pathname === '/' ? 'rgba(33, 150, 243, 0.08)' : 'rgba(0, 0, 0, 0.02)',
              },
            }}
          >
            Dashboard
          </Button>
          <Button
            aria-controls="reports-menu"
            aria-haspopup="true"
            onClick={handleReportsMenuOpen}
            startIcon={<AssessmentIcon />}
            endIcon={<KeyboardArrowDownIcon />}
            sx={{
              color: location.pathname.includes('/reports') ? 'primary.main' : 'text.primary',
              px: 2,
              bgcolor: location.pathname.includes('/reports') ? 'rgba(33, 150, 243, 0.08)' : 'transparent',
              '&:hover': {
                bgcolor: location.pathname.includes('/reports') ? 'rgba(33, 150, 243, 0.12)' : 'primary.light',
              },
            }}
          >
            Relatórios
          </Button>
          <Menu
            id="reports-menu"
            anchorEl={reportsMenuAnchor}
            keepMounted
            open={Boolean(reportsMenuAnchor)}
            onClose={handleReportsMenuClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'left',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'left',
            }}
            sx={{ mt: 1 }}
          >
            <MenuItem onClick={() => handleReportSelect('/reports')} sx={{ py: 1, px: 2 }}>
              <ArticleOutlinedIcon fontSize="small" sx={{ mr: 1.5, color: 'text.secondary' }} />
              Relatórios Básicos
            </MenuItem>
            {user && (user.role === 'admin' || user.role === 'supervisor') && (
              <MenuItem onClick={() => handleReportSelect('/advanced-reports')} sx={{ py: 1, px: 2 }}>
                <AssessmentIcon fontSize="small" sx={{ mr: 1.5, color: 'text.secondary' }} />
                Relatórios Avançados
              </MenuItem>
            )}
          </Menu>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Button
            component={Link}
            to="/tracking"
            startIcon={<LocalShippingIcon />}
            sx={{
              color: location.pathname === '/tracking' ? 'primary.main' : 'text.primary',
              px: 2,
              bgcolor: location.pathname === '/tracking' ? 'rgba(33, 150, 243, 0.08)' : 'transparent',
              '&:hover': {
                bgcolor: location.pathname === '/tracking' ? 'rgba(33, 150, 243, 0.12)' : 'primary.light',
              },
            }}
          >
            Rastreamento
          </Button>

          <Button
            aria-controls="ranking-menu"
            aria-haspopup="true"
            onClick={handleRankingMenuOpen}
            startIcon={<EmojiEventsIcon />}
            endIcon={<KeyboardArrowDownIcon />}
            sx={{
              color: location.pathname.includes('/ranking') ? 'primary.main' : 'text.primary',
              px: 2,
              bgcolor: location.pathname.includes('/ranking') ? 'rgba(33, 150, 243, 0.08)' : 'transparent',
              '&:hover': {
                bgcolor: location.pathname.includes('/ranking') ? 'rgba(33, 150, 243, 0.12)' : 'primary.light',
              },
            }}
          >
            Ranking
          </Button>
          <Menu
            id="ranking-menu"
            anchorEl={rankingMenuAnchor}
            keepMounted
            open={Boolean(rankingMenuAnchor)}
            onClose={handleRankingMenuClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'left',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'left',
            }}
            sx={{ mt: 1 }}
          >
            <MenuItem onClick={() => handleRankingSelect('/ranking')} sx={{ py: 1, px: 2 }}>
              <EmojiEventsIcon fontSize="small" sx={{ mr: 1.5, color: '#FFD700' }} />
              Ranking de Vendedores
            </MenuItem>
            {user && (user.role === 'admin' || user.role === 'supervisor') && (
              <MenuItem onClick={() => handleRankingSelect('/ranking-operador')} sx={{ py: 1, px: 2 }}>
                <LeaderboardIcon fontSize="small" sx={{ mr: 1.5, color: '#2196F3' }} />
                Ranking de Operadores
              </MenuItem>
            )}
          </Menu>

          <Button
            aria-controls="settings-menu"
            aria-haspopup="true"
            onClick={handleSettingsMenuOpen}
            startIcon={<SettingsIcon />}
            endIcon={<KeyboardArrowDownIcon />}
            sx={{
              color: location.pathname.includes('/settings') || location.pathname === '/example' ? 'primary.main' : 'text.primary',
              px: 2,
              bgcolor: location.pathname.includes('/settings') || location.pathname === '/example' ? 'rgba(33, 150, 243, 0.08)' : 'transparent',
              '&:hover': {
                bgcolor: location.pathname.includes('/settings') || location.pathname === '/example' ? 'rgba(33, 150, 243, 0.12)' : 'primary.light',
              },
            }}
          >
            Configurações
          </Button>
          <Menu
            id="settings-menu"
            anchorEl={settingsMenuAnchor}
            keepMounted
            open={Boolean(settingsMenuAnchor)}
            onClose={handleSettingsMenuClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            sx={{ mt: 1 }}
          >
            {/* Conversão Changer */}
            <MenuItem onClick={handleOpenConversaoChanger} sx={{ py: 1, px: 2 }}>
              <ListItemIcon>
                <SettingsIcon fontSize="small" sx={{ color: 'primary.main' }} />
              </ListItemIcon>
              <ListItemText primary="Conversão Changer" />
            </MenuItem>

            <Divider />

            {/* Seção de Usuários */}
            <MenuItem onClick={() => handleSettingSelect('/users')} sx={{ py: 1, px: 2 }}>
              <ListItemIcon>
                <PeopleIcon fontSize="small" sx={{ color: 'text.secondary' }} />
              </ListItemIcon>
              <ListItemText primary="Usuários" />
            </MenuItem>

            {/* Seção de Dados */}
            <MenuItem onClick={() => handleSettingSelect('/import')} sx={{ py: 1, px: 2 }}>
              <ListItemIcon>
                <ImportExportIcon fontSize="small" sx={{ color: 'text.secondary' }} />
              </ListItemIcon>
              <ListItemText primary="Importar Dados" />
            </MenuItem>

            <MenuItem onClick={() => handleSettingSelect('/restore-data')} sx={{ py: 1, px: 2 }}>
              <ListItemIcon>
                <RestoreIcon fontSize="small" sx={{ color: 'text.secondary' }} />
              </ListItemIcon>
              <ListItemText primary="Restaurar Dados" />
            </MenuItem>

            {/* Ferramentas de Sistema */}
            <Divider />
            <Box sx={{ px: 2, py: 0.5 }}>
              <Typography variant="caption" color="text.secondary">
                Ferramentas de Sistema
              </Typography>
            </Box>

            <MenuItem onClick={() => window.open('/padronizar.html', '_blank')} sx={{ py: 1, px: 2 }}>
              <ListItemIcon>
                <FormatListBulletedIcon fontSize="small" sx={{ color: 'text.secondary' }} />
              </ListItemIcon>
              <ListItemText primary="Padronizar Vendedores/Operadores" />
            </MenuItem>

            <MenuItem onClick={() => window.open('/emergency-fix.html', '_blank')} sx={{ py: 1, px: 2 }}>
              <ListItemIcon>
                <VpnKeyIcon fontSize="small" sx={{ color: 'text.secondary' }} />
              </ListItemIcon>
              <ListItemText primary="Ferramenta de Emergência" />
            </MenuItem>

            <MenuItem onClick={() => handleSettingSelect('/password-diagnostic')} sx={{ py: 1, px: 2 }}>
              <ListItemIcon>
                <VpnKeyIcon fontSize="small" sx={{ color: 'text.secondary' }} />
              </ListItemIcon>
              <ListItemText primary="Diagnóstico de Senhas" />
            </MenuItem>

            {/* Integrações */}
            <Divider />
            <Box sx={{ px: 2, py: 0.5 }}>
              <Typography variant="caption" color="text.secondary">
                Integrações
              </Typography>
            </Box>

            <MenuItem onClick={() => handleSettingSelect('/webhook')} sx={{ py: 1, px: 2 }}>
              <ListItemIcon>
                <WebhookIcon fontSize="small" sx={{ color: 'text.secondary' }} />
              </ListItemIcon>
              <ListItemText primary="Testar Webhook" />
            </MenuItem>

            <MenuItem onClick={() => handleSettingSelect('/correios-api')} sx={{ py: 1, px: 2 }}>
              <ListItemIcon>
                <LocalShippingIcon fontSize="small" sx={{ color: 'text.secondary' }} />
              </ListItemIcon>
              <ListItemText primary="API Correios" />
            </MenuItem>

            <MenuItem onClick={() => handleSettingSelect('/zap-config')} sx={{ py: 1, px: 2 }}>
              <ListItemIcon>
                <WhatsAppIcon fontSize="small" sx={{ color: '#25D366' }} />
              </ListItemIcon>
              <ListItemText primary="Configurações WhatsApp" />
            </MenuItem>

            {/* Desenvolvimento */}
            <Divider />
            <MenuItem onClick={() => handleSettingSelect('/example')} sx={{ py: 1, px: 2 }}>
              <ListItemIcon>
                <CodeIcon fontSize="small" sx={{ color: 'text.secondary' }} />
              </ListItemIcon>
              <ListItemText primary="Exemplo de Componentes" />
            </MenuItem>

            {/* Aparência */}
            <Divider />
            <MenuItem onClick={handleToggleDarkMode} sx={{ py: 1, px: 2 }}>
              <ListItemIcon>
                <DarkModeIcon fontSize="small" sx={{ color: 'text.secondary' }} />
              </ListItemIcon>
              <ListItemText primary="Modo Escuro" />
              <Switch
                edge="end"
                checked={darkMode}
                onChange={handleToggleDarkMode}
                inputProps={{
                  'aria-labelledby': 'switch-dark-mode',
                }}
              />
            </MenuItem>
          </Menu>
          <Tooltip title="Conta do usuário">
            <IconButton
              size="medium"
              onClick={handleUserMenuOpen}
              sx={{
                ml: 1,
                color: 'text.primary',
                '&:hover': {
                  bgcolor: 'primary.light',
                },
              }}
            >
              {user ? (
                <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                  {user.fullName.charAt(0).toUpperCase()}
                </Avatar>
              ) : (
                <AccountCircleIcon />
              )}
            </IconButton>
          </Tooltip>

          <Menu
            id="user-menu"
            anchorEl={userMenuAnchor}
            keepMounted
            open={Boolean(userMenuAnchor)}
            onClose={handleUserMenuClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            sx={{ mt: 1 }}
          >
            {user && (
              <Box sx={{ px: 2, py: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                  {user.fullName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {user.email}
                </Typography>
                <Typography variant="caption" color="primary" sx={{ textTransform: 'capitalize' }}>
                  {user.role === 'admin' ? 'Administrador' :
                   user.role === 'supervisor' ? 'Supervisor' :
                   user.role === 'collector' ? 'Operador' :
                   user.role === 'seller' ? 'Vendedor' : user.role}
                </Typography>
              </Box>
            )}

            <Divider />

            <MenuItem onClick={handleProfileClick} sx={{ py: 1, px: 2 }}>
              <ListItemIcon>
                <PersonIcon fontSize="small" sx={{ color: 'text.secondary' }} />
              </ListItemIcon>
              <ListItemText primary="Meu Perfil" />
            </MenuItem>

            <MenuItem onClick={handleLogoutAndClear} sx={{ py: 1, px: 2 }}>
              <ListItemIcon>
                <CleaningServicesIcon fontSize="small" sx={{ color: 'text.secondary' }} />
              </ListItemIcon>
              <ListItemText primary="Sair e Limpar" />
            </MenuItem>

            <MenuItem onClick={handleLogout} sx={{ py: 1, px: 2 }}>
              <ListItemIcon>
                <LogoutIcon fontSize="small" sx={{ color: 'text.secondary' }} />
              </ListItemIcon>
              <ListItemText primary="Sair" />
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>

      {/* ConversaoChanger Dialog */}
      <ConversaoChanger open={conversaoChangerOpen} onClose={handleCloseConversaoChanger} />
    </AppBar>
  );
};

export default Navbar;