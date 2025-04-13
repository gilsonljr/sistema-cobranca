import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
} from '@mui/material';
import { Link } from 'react-router-dom';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import SettingsIcon from '@mui/icons-material/Settings';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AssessmentIcon from '@mui/icons-material/Assessment';

const Navbar = () => {
  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        bgcolor: 'background.paper',
        borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
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
              color: 'text.primary',
              px: 2,
              '&:hover': {
                bgcolor: 'primary.light',
              },
            }}
          >
            Dashboard
          </Button>
          <Button
            component={Link}
            to="/reports"
            startIcon={<AssessmentIcon />}
            sx={{ 
              color: 'text.primary',
              px: 2,
              '&:hover': {
                bgcolor: 'primary.light',
              },
            }}
          >
            Relatórios
          </Button>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Button
            component={Link}
            to="/tracking"
            startIcon={<LocalShippingIcon />}
            sx={{ 
              color: 'text.primary',
              px: 2,
              '&:hover': {
                bgcolor: 'primary.light',
              },
            }}
          >
            Rastreamento
          </Button>
          <Button
            component={Link}
            to="/settings"
            startIcon={<SettingsIcon />}
            sx={{ 
              color: 'text.primary',
              px: 2,
              '&:hover': {
                bgcolor: 'primary.light',
              },
            }}
          >
            Configurações
          </Button>
          <IconButton
            size="medium"
            sx={{ 
              ml: 1,
              color: 'text.primary',
              '&:hover': {
                bgcolor: 'primary.light',
              },
            }}
          >
            <AccountCircleIcon />
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar; 