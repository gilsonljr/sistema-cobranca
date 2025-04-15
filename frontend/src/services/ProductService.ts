import { Product, Offer, VariationType, initialProducts, generateId } from '../types/Product';
import { Order } from '../types/Order';

class ProductService {
  private storageKey = 'products';

  /**
   * Carrega produtos do localStorage ou usa os dados iniciais
   */
  getProducts(): Product[] {
    const storedProducts = localStorage.getItem(this.storageKey);
    if (storedProducts) {
      return JSON.parse(storedProducts);
    }

    // Se não houver produtos salvos, use os dados iniciais
    this.saveProducts(initialProducts);
    return initialProducts;
  }

  /**
   * Salva produtos no localStorage
   */
  saveProducts(products: Product[]): void {
    localStorage.setItem(this.storageKey, JSON.stringify(products));
  }

  /**
   * Adiciona um novo produto
   */
  addProduct(product: Omit<Product, 'id'>): Product {
    const products = this.getProducts();
    const newProduct: Product = {
      ...product,
      id: generateId()
    };

    products.push(newProduct);
    this.saveProducts(products);
    return newProduct;
  }

  /**
   * Atualiza um produto existente
   */
  updateProduct(productId: string, updates: Partial<Product>): Product | null {
    const products = this.getProducts();
    const index = products.findIndex(p => p.id === productId);

    if (index === -1) {
      return null;
    }

    const updatedProduct = {
      ...products[index],
      ...updates,
      // Preservar o ID e as ofertas
      id: products[index].id,
      offers: updates.offers || products[index].offers
    };

    products[index] = updatedProduct;
    this.saveProducts(products);
    return updatedProduct;
  }

  /**
   * Remove um produto
   */
  deleteProduct(productId: string): boolean {
    const products = this.getProducts();
    const filteredProducts = products.filter(p => p.id !== productId);

    if (filteredProducts.length === products.length) {
      return false; // Nenhum produto foi removido
    }

    this.saveProducts(filteredProducts);
    return true;
  }

  /**
   * Adiciona uma oferta a um produto
   */
  addOffer(productId: string, offer: Omit<Offer, 'id'>): Offer | null {
    const products = this.getProducts();
    const productIndex = products.findIndex(p => p.id === productId);

    if (productIndex === -1) {
      return null;
    }

    const newOffer: Offer = {
      ...offer,
      id: generateId()
    };

    products[productIndex].offers.push(newOffer);
    this.saveProducts(products);
    return newOffer;
  }

  /**
   * Atualiza uma oferta existente e atualiza os pedidos relacionados
   */
  updateOffer(productId: string, offerId: string, updates: Partial<Offer>): Offer | null {
    const products = this.getProducts();
    const productIndex = products.findIndex(p => p.id === productId);

    if (productIndex === -1) {
      return null;
    }

    const offerIndex = products[productIndex].offers.findIndex(o => o.id === offerId);

    if (offerIndex === -1) {
      return null;
    }

    const currentOffer = products[productIndex].offers[offerIndex];
    const productName = products[productIndex].name;

    const updatedOffer = {
      ...currentOffer,
      ...updates,
      // Preservar o ID
      id: currentOffer.id
    };

    products[productIndex].offers[offerIndex] = updatedOffer;
    this.saveProducts(products);

    // Se o nome da oferta foi alterado, atualizar os pedidos relacionados
    if (updates.name && updates.name !== currentOffer.name) {
      this.updateOrdersWithNewOfferName(offerId, {
        oldDisplayName: `${productName} - ${currentOffer.name}`,
        newDisplayName: `${productName} - ${updates.name}`
      });
    }

    return updatedOffer;
  }

  /**
   * Atualiza os pedidos quando o nome de uma oferta é alterado
   */
  private updateOrdersWithNewOfferName(offerId: string, names: { oldDisplayName: string, newDisplayName: string }): void {
    try {
      // Obter pedidos do localStorage
      const ordersJson = localStorage.getItem('orders');
      if (!ordersJson) return;

      const orders: Order[] = JSON.parse(ordersJson);
      let updated = false;

      // Atualizar pedidos que usam esta oferta
      const updatedOrders = orders.map(order => {
        // Verificar se o pedido usa esta oferta pelo nome de exibição
        if (order.oferta === names.oldDisplayName) {
          updated = true;
          return {
            ...order,
            oferta: names.newDisplayName
          };
        }
        return order;
      });

      // Salvar pedidos atualizados se houve alterações
      if (updated) {
        localStorage.setItem('orders', JSON.stringify(updatedOrders));
        console.log(`Pedidos atualizados com o novo nome da oferta: ${names.newDisplayName}`);
      }
    } catch (error) {
      console.error('Erro ao atualizar pedidos com novo nome de oferta:', error);
    }
  }

