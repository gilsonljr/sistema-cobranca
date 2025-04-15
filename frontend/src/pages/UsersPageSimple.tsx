import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const UsersPageSimple: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Gerenciamento de Usuários (Simplificado)
      </Typography>
      <Paper sx={{ p: 3 }}>
        <Typography variant="body1">
          Esta é uma página de usuários simplificada para teste.
        </Typography>
      </Paper>
    </Box>
  );
};

export default UsersPageSimple;
