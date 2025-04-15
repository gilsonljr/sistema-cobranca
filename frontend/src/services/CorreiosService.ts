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
  servico?: string;
}

export interface StatusUpdateResult {
  orderId: string;  // Changed from number to string to match Order.idVenda
  trackingCode: string;
  newStatus: string;
  previousStatus?: string;
  isCritical: boolean;
  timestamp: string;
  formattedTimestamp?: string;  // Formatted timestamp for São Paulo timezone
  location?: string;
  estimatedDelivery?: string;
  status: string; // Add status property for compatibility
}

class CorreiosService {
  private apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';

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
      // Obter o token de autenticação
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Usuário não autenticado');
      }

      // Configurar headers com o token
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      // Fazer a chamada à API
      const response = await axios.get(
        `${this.apiUrl}/tracking/${codigoRastreio}`,
        { headers }
      );

      // Verificar se a resposta foi bem-sucedida
      if (response.status !== 200) {
        throw new Error(`Erro ao rastrear encomenda: ${response.statusText}`);
      }

      return response.data;
    } catch (error) {
      console.error('Erro ao rastrear encomenda:', error);

      // Se for um erro de autenticação, redirecionar para login
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        window.location.href = '/login';
        throw new Error('Sessão expirada. Por favor, faça login novamente.');
      }

      // Se for um erro de conexão ou a API estiver indisponível, usar dados simulados
      if (axios.isAxiosError(error) && !error.response) {
        console.warn('API indisponível, usando dados simulados');
        return this.mockTrackingResponse(codigoRastreio);
      }

      throw new Error('Não foi possível rastrear a encomenda. Tente novamente mais tarde.');
    }
  }

  /**
   * Formata a data e hora no formato dd/mm/yyyy - hh:mm:ss (São Paulo time)
   */
  private formatDateTime(date: Date): string {
    // Formatar para o fuso horário de São Paulo (GMT-3)
    const options: Intl.DateTimeFormatOptions = {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
      timeZone: 'America/Sao_Paulo'
    };

    const formatter = new Intl.DateTimeFormat('pt-BR', options);
    const parts = formatter.formatToParts(date);

    const day = parts.find(part => part.type === 'day')?.value || '01';
    const month = parts.find(part => part.type === 'month')?.value || '01';
    const year = parts.find(part => part.type === 'year')?.value || '2023';
    const hour = parts.find(part => part.type === 'hour')?.value || '00';
    const minute = parts.find(part => part.type === 'minute')?.value || '00';
    const second = parts.find(part => part.type === 'second')?.value || '00';

    return `${day}/${month}/${year} - ${hour}:${minute}:${second}`;
  }

  /**
   * Verifica atualizações de múltiplos códigos de rastreio
   */
  public async verificarAtualizacoes(
    pedidos: { idVenda: string; codigoRastreio: string; statusCorreios?: string }[]
  ): Promise<StatusUpdateResult[]> {
    const resultados: StatusUpdateResult[] = [];
    const pedidosComRastreio = pedidos.filter(p => p.codigoRastreio);

    if (pedidosComRastreio.length === 0) {
      return resultados;
    }

    try {
      // Obter o token de autenticação
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Usuário não autenticado');
      }

      // Configurar headers com o token
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      // Extrair apenas os códigos de rastreio para a chamada em lote
      const trackingCodes = pedidosComRastreio.map(p => p.codigoRastreio);

      // Fazer a chamada à API em lote
      const response = await axios.post(
        `${this.apiUrl}/tracking/batch`,
        { tracking_codes: trackingCodes },
        { headers }
      );

      // Verificar se a resposta foi bem-sucedida
      if (response.status !== 200) {
        throw new Error(`Erro ao verificar atualizações: ${response.statusText}`);
      }

      // Processar os resultados
      const batchResults = response.data;

      // Para cada pedido, verificar se houve atualização
      for (const pedido of pedidosComRastreio) {
        const infoRastreio = batchResults[pedido.codigoRastreio];

        if (infoRastreio && infoRastreio.eventos && infoRastreio.eventos.length > 0) {
          const ultimoEvento = infoRastreio.eventos[0];
          const novoStatus = ultimoEvento.status;

          // Se o status for diferente do atual, registra a atualização
          if (novoStatus !== pedido.statusCorreios) {
            // Criar timestamp formatado para São Paulo
            const now = new Date();
            const formattedTimestamp = this.formatDateTime(now);

            resultados.push({
              orderId: pedido.idVenda,
              trackingCode: pedido.codigoRastreio,
              newStatus: novoStatus,
              previousStatus: pedido.statusCorreios,
              isCritical: this.isStatusCritical(novoStatus),
              timestamp: now.toISOString(),
              formattedTimestamp: formattedTimestamp,
              location: ultimoEvento.local,
              status: novoStatus // Add status property for compatibility
            });
          }
        }
      }
    } catch (error) {
      console.error('Erro ao verificar atualizações em lote:', error);

      // Se for um erro de autenticação, redirecionar para login
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        window.location.href = '/login';
        throw new Error('Sessão expirada. Por favor, faça login novamente.');
      }

      // Se for um erro de conexão ou a API estiver indisponível, usar o método individual
      if (axios.isAxiosError(error) && !error.response) {
        console.warn('API em lote indisponível, verificando individualmente');

        // Verificar cada pedido individualmente
        for (const pedido of pedidosComRastreio) {
          try {
            const infoRastreio = await this.rastrearEncomenda(pedido.codigoRastreio);

            if (infoRastreio.eventos && infoRastreio.eventos.length > 0) {
              const ultimoEvento = infoRastreio.eventos[0];
              const novoStatus = ultimoEvento.status;

              // Se o status for diferente do atual, registra a atualização
              if (novoStatus !== pedido.statusCorreios) {
                // Criar timestamp formatado para São Paulo
                const now = new Date();
                const formattedTimestamp = this.formatDateTime(now);

                resultados.push({
                  orderId: pedido.idVenda,
                  trackingCode: pedido.codigoRastreio,
                  newStatus: novoStatus,
                  previousStatus: pedido.statusCorreios,
                  isCritical: this.isStatusCritical(novoStatus),
                  timestamp: now.toISOString(),
                  formattedTimestamp: formattedTimestamp,
                  location: ultimoEvento.local,
                  status: novoStatus // Add status property for compatibility
                });
              }
            }
          } catch (error) {
            console.error(`Erro ao verificar rastreio ${pedido.codigoRastreio}:`, error);
            // Continua para o próximo pedido mesmo se houver erro
          }
        }
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

    // Generate a random service type
    const servicosTipos = ['SEDEX', 'PAC', 'SEDEX 10', 'SEDEX 12', 'SEDEX Hoje'];
    const servicoAleatorio = servicosTipos[Math.floor(Math.random() * servicosTipos.length)];

    return {
      codigo: codigoRastreio,
      eventos,
      entregue,
      servico: servicoAleatorio
    };
  }
}

export default new CorreiosService();