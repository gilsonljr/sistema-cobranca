// Script to initialize mock authentication data
console.log('Initializing mock authentication data...');

// 1. Define default users
const defaultUsers = {
  'admin@sistema.com': {
    id: 1,
    email: 'admin@sistema.com',
    fullName: 'Admin',
    role: 'admin',
    password: 'admin123'
  },
  'supervisor@sistema.com': {
    id: 2,
    email: 'supervisor@sistema.com',
    fullName: 'Supervisor',
    role: 'supervisor',
    password: 'supervisor123'
  },
  'operador@sistema.com': {
    id: 3,
    email: 'operador@sistema.com',
    fullName: 'Operador',
    role: 'collector',
    password: 'operador123'
  },
  'vendedor@sistema.com': {
    id: 4,
    email: 'vendedor@sistema.com',
    fullName: 'Vendedor',
    role: 'seller',
    password: 'vendedor123'
  },
  'joao@wolf.com': {
    id: 101,
    email: 'joao@wolf.com',
    fullName: 'João Silva',
    role: 'collector',
    password: 'operador123'
  },
  'ana@wolf.com': {
    id: 102,
    email: 'ana@wolf.com',
    fullName: 'Ana Souza',
    role: 'collector',
    password: 'operador123'
  },
  'ludimila@wolf.com': {
    id: 103,
    email: 'ludimila@wolf.com',
    fullName: 'Ludimila',
    role: 'collector',
    password: 'operador123'
  },
  'carlos@wolf.com': {
    id: 104,
    email: 'carlos@wolf.com',
    fullName: 'Carlos Ferreira',
    role: 'collector',
    password: 'operador123'
  },
  'pedro@wolf.com': {
    id: 105,
    email: 'pedro@wolf.com',
    fullName: 'Pedro Santos',
    role: 'collector',
    password: 'operador123'
  },
  'maria@wolf.com': {
    id: 201,
    email: 'maria@wolf.com',
    fullName: 'Maria Oliveira',
    role: 'seller',
    password: 'vendedor123'
  }
};

// 2. Define user passwords
const userPasswords = {
  'admin@sistema.com': 'admin123',
  'supervisor@sistema.com': 'supervisor123',
  'operador@sistema.com': 'operador123',
  'vendedor@sistema.com': 'vendedor123',
  'joao@wolf.com': 'operador123',
  'ana@wolf.com': 'operador123',
  'ludimila@wolf.com': 'operador123',
  'carlos@wolf.com': 'operador123',
  'pedro@wolf.com': 'operador123',
  'maria@wolf.com': 'vendedor123'
};

// 3. Define users for the main context
const contextUsers = [
  {
    id: 1,
    nome: "Admin",
    email: "admin@sistema.com",
    papeis: ["admin"],
    permissoes: ["criar_usuario", "editar_usuario", "excluir_usuario", "ver_relatorios", "editar_configuracoes", "ver_todos_pedidos", "editar_pedidos"],
    ativo: true
  },
  {
    id: 2,
    nome: "Supervisor",
    email: "supervisor@sistema.com",
    papeis: ["supervisor"],
    permissoes: ["ver_relatorios", "ver_todos_pedidos", "editar_pedidos"],
    ativo: true
  },
  {
    id: 3,
    nome: "Operador",
    email: "operador@sistema.com",
    papeis: ["collector"],
    permissoes: ["ver_pedidos_atribuidos", "editar_pedidos_atribuidos"],
    ativo: true
  },
  {
    id: 4,
    nome: "Vendedor",
    email: "vendedor@sistema.com",
    papeis: ["seller"],
    permissoes: ["ver_pedidos_criados", "criar_pedidos"],
    ativo: true
  },
  {
    id: 101,
    nome: "João Silva",
    email: "joao@wolf.com",
    papeis: ["collector"],
    permissoes: ["ver_pedidos_atribuidos", "editar_pedidos_atribuidos"],
    ativo: true
  },
  {
    id: 102,
    nome: "Ana Souza",
    email: "ana@wolf.com",
    papeis: ["collector"],
    permissoes: ["ver_pedidos_atribuidos", "editar_pedidos_atribuidos"],
    ativo: true
  },
  {
    id: 103,
    nome: "Ludimila",
    email: "ludimila@wolf.com",
    papeis: ["collector"],
    permissoes: ["ver_pedidos_atribuidos", "editar_pedidos_atribuidos"],
    ativo: true
  },
  {
    id: 104,
    nome: "Carlos Ferreira",
    email: "carlos@wolf.com",
    papeis: ["collector"],
    permissoes: ["ver_pedidos_atribuidos", "editar_pedidos_atribuidos"],
    ativo: true
  },
  {
    id: 105,
    nome: "Pedro Santos",
    email: "pedro@wolf.com",
    papeis: ["collector"],
    permissoes: ["ver_pedidos_atribuidos", "editar_pedidos_atribuidos"],
    ativo: true
  },
  {
    id: 201,
    nome: "Maria Oliveira",
    email: "maria@wolf.com",
    papeis: ["seller"],
    permissoes: ["ver_pedidos_criados", "criar_pedidos"],
    ativo: true
  }
];

// 4. Define mock users
const mockUsers = contextUsers.map(user => {
  // Determine profile
  let perfil = 'Usuário';
  if (user.papeis.includes('admin')) perfil = 'Administrador';
  else if (user.papeis.includes('supervisor')) perfil = 'Supervisor';
  else if (user.papeis.includes('collector')) perfil = 'Operador';
  else if (user.papeis.includes('seller')) perfil = 'Vendedor';
  
  return {
    id: user.id,
    nome: user.nome,
    email: user.email,
    perfil: perfil,
    permissoes: user.permissoes,
    ativo: user.ativo
  };
});

// 5. Save all data to localStorage
localStorage.setItem('default_users', JSON.stringify(defaultUsers));
localStorage.setItem('user_passwords', JSON.stringify(userPasswords));
localStorage.setItem('users', JSON.stringify(contextUsers));
localStorage.setItem('mockUsers', JSON.stringify(mockUsers));

console.log('Mock authentication data initialized successfully!');
console.log('Default users:', Object.keys(defaultUsers).length);
console.log('User passwords:', Object.keys(userPasswords).length);
console.log('Context users:', contextUsers.length);
console.log('Mock users:', mockUsers.length);
