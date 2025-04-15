/**
 * Serviço de emergência para corrigir problemas de senha
 * Este arquivo usa JavaScript puro para evitar problemas de compilação TypeScript
 */

// Função para corrigir o problema de senhas
function fixPasswordIssue() {
  console.log('Iniciando correção de emergência para problemas de senha...');
  
  try {
    // 1. Limpar completamente o localStorage
    console.log('Limpando localStorage...');
    localStorage.clear();
    
    // 2. Definir as credenciais padrão diretamente
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
      'maria@wolf.com': {
        id: 103,
        email: 'maria@wolf.com',
        fullName: 'Maria Oliveira',
        role: 'seller',
        password: 'vendedor123'
      },
      'ludimila@wolf.com': {
        id: 104,
        email: 'ludimila@wolf.com',
        fullName: 'Ludimila',
        role: 'collector',
        password: 'operador123'
      },
      'carlos@wolf.com': {
        id: 105,
        email: 'carlos@wolf.com',
        fullName: 'Carlos Ferreira',
        role: 'collector',
        password: 'operador123'
      },
      'pedro@wolf.com': {
        id: 106,
        email: 'pedro@wolf.com',
        fullName: 'Pedro Santos',
        role: 'collector',
        password: 'operador123'
      }
    };
    
    // 3. Salvar usuários no localStorage
    localStorage.setItem('default_users', JSON.stringify(defaultUsers));
    console.log('Usuários padrão salvos no localStorage');
    
    // 4. Definir alguns pedidos de exemplo
    const sampleOrders = [
      {
        idVenda: "W001",
        dataVenda: "2023-05-01",
        cliente: "João Silva",
        telefone: "(11) 98765-4321",
        oferta: "Potencia Azul - 2 Gel + 2 Cápsulas",
        valorVenda: 197.90,
        situacaoVenda: "Aprovado",
        vendedor: "Maria Oliveira",
        operador: "Ludimila",
        cep: "01310-200",
        endereco: "Av. Paulista, 1000",
        bairro: "Bela Vista",
        cidade: "São Paulo",
        estado: "SP",
        formaPagamento: "Cartão de Crédito",
        statusPagamento: "Pago",
        codigoRastreio: "BR123456789BR",
        statusEntrega: "Entregue"
      },
      {
        idVenda: "W002",
        dataVenda: "2023-05-02",
        cliente: "Maria Santos",
        telefone: "(11) 91234-5678",
        oferta: "Potencia Azul - 3 Gel",
        valorVenda: 147.90,
        situacaoVenda: "Aprovado",
        vendedor: "Maria Oliveira",
        operador: "Ana Souza",
        cep: "04538-132",
        endereco: "Rua Itaim, 500",
        bairro: "Itaim Bibi",
        cidade: "São Paulo",
        estado: "SP",
        formaPagamento: "Boleto",
        statusPagamento: "Pago",
        codigoRastreio: "BR987654321BR",
        statusEntrega: "Em trânsito"
      }
    ];
    
    localStorage.setItem('orders', JSON.stringify(sampleOrders));
    console.log('Pedidos de exemplo salvos no localStorage');
    
    // 5. Definir produtos de exemplo
    const sampleProducts = [
      {
        id: 1,
        name: "Potencia Azul",
        description: "Suplemento para saúde masculina",
        active: true,
        offers: [
          {
            id: 1,
            name: "2 Gel + 2 Cápsulas",
            description: "Combo completo",
            price: 197.90,
            active: true,
            variation: "gel",
            gelQuantity: 2,
            capsulasQuantity: 2
          },
          {
            id: 2,
            name: "3 Gel",
            description: "Tratamento intensivo gel",
            price: 147.90,
            active: true,
            variation: "gel",
            gelQuantity: 3,
            capsulasQuantity: 0
          }
        ]
      }
    ];
    
    localStorage.setItem('products', JSON.stringify(sampleProducts));
    console.log('Produtos de exemplo salvos no localStorage');
    
    return {
      success: true,
      message: 'Correção de emergência concluída com sucesso!'
    };
  } catch (error) {
    console.error('Erro durante a correção de emergência:', error);
    return {
      success: false,
      message: 'Erro durante a correção: ' + error.message
    };
  }
}

// Função para verificar credenciais
function checkCredentials(email, password) {
  try {
    if (!email || !password) {
      return { valid: false, message: 'Email ou senha não fornecidos' };
    }
    
    const emailLower = email.toLowerCase();
    
    // Obter usuários do localStorage
    const usersStr = localStorage.getItem('default_users');
    const users = usersStr ? JSON.parse(usersStr) : {};
    
    console.log(`Verificando credenciais para ${emailLower}`);
    console.log('Usuários disponíveis:', Object.keys(users));
    
    const user = users[emailLower];
    
    if (!user) {
      return { valid: false, message: 'Usuário não encontrado' };
    }
    
    const isValid = user.password === password;
    console.log(`Senha fornecida: ${password}, Senha armazenada: ${user.password}, Válida: ${isValid}`);
    
    return { 
      valid: isValid, 
      message: isValid ? 'Credenciais válidas' : 'Senha incorreta',
      user: isValid ? user : null
    };
  } catch (error) {
    console.error('Erro ao verificar credenciais:', error);
    return { valid: false, message: 'Erro ao verificar credenciais: ' + error.message };
  }
}

// Função para atualizar senha
function updatePassword(email, newPassword) {
  try {
    if (!email || !newPassword) {
      return { success: false, message: 'Email ou nova senha não fornecidos' };
    }
    
    const emailLower = email.toLowerCase();
    
    // Obter usuários do localStorage
    const usersStr = localStorage.getItem('default_users');
    const users = usersStr ? JSON.parse(usersStr) : {};
    
    const user = users[emailLower];
    
    if (!user) {
      return { success: false, message: 'Usuário não encontrado' };
    }
    
    // Atualizar senha
    user.password = newPassword;
    users[emailLower] = user;
    
    // Salvar no localStorage
    localStorage.setItem('default_users', JSON.stringify(users));
    
    console.log(`Senha atualizada para ${emailLower}: ${newPassword}`);
    
    return { 
      success: true, 
      message: 'Senha atualizada com sucesso'
    };
  } catch (error) {
    console.error('Erro ao atualizar senha:', error);
    return { success: false, message: 'Erro ao atualizar senha: ' + error.message };
  }
}

// Exportar funções
window.PasswordFixService = {
  fixPasswordIssue,
  checkCredentials,
  updatePassword
};
