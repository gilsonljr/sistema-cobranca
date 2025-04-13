import axios from 'axios';
import { Order } from '../types/Order';
import { ApiTrackingUpdate } from '../types/api';

// Definindo os tipos de dados para rastreamento dos Correios
export interface TrackingEvent {
  data: string;
  hora: string;
  local: string;
  status: string;
  subStatus?: string;
}

export interface TrackingInfo {
  codigo: string;
  eventos: TrackingEvent[];
  entregue: boolean;
}

export interface StatusUpdateResult {
  orderId: string;  // Changed from number to string to match Order.idVenda
  trackingCode: string;
  newStatus: string;
  previousStatus?: string;
  isCritical: boolean;
  timestamp: string;
  location?: string;
  estimatedDelivery?: string;
}

class CorreiosService {
  private apiUrl = process.env.REACT_APP_CORREIOS_API_URL || 'https://api.exemplo.com/correios';

  // Status considerados críticos que precisam de atenção
  private criticalStatuses = [
    'objeto devolvido',
    'endereço incorreto',
    'objeto aguardando retirada',
    'tentativa de entrega',
    'objeto roubado',
    'objeto extraviado',
    'recusado',
    'entrega não efetuada'
  ];

  /**
   * Verifica se um status é considerado crítico
   */
  public isStatusCritical(status: string): boolean {
    return this.criticalStatuses.some(criticalStatus =>
      status.toLowerCase().includes(criticalStatus.toLowerCase())
    );
  }

  /**
   * Rastreia uma encomenda pelo código de rastreio
   */
  public async rastrearEncomenda(codigoRastreio: string): Promise<TrackingInfo> {
    try {
      // Em produção, esta seria uma chamada real à API dos Correios
      // Por enquanto, simulamos o retorno para desenvolvimento

      // Simulação - em produção, descomentar o código abaixo
      // const response = await axios.get(`${this.apiUrl}/rastreio/${codigoRastreio}`);
      // return response.data;

      // Simulação para desenvolvimento
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simula delay de rede

      return this.mockTrackingResponse(codigoRastreio);
    } catch (error) {
      console.error('Erro ao rastrear encomenda:', error);
      throw new Error('Não foi possível rastrear a encomenda. Tente novamente mais tarde.');
    }
  }

  /**
   * Verifica atualizações de múltiplos códigos de rastreio
   */
  public async verificarAtualizacoes(
    pedidos: { idVenda: string; codigoRastreio: string; statusCorreios?: string }[]
  ): Promise<StatusUpdateResult[]> {
    const resultados: StatusUpdateResult[] = [];
    const pedidosComRastreio = pedidos.filter(p => p.codigoRastreio);

    for (const pedido of pedidosComRastreio) {
      try {
        const infoRastreio = await this.rastrearEncomenda(pedido.codigoRastreio);

        if (infoRastreio.eventos && infoRastreio.eventos.length > 0) {
          const ultimoEvento = infoRastreio.eventos[0];
          const novoStatus = ultimoEvento.status;

          // Se o status for diferente do atual, registra a atualização
          if (novoStatus !== pedido.statusCorreios) {
            resultados.push({
              orderId: pedido.idVenda,
              trackingCode: pedido.codigoRastreio,
              newStatus: novoStatus,
              previousStatus: pedido.statusCorreios,
              isCritical: this.isStatusCritical(novoStatus),
              timestamp: new Date().toISOString()
            });
          }
        }
      } catch (error) {
        console.error(`Erro ao verificar rastreio ${pedido.codigoRastreio}:`, error);
        // Continua para o próximo pedido mesmo se houver erro
      }
    }

    return resultados;
  }

  /**
   * Gera dados simulados para desenvolvimento
   * Em produção, este método seria removido
   */
  private mockTrackingResponse(codigoRastreio: string): TrackingInfo {
    // Gera um número aleatório para simular diferentes estados
    const rnd = Math.random();
    const entregue = rnd > 0.7;

    // Cria um array de eventos simulados
    const eventos: TrackingEvent[] = [];

    // Adiciona evento mais recente
    if (entregue) {
      eventos.push({
        data: new Date().toLocaleDateString(),
        hora: new Date().toLocaleTimeString(),
        local: 'São Paulo / SP',
        status: 'Objeto entregue ao destinatário'
      });
    } else if (rnd > 0.6) {
      eventos.push({
        data: new Date().toLocaleDateString(),
        hora: new Date().toLocaleTimeString(),
        local: 'São Paulo / SP',
        status: 'Objeto saiu para entrega ao destinatário'
      });
    } else if (rnd > 0.5) {
      eventos.push({
        data: new Date().toLocaleDateString(),
        hora: new Date().toLocaleTimeString(),
        local: 'São Paulo / SP',
        status: 'Objeto em trânsito - por favor aguarde'
      });
    } else if (rnd > 0.4) {
      eventos.push({
        data: new Date().toLocaleDateString(),
        hora: new Date().toLocaleTimeString(),
        local: 'São Paulo / SP',
        status: 'Tentativa de entrega não efetuada',
        subStatus: 'Endereço incorreto'
      });
    } else if (rnd > 0.3) {
      eventos.push({
        data: new Date().toLocaleDateString(),
        hora: new Date().toLocaleTimeString(),
        local: 'São Paulo / SP',
        status: 'Objeto aguardando retirada no endereço indicado',
        subStatus: 'Pode ser retirado em uma agência dos Correios'
      });
    } else if (rnd > 0.2) {
      eventos.push({
        data: new Date().toLocaleDateString(),
        hora: new Date().toLocaleTimeString(),
        local: 'São Paulo / SP',
        status: 'Objeto devolvido ao remetente',
        subStatus: 'Recusado pelo destinatário'
      });
    } else if (rnd > 0.1) {
      eventos.push({
        data: new Date().toLocaleDateString(),
        hora: new Date().toLocaleTimeString(),
        local: 'São Paulo / SP',
        status: 'Objeto em processo de desembaraço',
        subStatus: 'Aguardando pagamento de tributos'
      });
    } else {
      eventos.push({
        data: new Date().toLocaleDateString(),
        hora: new Date().toLocaleTimeString(),
        local: 'Curitiba / PR',
        status: 'Objeto postado'
      });
    }

    // Adiciona alguns eventos históricos simulados
    const dataPassada = new Date();
    dataPassada.setDate(dataPassada.getDate() - 2);

    eventos.push({
      data: dataPassada.toLocaleDateString(),
      hora: dataPassada.toLocaleTimeString(),
      local: 'Curitiba / PR',
      status: 'Objeto postado'
    });

    return {
      codigo: codigoRastreio,
      eventos,
      entregue
    };
  }
}

export default new CorreiosService();