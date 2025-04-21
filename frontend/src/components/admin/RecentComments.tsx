import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  Chip,
  CircularProgress,
  Button,
} from '@mui/material';
import CommentIcon from '@mui/icons-material/Comment';
import RefreshIcon from '@mui/icons-material/Refresh';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Mock data for recent comments from cobradores
// In a real app, this would come from an API
const mockComments = [
  {
    id: 1,
    user: 'João Silva',
    role: 'Cobrador',
    comment: 'Cliente solicitou parcelamento em 3x. Aprovado.',
    orderId: '12345',
    timestamp: new Date(Date.now() - 1000 * 60 * 15), // 15 minutes ago
    avatar: '',
  },
  {
    id: 2,
    user: 'Maria Oliveira',
    role: 'Cobrador',
    comment: 'Tentativa de contato sem sucesso. Agendado retorno para amanhã.',
    orderId: '12346',
    timestamp: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
    avatar: '',
  },
  {
    id: 3,
    user: 'Carlos Santos',
    role: 'Cobrador',
    comment: 'Cliente confirmou pagamento via PIX. Aguardando compensação.',
    orderId: '12347',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3), // 3 hours ago
    avatar: '',
  },
  {
    id: 4,
    user: 'Ana Pereira',
    role: 'Cobrador',
    comment: 'Negociação concluída. Cliente pagará 50% hoje e 50% em 15 dias.',
    orderId: '12348',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
    avatar: '',
  },
  {
    id: 5,
    user: 'Roberto Almeida',
    role: 'Cobrador',
    comment: 'Cliente solicitou boleto por e-mail. Enviado.',
    orderId: '12349',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8), // 8 hours ago
    avatar: '',
  },
];

const RecentComments: React.FC = () => {
  const [comments, setComments] = useState(mockComments);
  const [loading, setLoading] = useState(false);

  // Simulate fetching comments from an API
  const fetchComments = () => {
    setLoading(true);
    // In a real app, this would be an API call
    setTimeout(() => {
      // Simulate new data by adding a new comment at the top
      const newComment = {
        id: Date.now(),
        user: 'Novo Cobrador',
        role: 'Cobrador',
        comment: 'Atualização: Cliente confirmou pagamento para hoje à tarde.',
        orderId: '12350',
        timestamp: new Date(),
        avatar: '',
      };
      setComments([newComment, ...comments.slice(0, 4)]);
      setLoading(false);
    }, 1000);
  };

  // Initial load
  useEffect(() => {
    // This would be an API call in a real app
  }, []);

  return (
    <Paper sx={{ p: 2, height: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Comentários Recentes dos Cobradores</Typography>
        <Button
          startIcon={loading ? <CircularProgress size={20} /> : <RefreshIcon />}
          onClick={fetchComments}
          disabled={loading}
          size="small"
        >
          Atualizar
        </Button>
      </Box>
      
      <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
        {comments.map((comment, index) => (
          <React.Fragment key={comment.id}>
            {index > 0 && <Divider variant="inset" component="li" />}
            <ListItem alignItems="flex-start">
              <ListItemAvatar>
                <Avatar alt={comment.user} src={comment.avatar}>
                  {comment.user.charAt(0)}
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography component="span" variant="subtitle2">
                      {comment.user}
                    </Typography>
                    <Chip 
                      label={comment.role} 
                      size="small" 
                      color="primary" 
                      variant="outlined" 
                      sx={{ height: 20, fontSize: '0.7rem' }}
                    />
                    <Typography component="span" variant="caption" color="text.secondary">
                      • Pedido #{comment.orderId}
                    </Typography>
                  </Box>
                }
                secondary={
                  <React.Fragment>
                    <Typography
                      component="span"
                      variant="body2"
                      color="text.primary"
                      sx={{ display: 'block', mt: 0.5, mb: 0.5 }}
                    >
                      {comment.comment}
                    </Typography>
                    <Typography component="span" variant="caption" color="text.secondary">
                      {formatDistanceToNow(comment.timestamp, { addSuffix: true, locale: ptBR })}
                    </Typography>
                  </React.Fragment>
                }
              />
            </ListItem>
          </React.Fragment>
        ))}
      </List>
    </Paper>
  );
};

export default RecentComments;
