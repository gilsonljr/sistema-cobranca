// Script para verificar o estado dos pedidos no localStorage

// Função para verificar os pedidos
function checkOrders() {
  try {
    // Obter pedidos do localStorage
    const ordersJson = localStorage.getItem('orders');
    if (!ordersJson) {
      console.log('Nenhum pedido encontrado no localStorage');
      return;
    }

    const orders = JSON.parse(ordersJson);
    console.log(`Total de pedidos no localStorage: ${orders.length}`);

    // Mostrar os primeiros 5 pedidos
    if (orders.length > 0) {
      console.log('Primeiros 5 pedidos:');
      orders.slice(0, 5).forEach((order, index) => {
        console.log(`Pedido ${index + 1}:`, {
          idVenda: order.idVenda,
          cliente: order.cliente,
          dataVenda: order.dataVenda,
          situacaoVenda: order.situacaoVenda
        });
      });
    }

    // Verificar se há alguma limitação no código
    console.log('\nVerificando possíveis limitações:');
    
    // Verificar se há algum filtro aplicado
    const filteredOrders = orders.filter(order => order.situacaoVenda !== 'Cancelado');
    console.log(`Pedidos após filtro (excluindo cancelados): ${filteredOrders.length}`);

    // Verificar se há alguma paginação
    const page = 0;
    const rowsPerPage = 10;
    const paginatedOrders = orders.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
    console.log(`Pedidos na primeira página (${rowsPerPage} por página): ${paginatedOrders.length}`);

    // Verificar produtos no localStorage
    const productsJson = localStorage.getItem('products');
    if (productsJson) {
      const products = JSON.parse(productsJson);
      console.log(`\nTotal de produtos no localStorage: ${products.length}`);
      
      // Verificar se há ofertas
      let totalOffers = 0;
      products.forEach(product => {
        totalOffers += product.offers ? product.offers.length : 0;
      });
      console.log(`Total de ofertas: ${totalOffers}`);
    } else {
      console.log('\nNenhum produto encontrado no localStorage');
    }
  } catch (error) {
    console.error('Erro ao verificar pedidos:', error);
  }
}

// Executar a função
checkOrders();
