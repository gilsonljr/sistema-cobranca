// Mapeamento de nomes para padronização
const vendedoresMap = {
  'Heitor': 'Heitor Menezes',
  'Joyce': 'Joyce Ferreira',
  'Leticia': 'Leticia Souza',
  'Luiz': 'Luiz Schultz',
  'Edgard': 'Edgard B',
  'Maiara': 'Maiara Ferreira',
  'Gilson': 'Gilson',
  'Ludimila': 'Ludimila Sthefani'
};

// Função para verificar se o nome precisa ser padronizado
const shouldReplaceName = (name) => {
  if (!name) return false;
  
  const simpleNames = Object.keys(vendedoresMap);
  // Verifica se o nome é exatamente igual a um dos nomes simples (sem ser substring)
  return simpleNames.some(simpleName => name === simpleName);
};

// Função para padronizar os nomes nos pedidos
const padronizarNomesVendedores = () => {
  try {
    // Carregar os pedidos existentes
    const ordersString = localStorage.getItem('orders');
    if (!ordersString) {
      console.log('Nenhum pedido encontrado.');
      return { success: false, message: 'Nenhum pedido encontrado.' };
    }
    
    const orders = JSON.parse(ordersString);
    console.log(`Encontrados ${orders.length} pedidos para processamento.`);
    
    // Contador de substituições
    let substituicoes = 0;
    
    // Mapear e substituir os nomes dos vendedores
    const updatedOrders = orders.map(order => {
      if (order.vendedor && shouldReplaceName(order.vendedor)) {
        substituicoes++;
        return {
          ...order,
          vendedor: vendedoresMap[order.vendedor] || order.vendedor
        };
      }
      return order;
    });
    
    // Salvar de volta no localStorage
    localStorage.setItem('orders', JSON.stringify(updatedOrders));
    
    console.log(`Padronização concluída. Foram realizadas ${substituicoes} substituições de nomes.`);
    return { success: true, message: `Padronização concluída. Foram realizadas ${substituicoes} substituições de nomes.` };
  } catch (error) {
    console.error('Erro ao padronizar nomes de vendedores:', error);
    return { success: false, message: 'Erro ao padronizar nomes: ' + error.message };
  }
};

// Disponibilizar a função para o objeto window para execução a partir do console
window.padronizarNomesVendedores = padronizarNomesVendedores; 