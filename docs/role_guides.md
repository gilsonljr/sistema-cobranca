# Guias por Perfil de Usuário

## Guia para Administradores

Como administrador do Sistema de Cobrança Inteligente, você tem acesso completo a todas as funcionalidades. Este guia ajudará você a gerenciar o sistema de forma eficiente.

### Gerenciamento de Usuários

#### Criando Novos Usuários

1. Acesse "Configurações" > "Usuários".
2. Clique em "Novo Usuário".
3. Preencha os campos obrigatórios:
   - Nome Completo
   - E-mail
   - Senha
   - Função (Admin, Supervisor, Operador, Vendedor)
4. Clique em "Salvar".

#### Editando Usuários Existentes

1. Acesse "Configurações" > "Usuários".
2. Localize o usuário na lista.
3. Clique no ícone de edição (lápis).
4. Modifique os campos necessários.
5. Clique em "Salvar".

#### Desativando Usuários

1. Acesse "Configurações" > "Usuários".
2. Localize o usuário na lista.
3. Clique no ícone de desativação (círculo com barra).
4. Confirme a desativação.

### Configurações do Sistema

#### Configurando Webhook

1. Acesse "Configurações" > "Webhook".
2. Insira a URL do webhook.
3. Configure o segredo compartilhado.
4. Selecione os eventos que acionarão o webhook.
5. Clique em "Salvar".

#### Importação de Dados

1. Acesse "Configurações" > "Importar".
2. Selecione o tipo de dados a importar.
3. Faça upload do arquivo CSV.
4. Mapeie os campos.
5. Clique em "Importar".

### Monitoramento do Sistema

1. Acesse o Dashboard principal.
2. Verifique as estatísticas gerais:
   - Total de pedidos
   - Valor total
   - Taxa de pagamento
   - Distribuição por status
3. Identifique possíveis problemas:
   - Pedidos com status crítico de rastreamento
   - Pedidos duplicados
   - Operadores com muitos pedidos pendentes

## Guia para Supervisores

Como supervisor, você é responsável por gerenciar operações diárias e garantir que os pedidos sejam processados corretamente.

### Gerenciamento de Pedidos

#### Atribuindo Pedidos a Operadores

1. Acesse a lista de pedidos.
2. Selecione um ou mais pedidos.
3. Clique em "Atribuir".
4. Selecione o operador.
5. Clique em "Confirmar".

#### Gerenciando Pedidos Duplicados

1. Acesse "Duplicados" no menu lateral.
2. Revise os pedidos identificados como possíveis duplicatas.
3. Para cada par de pedidos:
   - Compare os detalhes
   - Decida qual manter como principal
   - Marque o outro como duplicata ou exclua-o

### Relatórios e Análises

1. Acesse "Relatórios" no menu lateral.
2. Gere relatórios para análise:
   - Desempenho de vendedores
   - Desempenho de operadores
   - Análise de pagamentos
   - Tendências de vendas
3. Exporte os relatórios para apresentação.

## Guia para Operadores (Coletores)

Como operador, você é responsável por gerenciar os pagamentos e atualizações de status dos pedidos atribuídos a você.

### Gerenciando Seus Pedidos

1. Ao fazer login, você verá automaticamente apenas os pedidos atribuídos a você.
2. Use os filtros para organizar seus pedidos:
   - Pendentes
   - Parcialmente pagos
   - Pagos
   - Com status crítico de rastreamento

### Registrando Pagamentos

1. Localize o pedido na sua lista.
2. Clique no ícone de pagamento (cifrão).
3. Insira o valor recebido.
4. Adicione observações relevantes.
5. Clique em "Registrar Pagamento".

### Atualizando Status de Pedidos

1. Localize o pedido na sua lista.
2. Clique no ícone de edição (lápis).
3. Atualize o status do pedido.
4. Adicione observações, se necessário.
5. Clique em "Salvar".

### Monitorando Rastreamentos

1. Acesse "Rastreamento" no menu lateral.
2. Verifique o status atual das encomendas.
3. Identifique e priorize pedidos com status crítico.
4. Entre em contato com os clientes quando necessário.

## Guia para Vendedores

Como vendedor, você pode acompanhar seus pedidos e verificar o status de pagamento e rastreamento.

### Visualizando Seus Pedidos

1. Ao fazer login, você verá automaticamente apenas os pedidos que você criou.
2. Use os filtros para organizar seus pedidos:
   - Pendentes
   - Parcialmente pagos
   - Pagos
   - Com status crítico de rastreamento

### Acompanhando Rastreamentos

1. Acesse "Rastreamento" no menu lateral.
2. Verifique o status atual das encomendas.
3. Clique no código de rastreio para ver o histórico completo.

### Verificando Pagamentos

1. Na lista de pedidos, verifique a coluna "Valor Pago".
2. Clique no pedido para ver o histórico detalhado de pagamentos.

### Comunicação com Operadores

Se precisar de informações adicionais sobre um pedido, entre em contato com o operador responsável ou com um supervisor através do sistema de mensagens interno.
