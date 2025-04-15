# Relatórios Avançados

Este diretório contém componentes para relatórios avançados do sistema de cobrança.

## Dependências Necessárias

Para que os relatórios funcionem corretamente, é necessário instalar a biblioteca `recharts` que é usada para criar os gráficos:

```bash
npm install --save recharts @types/recharts
```

## Componentes Disponíveis

1. **AnalyticsDashboard**: Dashboard analítico com visualizações de performance, conversão e operadores.
2. **CashFlowForecast**: Previsão de recebimentos com projeção de fluxo de caixa e alertas de risco.
3. **OperatorPerformance**: Análise detalhada da performance dos operadores.

## Como Usar

Os componentes de relatórios podem ser acessados através da página `AdvancedReportsPage` que está disponível na rota `/advanced-reports`.

Cada relatório recebe os dados de pedidos (orders) como propriedade e pode opcionalmente receber filtros de data.

## Personalização

Os relatórios podem ser personalizados conforme necessário:

- Altere as cores dos gráficos
- Adicione ou remova métricas
- Modifique os cálculos de previsão
- Ajuste os critérios de risco

## Exemplo de Uso

```tsx
import AnalyticsDashboard from './reports/AnalyticsDashboard';

// Em um componente
<AnalyticsDashboard 
  orders={orders} 
  startDate={new Date('2023-01-01')} 
  endDate={new Date('2023-12-31')} 
/>
```
