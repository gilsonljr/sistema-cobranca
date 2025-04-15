import { OrderStatus } from './api';

// Billing history entry for the frontend
export interface BillingHistoryEntry {
  id?: number;
  amount: number;
  notes?: string;
  date: string;
  createdBy?: string;
}

// Order interface for the frontend
export interface Order {
  // Core fields that map to backend
  id?: number;                          // Backend ID
  idVenda: string;                      // order_number in backend
  dataVenda: string;                    // created_at in backend (formatted)
  cliente: string;                      // customer_name in backend
  telefone: string;                     // customer_phone in backend
  valorVenda: number;                   // total_amount in backend
  valorRecebido: number;                // paid_amount in backend
  situacaoVenda: string;                // status in backend
  codigoRastreio: string;               // tracking_code in backend
  ultimaAtualizacao: string;            // updated_at in backend (formatted)
  vendedor: string;                     // seller_name in backend
  operador: string;                     // collector_name in backend
  historico: string;                    // Formatted billing_history from backend

  // Additional fields for the frontend
  status: string;                       // Legacy field, same as situacaoVenda
  oferta: string;                       // Product/offer description
  statusCorreios: string;               // Tracking status from Correios
  atualizacaoCorreios: string;          // Last tracking update date/time
  statusCritico?: boolean;              // Flag for critical status
  zap: string;                          // Same as telefone, for WhatsApp

  // Address fields (parsed from customer_address in backend)
  estadoDestinatario: string;
  cidadeDestinatario: string;
  ruaDestinatario: string;
  cepDestinatario: string;
  complementoDestinatario: string;
  bairroDestinatario: string;
  numeroEnderecoDestinatario: string;

  // Additional metadata
  dataEstimadaChegada: string;
  codigoAfiliado: string;
  nomeAfiliado: string;
  emailAfiliado: string;
  documentoAfiliado: string;
  dataRecebimento: string;
  dataNegociacao: string;
  formaPagamento: string;
  documentoCliente: string;

  // Partial payment fields
  parcial: boolean;
  pagamentoParcial: number;
  formaPagamentoParcial: string;
  dataPagamentoParcial: string;

  // Raw billing history entries
  billingHistory?: BillingHistoryEntry[];
}

export const parseCSVRow = (row: any): Order => {
  return {
    dataVenda: row['Data Venda'] || '',
    idVenda: row['ID Venda'] || '',
    cliente: row['Cliente'] || '',
    telefone: row['Telefone'] || '',
    oferta: row['Oferta'] || '',
    valorVenda: parseFloat(row['Valor Venda']?.replace('R$', '')?.replace('.', '')?.replace(',', '.') || '0'),
    status: row['Status'] || '',
    situacaoVenda: row['Situação Venda'] || '',
    valorRecebido: parseFloat(row['Valor Recebido']?.replace('R$', '')?.replace('.', '')?.replace(',', '.') || '0'),
    historico: row['Historico'] || '',
    ultimaAtualizacao: row['Ultima Atualização'] || '',
    codigoRastreio: row['Código de Rastreio'] || '',
    statusCorreios: row['Status Correios'] || '',
    atualizacaoCorreios: row['Atualizacao Correios'] || '',
    vendedor: row['Vendedor'] || '',
    operador: row['Operador'] || '',
    zap: row['Zap'] || '',
    estadoDestinatario: row['ESTADO DO DESTINATÁRIO'] || '',
    cidadeDestinatario: row['CIDADE DO DESTINATÁRIO'] || '',
    ruaDestinatario: row['RUA DO DESTINATÁRIO'] || '',
    cepDestinatario: row['CEP DO DESTINATÁRIO'] || '',
    complementoDestinatario: row['COMPLEMENTO DO DESTINATÁRIO'] || '',
    bairroDestinatario: row['BAIRRO DO DESTINATÁRIO'] || '',
    numeroEnderecoDestinatario: row['NÚMERO DO ENDEREÇO DO DESTINATÁRIO'] || '',
    dataEstimadaChegada: row['DATA ESTIMADA DE CHEGADA'] || '',
    codigoAfiliado: row['CÓDIGO DO AFILIADO'] || '',
    nomeAfiliado: row['NOME DO AFILIADO'] || '',
    emailAfiliado: row['E-MAIL DO AFILIADO'] || '',
    documentoAfiliado: row['DOCUMENTO DO AFILIADO'] || '',
    dataRecebimento: row['DATA DE RECEBIMENTO'] || '',
    dataNegociacao: row['Data_Negociacao'] || '',
    formaPagamento: row['FormaPagamento'] || '',
    documentoCliente: row['DOCUMENTO CLIENTE'] || '',
    parcial: row['Parcial']?.toLowerCase() === 'sim' || false,
    pagamentoParcial: parseFloat(row['Pagamento Parcial']?.replace('R$', '')?.replace('.', '')?.replace(',', '.') || '0'),
    formaPagamentoParcial: row['Forma Pagamento Parcial'] || '',
    dataPagamentoParcial: row['Data Pagamento Parcial'] || '',
  };
};