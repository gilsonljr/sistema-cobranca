// Debug script to add duplicate orders for testing
// To use: Open browser console and run this script

function addDebugDuplicateOrders() {
  // Read existing orders
  const savedOrders = localStorage.getItem('orders');
  const orders = savedOrders ? JSON.parse(savedOrders) : [];
  
  // Create some duplicate orders with the same phone numbers but different IDs
  const phone1 = '11999887766';
  const phone2 = '21988776655';
  
  const testOrders = [
    {
      idVenda: 'TEST-DUP-1',
      dataVenda: '10/06/2023',
      cliente: 'Cliente Teste 1',
      telefone: phone1,
      documentoCliente: '12345678900',
      oferta: 'Produto A',
      valorVenda: 149.99,
      valorRecebido: 0,
      status: 'PENDING',
      situacaoVenda: 'Possíveis Duplicados',
      historico: '',
      ultimaAtualizacao: '10/06/2023 14:30',
      codigoRastreio: '',
      statusCorreios: '',
      atualizacaoCorreios: '',
      vendedor: 'Vendedor 1',
      operador: '',
      zap: phone1,
      estadoDestinatario: 'SP',
      cidadeDestinatario: 'São Paulo',
      ruaDestinatario: 'Rua Teste',
      cepDestinatario: '01234000',
      complementoDestinatario: '',
      bairroDestinatario: 'Centro',
      numeroEnderecoDestinatario: '123',
      dataEstimadaChegada: '',
      billingHistory: []
    },
    {
      idVenda: 'TEST-DUP-2',
      dataVenda: '11/06/2023',
      cliente: 'Cliente Teste 1 (repetido)',
      telefone: phone1,
      documentoCliente: '12345678900',
      oferta: 'Produto A',
      valorVenda: 155.00, // Within 5% of the first order
      valorRecebido: 0,
      status: 'PENDING',
      situacaoVenda: 'Possíveis Duplicados',
      historico: '',
      ultimaAtualizacao: '11/06/2023 10:15',
      codigoRastreio: '',
      statusCorreios: '',
      atualizacaoCorreios: '',
      vendedor: 'Vendedor 1',
      operador: '',
      zap: phone1,
      estadoDestinatario: 'SP',
      cidadeDestinatario: 'São Paulo',
      ruaDestinatario: 'Rua Teste',
      cepDestinatario: '01234000',
      complementoDestinatario: '',
      bairroDestinatario: 'Centro',
      numeroEnderecoDestinatario: '123',
      dataEstimadaChegada: '',
      billingHistory: []
    },
    {
      idVenda: 'TEST-DUP-3',
      dataVenda: '12/06/2023',
      cliente: 'Cliente Teste 2',
      telefone: phone2,
      documentoCliente: '98765432100',
      oferta: 'Produto B',
      valorVenda: 249.99,
      valorRecebido: 0,
      status: 'PENDING',
      situacaoVenda: 'Possíveis Duplicados',
      historico: '',
      ultimaAtualizacao: '12/06/2023 16:45',
      codigoRastreio: '',
      statusCorreios: '',
      atualizacaoCorreios: '',
      vendedor: 'Vendedor 2',
      operador: '',
      zap: phone2,
      estadoDestinatario: 'RJ',
      cidadeDestinatario: 'Rio de Janeiro',
      ruaDestinatario: 'Av Teste',
      cepDestinatario: '20000100',
      complementoDestinatario: '',
      bairroDestinatario: 'Copacabana',
      numeroEnderecoDestinatario: '456',
      dataEstimadaChegada: '',
      billingHistory: []
    },
    {
      idVenda: 'TEST-DUP-4',
      dataVenda: '12/06/2023',
      cliente: 'Cliente Teste 2 (repetido)',
      telefone: phone2,
      documentoCliente: '98765432100',
      oferta: 'Produto B',
      valorVenda: 239.99, // Within 5% of the third order
      valorRecebido: 0,
      status: 'PENDING',
      situacaoVenda: 'Possíveis Duplicados',
      historico: '',
      ultimaAtualizacao: '12/06/2023 17:30',
      codigoRastreio: '',
      statusCorreios: '',
      atualizacaoCorreios: '',
      vendedor: 'Vendedor 2',
      operador: '',
      zap: phone2,
      estadoDestinatario: 'RJ',
      cidadeDestinatario: 'Rio de Janeiro',
      ruaDestinatario: 'Av Teste',
      cepDestinatario: '20000100',
      complementoDestinatario: '',
      bairroDestinatario: 'Copacabana',
      numeroEnderecoDestinatario: '456',
      dataEstimadaChegada: '',
      billingHistory: []
    }
  ];
  
  // Add the test orders to the existing orders
  const updatedOrders = [...orders, ...testOrders];
  
  // Save back to localStorage
  localStorage.setItem('orders', JSON.stringify(updatedOrders));
  
  console.log(`Added ${testOrders.length} test duplicate orders.`);
  console.log('Total orders in localStorage:', updatedOrders.length);
  
  return testOrders;
}

// Execute the function
const addedOrders = addDebugDuplicateOrders();
console.log('Added duplicate orders:', addedOrders);

// Log a message about how to use the duplicates page
console.log('Now navigate to http://localhost:3001/duplicates to see the duplicate orders'); 