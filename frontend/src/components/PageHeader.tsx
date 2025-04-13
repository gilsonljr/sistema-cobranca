import React from 'react';
import { Box, Typography, Divider } from '@mui/material';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

const PageHeader: React.FC<PageHeaderProps> = ({ 
  title, 
  subtitle, 
  action 
}) => {
  return (
    <Box mb={4}>
      <Box 
        display="flex" 
        justifyContent="space-between" 
        alignItems="center" 
        mb={subtitle ? 1 : 2}
      >
        <Typography variant="h4" component="h1" fontWeight="500">
          {title}
        </Typography>
        
        {action && (
          <Box>
            {action}
          </Box>
        )}
      </Box>
      
      {subtitle && (
        <Typography 
          variant="subtitle1" 
          color="text.secondary" 
          gutterBottom
          mb={2}
        >
          {subtitle}
        </Typography>
      )}
      
      <Divider />
    </Box>
  );
};

export default PageHeader; 