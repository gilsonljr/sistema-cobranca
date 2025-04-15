import React from 'react';
import { Box, Typography, Paper, List, ListItem, ListItemText, Divider } from '@mui/material';

// Dados de exemplo para usuários
const mockUsers = [
  { id: 1, nome: 'Admin', email: 'admin@sistema.com', perfil: 'Administrador', ativo: true },
  { id: 2, nome: 'João Silva', email: 'joao@wolf.com', perfil: 'Operador', ativo: true },
  { id: 3, nome: 'Maria Oliveira', email: 'maria@wolf.com', perfil: 'Vendedor', ativo: true },
  { id: 4, nome: 'Pedro Santos', email: 'pedro@wolf.com', perfil: 'Operador', ativo: true },
  { id: 5, nome: 'Ana Souza', email: 'ana@wolf.com', perfil: 'Operador', ativo: true },
  { id: 6, nome: 'Ludimila', email: 'ludimila@wolf.com', perfil: 'Operador', ativo: true },
  { id: 7, nome: 'Carlos Ferreira', email: 'carlos@wolf.com', perfil: 'Operador', ativo: true },
];

const UsersPageBasic = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Lista de Usuários
      </Typography>
      <Paper sx={{ p: 3 }}>
        <List>
          {mockUsers.map((user, index) => (
            <React.Fragment key={user.id}>
              <ListItem>
                <ListItemText
                  primary={user.nome}
                  secondary={
                    <>
                      <Typography component="span" variant="body2" color="text.primary">
                        {user.email}
                      </Typography>
                      {` — ${user.perfil} (${user.ativo ? 'Ativo' : 'Inativo'})`}
                    </>
                  }
                />
              </ListItem>
              {index < mockUsers.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </List>
      </Paper>
    </Box>
  );
};

export default UsersPageBasic;
