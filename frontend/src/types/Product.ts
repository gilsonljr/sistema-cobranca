// Tipo para variação de produto (Gel ou Cápsulas)
export type VariationType = 'gel' | 'capsulas';

// Tipo para uma oferta específica
export interface Offer {
  id: string;
  name: string;
  description?: string;
  price: number;
  active: boolean;
  variation: VariationType;  // Tipo de variação principal (para compatibilidade)
  gelQuantity: number;       // Quantidade de gel na oferta
  capsulasQuantity: number;  // Quantidade de cápsulas na oferta
  stock?: number;            // Quantidade em estoque (opcional)
  inUse?: boolean;          // Indica se a oferta está sendo usada em algum pedido
  productName?: string;     // Nome do produto associado à oferta
  displayName?: string;     // Nome de exibição combinado (produto - oferta)
}

// Tipo para um produto que pode ter múltiplas ofertas
export interface Product {
  id: string;
  name: string;
  description?: string;
  active: boolean;
  offers: Offer[];
}

// Tipo para o estado global de produtos
export interface ProductState {
  products: Product[];
  loading: boolean;
  error: string | null;
}

// Função auxiliar para gerar IDs únicos
export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 15) +
         Math.random().toString(36).substring(2, 15);
};

// Função para obter todas as ofertas ativas de todos os produtos ativos
export const getAllActiveOffers = (products: Product[]): Offer[] => {
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
};

// Função para encontrar uma oferta por ID
export const findOfferById = (products: Product[], offerId: string): Offer | undefined => {
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
  return undefined;
};

// Dados iniciais de exemplo
export const initialProducts: Product[] = [
  {
    id: "prod_1",
    name: "Potencia Azul",
    description: "Produto para aumento de desempenho",
    active: true,
    offers: [
      {
        id: "offer_1_1",
        name: "Tratamento 30 dias",
        description: "Tratamento para 30 dias",
        price: 197,
        variation: "gel",
        gelQuantity: 1,
        capsulasQuantity: 0,
        stock: 100,
        active: true,
        inUse: false
      },
      {
        id: "offer_1_2",
        name: "Tratamento 60 dias",
        description: "Tratamento para 60 dias",
        price: 297,
        variation: "gel",
        gelQuantity: 2,
        capsulasQuantity: 0,
        stock: 75,
        active: true,
        inUse: false
      },
      {
        id: "offer_1_3",
        name: "Tratamento 90 dias",
        description: "Tratamento para 90 dias",
        price: 397,
        variation: "gel",
        gelQuantity: 3,
        capsulasQuantity: 0,
        stock: 50,
        active: true,
        inUse: false
      },
      {
        id: "offer_1_4",
        name: "Tratamento 30 dias",
        description: "Tratamento para 30 dias em cápsulas",
        price: 197,
        variation: "capsulas",
        gelQuantity: 0,
        capsulasQuantity: 1,
        stock: 100,
        active: true,
        inUse: false
      },
      {
        id: "offer_1_5",
        name: "Tratamento 60 dias",
        description: "Tratamento para 60 dias em cápsulas",
        price: 297,
        variation: "capsulas",
        gelQuantity: 0,
        capsulasQuantity: 2,
        stock: 75,
        active: true,
        inUse: false
      },
      {
        id: "offer_1_6",
        name: "Tratamento 90 dias",
        description: "Tratamento para 90 dias em cápsulas",
        price: 397,
        variation: "capsulas",
        gelQuantity: 0,
        capsulasQuantity: 3,
        stock: 50,
        active: true,
        inUse: false
      },
      {
        id: "offer_1_7",
        name: "Kit Completo 30 dias",
        description: "Tratamento completo com gel e cápsulas para 30 dias",
        price: 347,
        variation: "gel", // A variação principal é gel, mas inclui ambos
        gelQuantity: 1,
        capsulasQuantity: 1,
        stock: 50,
        active: true,
        inUse: false
      }
    ]
  }
];
