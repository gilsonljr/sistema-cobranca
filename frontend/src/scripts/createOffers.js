// Script para criar ofertas para o produto "Potencia Azul" com base nas vendas existentes

// Função para ler os pedidos do localStorage
function getOrders() {
  try {
    const ordersJson = localStorage.getItem('orders');
    return ordersJson ? JSON.parse(ordersJson) : [];
  } catch (error) {
    console.error('Erro ao ler pedidos:', error);
    return [];
  }
}

// Função para ler os produtos do localStorage
function getProducts() {
  try {
    const productsJson = localStorage.getItem('products');
    return productsJson ? JSON.parse(productsJson) : [];
  } catch (error) {
    console.error('Erro ao ler produtos:', error);
    return [];
  }
}

// Função para salvar produtos no localStorage
function saveProducts(products) {
  try {
    localStorage.setItem('products', JSON.stringify(products));
    console.log('Produtos salvos com sucesso!');
  } catch (error) {
    console.error('Erro ao salvar produtos:', error);
  }
}

// Função para gerar ID único
function generateId() {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}

// Função principal
function createOffersForPotenciaAzul() {
  // Obter pedidos
  const orders = getOrders();
  console.log(`Total de pedidos encontrados: ${orders.length}`);
  
  if (orders.length === 0) {
    console.log('Nenhum pedido encontrado. Não é possível criar ofertas.');
    return;
  }
  
  // Extrair ofertas únicas dos pedidos
  const uniqueOffers = new Map();
  
  orders.forEach(order => {
    // Verificar se o pedido tem oferta e valor
    if (order.oferta && order.valorVenda) {
      // Usar o nome da oferta como chave
      const offerName = order.oferta.trim();
      
      // Se a oferta já existe, verificar se o valor é o mesmo
      if (uniqueOffers.has(offerName)) {
        const existingOffer = uniqueOffers.get(offerName);
        
        // Se o valor for diferente, criar uma nova oferta com o valor
        if (existingOffer.price !== order.valorVenda) {
          const newOfferName = `${offerName} - ${order.valorVenda.toFixed(2)}`;
          uniqueOffers.set(newOfferName, {
            name: newOfferName,
            price: order.valorVenda,
            count: 1
          });
        } else {
          // Incrementar contador
          existingOffer.count++;
        }
      } else {
        // Adicionar nova oferta
        uniqueOffers.set(offerName, {
          name: offerName,
          price: order.valorVenda,
          count: 1
        });
      }
    }
  });
  
  console.log(`Ofertas únicas encontradas: ${uniqueOffers.size}`);
  
  // Obter produtos
  const products = getProducts();
  
  // Encontrar o produto "Potencia Azul"
  const potenciaAzulIndex = products.findIndex(p => p.name === "Potencia Azul");
  
  if (potenciaAzulIndex === -1) {
    console.log('Produto "Potencia Azul" não encontrado. Criando produto...');
    
    // Criar produto
    const newProduct = {
      id: generateId(),
      name: "Potencia Azul",
      description: "Produto criado automaticamente com base nas vendas existentes",
      active: true,
      offers: []
    };
    
    // Adicionar ofertas
    uniqueOffers.forEach(offer => {
      newProduct.offers.push({
        id: generateId(),
        name: offer.name,
        description: `Oferta criada automaticamente (${offer.count} vendas)`,
        price: offer.price,
        active: true
      });
    });
    
    // Adicionar produto à lista
    products.push(newProduct);
    
    // Salvar produtos
    saveProducts(products);
    
    console.log(`Produto "Potencia Azul" criado com ${newProduct.offers.length} ofertas.`);
  } else {
    console.log(`Produto "Potencia Azul" encontrado. Adicionando ofertas...`);
    
    // Obter produto
    const potenciaAzul = products[potenciaAzulIndex];
    
    // Criar mapa de ofertas existentes
    const existingOffers = new Map();
    potenciaAzul.offers.forEach(offer => {
      existingOffers.set(offer.name, offer);
    });
    
    // Contador de ofertas adicionadas
    let addedCount = 0;
    
    // Adicionar ofertas que não existem
    uniqueOffers.forEach(offer => {
      if (!existingOffers.has(offer.name)) {
        potenciaAzul.offers.push({
          id: generateId(),
          name: offer.name,
          description: `Oferta criada automaticamente (${offer.count} vendas)`,
          price: offer.price,
          active: true
        });
        addedCount++;
      }
    });
    
    // Salvar produtos
    saveProducts(products);
    
    console.log(`${addedCount} novas ofertas adicionadas ao produto "Potencia Azul".`);
  }
  
  console.log('Processo concluído!');
}

// Executar função principal
createOffersForPotenciaAzul();
