# Sistema de Cobrança Inteligente - Guia do Usuário

## Índice

1. [Introdução](#introdução)
2. [Acessando o Sistema](#acessando-o-sistema)
3. [Visão Geral da Interface](#visão-geral-da-interface)
4. [Gerenciamento de Pedidos](#gerenciamento-de-pedidos)
5. [Rastreamento de Encomendas](#rastreamento-de-encomendas)
6. [Relatórios](#relatórios)
7. [Configurações](#configurações)
8. [Perfis de Usuário](#perfis-de-usuário)
9. [Solução de Problemas](#solução-de-problemas)

## Introdução

O Sistema de Cobrança Inteligente é uma plataforma completa para gerenciamento de pedidos, cobranças e rastreamento de encomendas. Este guia fornece instruções detalhadas sobre como utilizar todas as funcionalidades do sistema.

## Acessando o Sistema

### Login

1. Acesse o sistema através do URL fornecido pelo administrador.
2. Na tela de login, insira seu e-mail e senha.
3. Clique no botão "Entrar".

### Recuperação de Senha

1. Na tela de login, clique em "Esqueceu sua senha?".
2. Insira seu e-mail cadastrado.
3. Clique em "Enviar".
4. Você receberá um e-mail com instruções para redefinir sua senha.

## Visão Geral da Interface

Após fazer login, você verá a interface principal do sistema, que consiste em:

### Barra de Navegação Superior

- **Logo**: Clique para voltar à página inicial.
- **Nome do Usuário**: Exibe seu nome e função.
- **Botão de Logout**: Clique para sair do sistema.

### Menu Lateral

- **Dashboard**: Visão geral dos pedidos e estatísticas.
- **Pedidos**: Lista completa de pedidos.
- **Rastreamento**: Acompanhamento de encomendas.
- **Relatórios**: Geração de relatórios.
- **Duplicados**: Gerenciamento de pedidos duplicados.
- **Configurações**: Opções de configuração do sistema.

### Área Principal

Esta área exibe o conteúdo selecionado no menu lateral.

## Gerenciamento de Pedidos

### Visualizando Pedidos

1. Clique em "Dashboard" no menu lateral.
2. A lista de pedidos será exibida com as seguintes informações:
   - ID do Pedido
   - Cliente
   - Valor Total
   - Valor Pago
   - Status
   - Data de Criação
   - Ações

### Filtrando Pedidos

1. Use os filtros na barra lateral para filtrar pedidos por:
   - Status (Pendente, Pago, Parcialmente Pago, etc.)
   - Data de Recebimento
   - Vendedor
   - Operador

### Criando um Novo Pedido

1. Clique no botão "Novo Pedido".
2. Preencha os campos obrigatórios:
   - Cliente
   - Telefone
   - Endereço
   - Valor Total
   - Vendedor
3. Clique em "Salvar".

### Editando um Pedido

1. Na lista de pedidos, clique no ícone de edição (lápis) do pedido desejado.
2. Modifique os campos necessários.
3. Clique em "Salvar".

### Registrando Pagamentos

1. Na lista de pedidos, clique no ícone de pagamento (cifrão) do pedido desejado.
2. Insira o valor recebido.
3. Adicione observações, se necessário.
4. Clique em "Registrar Pagamento".

## Rastreamento de Encomendas

### Visualizando Status de Rastreamento

1. Clique em "Rastreamento" no menu lateral.
2. A lista de pedidos com códigos de rastreio será exibida.
3. O status atual de cada encomenda será mostrado.

### Atualizando Status de Rastreamento

1. Clique no botão "Atualizar Rastreamentos".
2. O sistema consultará automaticamente os status atualizados.
3. Pedidos com atualizações críticas serão destacados.

### Detalhes de Rastreamento

1. Clique no código de rastreio de um pedido.
2. Uma janela com o histórico completo de rastreamento será exibida.

## Relatórios

### Gerando Relatórios

1. Clique em "Relatórios" no menu lateral.
2. Selecione o tipo de relatório:
   - Vendas por Período
   - Pagamentos Recebidos
   - Pedidos por Status
   - Desempenho de Vendedores
   - Desempenho de Operadores
3. Defina o período desejado.
4. Clique em "Gerar Relatório".

### Exportando Relatórios

1. Após gerar um relatório, clique em "Exportar".
2. Selecione o formato desejado (PDF, Excel, CSV).
3. O arquivo será baixado automaticamente.

## Configurações

### Usuários

#### Visualizando Usuários (Apenas Admin)

1. Clique em "Configurações" no menu lateral.
2. Selecione "Usuários".
3. A lista de usuários será exibida.

#### Criando Novos Usuários (Apenas Admin)

1. Na página de usuários, clique em "Novo Usuário".
2. Preencha os campos obrigatórios:
   - Nome Completo
   - E-mail
   - Senha
   - Função (Admin, Supervisor, Operador, Vendedor)
3. Clique em "Salvar".

#### Editando Usuários (Apenas Admin)

1. Na lista de usuários, clique no ícone de edição (lápis) do usuário desejado.
2. Modifique os campos necessários.
3. Clique em "Salvar".

### Importação de Dados

1. Clique em "Configurações" no menu lateral.
2. Selecione "Importar".
3. Escolha o tipo de dados a importar (Pedidos, Clientes).
4. Faça upload do arquivo CSV.
5. Mapeie os campos, se necessário.
6. Clique em "Importar".

### Webhook

1. Clique em "Configurações" no menu lateral.
2. Selecione "Testar Webhook".
3. Insira os dados de teste.
4. Clique em "Enviar".

## Perfis de Usuário

O sistema possui quatro perfis de usuário, cada um com permissões específicas:

### Admin

- Acesso completo a todas as funcionalidades do sistema.
- Gerenciamento de usuários.
- Configurações avançadas.

### Supervisor

- Visualização de todos os pedidos.
- Criação e edição de pedidos.
- Geração de relatórios.
- Gerenciamento de pedidos duplicados.

### Operador (Coletor)

- Visualização apenas dos pedidos atribuídos.
- Registro de pagamentos.
- Atualização de status de pedidos.

### Vendedor

- Visualização apenas dos próprios pedidos.
- Consulta de status de rastreamento.

## Solução de Problemas

### Problemas de Login

- **Não consigo fazer login**: Verifique se o e-mail e senha estão corretos. Utilize a função "Esqueceu sua senha?" se necessário.
- **Minha conta está bloqueada**: Entre em contato com o administrador do sistema.

### Problemas com Pedidos

- **Não consigo criar um pedido**: Verifique se todos os campos obrigatórios foram preenchidos.
- **Pedido não aparece na lista**: Verifique os filtros aplicados ou atualize a página.

### Problemas de Rastreamento

- **Código de rastreio não atualiza**: Verifique se o código foi inserido corretamente ou se há algum problema com o serviço de rastreamento.
- **Status de rastreio incorreto**: Aguarde algumas horas e tente atualizar novamente.

### Outros Problemas

Para qualquer outro problema não listado aqui, entre em contato com o suporte técnico através do e-mail suporte@sistema.com ou pelo telefone (XX) XXXX-XXXX.
