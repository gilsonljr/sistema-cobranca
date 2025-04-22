import React from 'react';
import { Container, Typography, Paper, Box, Breadcrumbs, Link as MuiLink } from '@mui/material';
import { Link } from 'react-router-dom';
import ZapConfigForm from '../components/ZapConfigForm';

const ZapConfigPage: React.FC = () => {
  const handleConfigsUpdated = () => {
    // This can be used to trigger any additional actions when configs are updated
    console.log('WhatsApp configurations updated');
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Breadcrumbs aria-label="breadcrumb">
          <MuiLink component={Link} to="/" color="inherit">
            Dashboard
          </MuiLink>
          <Typography color="text.primary">Configurações de WhatsApp</Typography>
        </Breadcrumbs>
        
        <Typography variant="h4" sx={{ mt: 2, mb: 4 }}>
          Configurações de WhatsApp
        </Typography>
      </Box>
      
      <Paper elevation={3} sx={{ p: 3 }}>
        <ZapConfigForm onConfigsUpdated={handleConfigsUpdated} />
      </Paper>
    </Container>
  );
};

export default ZapConfigPage; 