  /**
   * Remove uma oferta de um produto ou a inativa se estiver em uso
   */
  deleteOffer(productId: string, offerId: string): { success: boolean, inactivated: boolean } {
    const products = this.getProducts();
    const productIndex = products.findIndex(p => p.id === productId);

    if (productIndex === -1) {
      return { success: false, inactivated: false };
    }

    // Verificar se a oferta está sendo usada em algum pedido
    const offerIndex = products[productIndex].offers.findIndex(o => o.id === offerId);
    if (offerIndex === -1) {
      return { success: false, inactivated: false };
    }

    const offer = products[productIndex].offers[offerIndex];
    const isInUse = this.checkIfOfferIsInUse(offer, products[productIndex].name);

    if (isInUse) {
      // Se a oferta estiver em uso, apenas inativá-la
      products[productIndex].offers[offerIndex] = {
        ...offer,
        active: false,
        inUse: true
      };

      this.saveProducts(products);
      return { success: true, inactivated: true };
    } else {
      // Se não estiver em uso, remover completamente
      const originalLength = products[productIndex].offers.length;
      products[productIndex].offers = products[productIndex].offers.filter(o => o.id !== offerId);

      if (products[productIndex].offers.length === originalLength) {
        return { success: false, inactivated: false }; // Nenhuma oferta foi removida
      }

      this.saveProducts(products);
      return { success: true, inactivated: false };
    }
  }

  /**
   * Verifica se uma oferta está sendo usada em algum pedido
   */
  private checkIfOfferIsInUse(offer: Offer, productName: string): boolean {
    try {
      // Obter pedidos do localStorage
      const ordersJson = localStorage.getItem('orders');
      if (!ordersJson) return false;

      const orders: Order[] = JSON.parse(ordersJson);
      const displayName = `${productName} - ${offer.name}`;

      // Verificar se algum pedido usa esta oferta
      return orders.some(order => order.oferta === displayName);
    } catch (error) {
      console.error('Erro ao verificar uso da oferta:', error);
      return false;
    }
  }

  /**
   * Atualiza o status de uso de todas as ofertas
   */
  updateOffersUsageStatus(): void {
    try {
      const products = this.getProducts();
      const ordersJson = localStorage.getItem('orders');
      if (!ordersJson) return;

      const orders: Order[] = JSON.parse(ordersJson);
      let updated = false;

      // Para cada produto e oferta, verificar se está sendo usada
      products.forEach((product, productIndex) => {
        product.offers.forEach((offer, offerIndex) => {
          const displayName = `${product.name} - ${offer.name}`;
          const isInUse = orders.some(order => order.oferta === displayName);

          if (offer.inUse !== isInUse) {
            products[productIndex].offers[offerIndex].inUse = isInUse;
            updated = true;
          }
        });
      });

      // Salvar produtos atualizados se houve alterações
      if (updated) {
        this.saveProducts(products);
        console.log('Status de uso das ofertas atualizado');
      }
    } catch (error) {
      console.error('Erro ao atualizar status de uso das ofertas:', error);
    }
  }

  /**
   * Obtém todas as ofertas ativas de todos os produtos ativos
   */
  getAllActiveOffers(): Array<Offer & { productName: string, displayName: string }> {
    // Atualizar status de uso das ofertas antes de retornar
    this.updateOffersUsageStatus();

    const products = this.getProducts();
    const activeProducts = products.filter(product => product.active);

    return activeProducts.flatMap(product =>
      product.offers
        .filter(offer => offer.active)
        .map(offer => ({
          ...offer,
          productName: product.name,
          displayName: `${product.name} - ${offer.name}`
        }))
    );
  }

  /**
   * Obtém todas as ofertas ativas de um tipo de variação específico
   */
  getActiveOffersByVariation(variation: VariationType): Array<Offer & { productName: string, displayName: string }> {
    const allOffers = this.getAllActiveOffers();
    return allOffers.filter(offer => offer.variation === variation);
  }

  /**
   * Encontra uma oferta por ID
   */
  findOfferById(offerId: string): (Offer & { productName: string, displayName: string }) | null {
    const products = this.getProducts();

    for (const product of products) {
      const offer = product.offers.find(o => o.id === offerId);
      if (offer) {
        return {
          ...offer,
          productName: product.name,
          displayName: `${product.name} - ${offer.name}`
        };
      }
    }

    return null;
  }
}

export default new ProductService();
