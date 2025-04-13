# Documentação Técnica - Sistema de Cobrança Inteligente

## Arquitetura do Sistema

O Sistema de Cobrança Inteligente é uma aplicação web baseada em uma arquitetura cliente-servidor, com as seguintes tecnologias principais:

### Frontend

- **Framework**: React 18 com TypeScript
- **UI Library**: Material UI 5
- **Gerenciamento de Estado**: React Hooks e Context API
- **Roteamento**: React Router 6
- **Requisições HTTP**: Axios
- **Formatação de Data**: date-fns
- **Formulários**: React Hook Form (para formulários complexos)

### Backend

- **Framework**: FastAPI (Python)
- **ORM**: SQLAlchemy
- **Autenticação**: JWT (JSON Web Tokens)
- **Banco de Dados**: PostgreSQL
- **Migrações**: Alembic
- **Validação de Dados**: Pydantic

### Infraestrutura

- **Servidor Web**: Uvicorn (ASGI)
- **Containerização**: Docker (opcional)
- **CI/CD**: GitHub Actions (opcional)

## Estrutura do Projeto

### Frontend

```
frontend/
├── public/              # Arquivos estáticos
├── src/
│   ├── components/      # Componentes React reutilizáveis
│   ├── contexts/        # Contextos React para gerenciamento de estado
│   ├── hooks/           # Hooks personalizados
│   ├── pages/           # Componentes de página
│   ├── services/        # Serviços para comunicação com a API
│   ├── types/           # Definições de tipos TypeScript
│   ├── utils/           # Funções utilitárias
│   ├── App.tsx          # Componente principal da aplicação
│   └── index.tsx        # Ponto de entrada da aplicação
└── package.json         # Dependências e scripts
```

### Backend

```
backend/
├── alembic/             # Migrações de banco de dados
├── app/
│   ├── api/             # Endpoints da API
│   │   └── v1/          # Versão 1 da API
│   ├── core/            # Configurações e funcionalidades centrais
│   ├── db/              # Configuração do banco de dados
│   ├── models/          # Modelos SQLAlchemy
│   ├── schemas/         # Esquemas Pydantic
│   ├── services/        # Lógica de negócio
│   └── main.py          # Ponto de entrada da aplicação
├── tests/               # Testes automatizados
└── requirements.txt     # Dependências Python
```

## Modelos de Dados

### Usuário (User)

| Campo          | Tipo      | Descrição                                   |
|----------------|-----------|---------------------------------------------|
| id             | Integer   | Identificador único                         |
| email          | String    | E-mail do usuário (único)                   |
| hashed_password| String    | Senha criptografada                         |
| full_name      | String    | Nome completo                               |
| role           | Enum      | Função (admin, supervisor, collector, seller)|
| is_active      | Boolean   | Status de ativação                          |

### Pedido (Order)

| Campo           | Tipo      | Descrição                                   |
|-----------------|-----------|---------------------------------------------|
| id              | Integer   | Identificador único                         |
| order_number    | String    | Número do pedido (único)                    |
| customer_name   | String    | Nome do cliente                             |
| customer_phone  | String    | Telefone do cliente                         |
| customer_address| String    | Endereço do cliente                         |
| total_amount    | Decimal   | Valor total do pedido                       |
| paid_amount     | Decimal   | Valor pago                                  |
| status          | Enum      | Status (pending, partially_paid, paid, etc.)|
| tracking_code   | String    | Código de rastreio                          |
| seller_id       | Integer   | ID do vendedor (FK)                         |
| collector_id    | Integer   | ID do operador (FK)                         |
| is_duplicate    | Boolean   | Indica se é um pedido duplicado             |
| created_at      | DateTime  | Data de criação                             |
| updated_at      | DateTime  | Data de atualização                         |

### Histórico de Pagamento (BillingHistory)

| Campo           | Tipo      | Descrição                                   |
|-----------------|-----------|---------------------------------------------|
| id              | Integer   | Identificador único                         |
| order_id        | Integer   | ID do pedido (FK)                           |
| amount          | Decimal   | Valor do pagamento                          |
| notes           | String    | Observações                                 |
| created_by      | Integer   | ID do usuário que registrou (FK)            |
| created_at      | DateTime  | Data de criação                             |

## API Endpoints

### Autenticação

| Método | Endpoint                      | Descrição                           |
|--------|-------------------------------|-------------------------------------|
| POST   | /api/v1/auth/login            | Login de usuário                    |
| POST   | /api/v1/auth/refresh          | Renovar token de acesso             |
| POST   | /api/v1/auth/password-reset/request | Solicitar redefinição de senha |
| POST   | /api/v1/auth/password-reset/confirm | Confirmar redefinição de senha |

### Usuários

| Método | Endpoint                      | Descrição                           |
|--------|-------------------------------|-------------------------------------|
| GET    | /api/v1/users/                | Listar usuários (admin)             |
| POST   | /api/v1/users/                | Criar usuário (admin)               |
| GET    | /api/v1/users/me              | Obter usuário atual                 |
| GET    | /api/v1/users/{user_id}       | Obter usuário por ID (admin)        |
| PUT    | /api/v1/users/{user_id}       | Atualizar usuário (admin)           |
| DELETE | /api/v1/users/{user_id}       | Excluir usuário (admin)             |

### Pedidos

| Método | Endpoint                      | Descrição                           |
|--------|-------------------------------|-------------------------------------|
| GET    | /api/v1/orders/               | Listar pedidos (filtrados por função)|
| POST   | /api/v1/orders/               | Criar pedido                        |
| GET    | /api/v1/orders/{order_id}     | Obter pedido por ID                 |
| PUT    | /api/v1/orders/{order_id}     | Atualizar pedido                    |
| POST   | /api/v1/orders/{order_id}/billing | Adicionar pagamento             |
| GET    | /api/v1/orders/search         | Buscar pedidos                      |
| GET    | /api/v1/orders/duplicates     | Listar pedidos duplicados           |
| POST   | /api/v1/orders/detect-duplicates | Detectar pedidos duplicados      |
| GET    | /api/v1/orders/statistics     | Obter estatísticas de pedidos       |

### Webhook

| Método | Endpoint                      | Descrição                           |
|--------|-------------------------------|-------------------------------------|
| POST   | /api/v1/webhook/order         | Receber pedido via webhook          |
| GET    | /api/v1/webhook/test          | Testar configuração de webhook      |

## Autenticação e Autorização

O sistema utiliza autenticação baseada em JWT (JSON Web Tokens) com os seguintes componentes:

1. **Access Token**: Token de curta duração (24 horas) para autenticação de requisições.
2. **Refresh Token**: Token de longa duração (7 dias) para renovação do access token.
3. **Controle de Acesso**: Baseado na função do usuário (role-based access control).

### Fluxo de Autenticação

1. O usuário faz login com e-mail e senha.
2. O servidor valida as credenciais e retorna access_token e refresh_token.
3. O cliente armazena os tokens no localStorage.
4. O cliente inclui o access_token no cabeçalho Authorization de cada requisição.
5. Quando o access_token expira, o cliente usa o refresh_token para obter um novo par de tokens.

## Modo de Desenvolvimento

Para facilitar o desenvolvimento sem depender do backend, o frontend possui um "modo mock" que simula as respostas da API usando dados armazenados no localStorage.

Para ativar o modo mock, defina a variável de ambiente:

```
REACT_APP_MOCK_API=true
```

## Testes

### Frontend

Os testes do frontend são implementados usando Jest e React Testing Library. Para executar os testes:

```bash
cd frontend
npm test
```

### Backend

Os testes do backend são implementados usando pytest. Para executar os testes:

```bash
cd backend
pytest
```

## Implantação

### Requisitos de Sistema

- Node.js 16+ (Frontend)
- Python 3.9+ (Backend)
- PostgreSQL 13+ (Banco de Dados)

### Passos para Implantação

1. **Frontend**:
   ```bash
   cd frontend
   npm install
   npm run build
   # Servir os arquivos estáticos gerados na pasta build/
   ```

2. **Backend**:
   ```bash
   cd backend
   pip install -r requirements.txt
   # Configurar variáveis de ambiente
   # Executar migrações do banco de dados
   alembic upgrade head
   # Iniciar o servidor
   uvicorn app.main:app --host 0.0.0.0 --port 8000
   ```

## Variáveis de Ambiente

### Frontend

| Variável               | Descrição                                | Padrão                  |
|------------------------|------------------------------------------|-------------------------|
| REACT_APP_API_URL      | URL da API backend                       | http://localhost:8000   |
| REACT_APP_MOCK_API     | Ativar modo mock                         | false                   |

### Backend

| Variável                      | Descrição                           | Padrão                  |
|-------------------------------|-------------------------------------|-------------------------|
| POSTGRES_SERVER               | Host do PostgreSQL                  | localhost               |
| POSTGRES_USER                 | Usuário do PostgreSQL               | postgres                |
| POSTGRES_PASSWORD             | Senha do PostgreSQL                 | postgres                |
| POSTGRES_DB                   | Nome do banco de dados              | billing_system          |
| SECRET_KEY                    | Chave secreta para tokens JWT       | (gerar uma chave segura)|
| ACCESS_TOKEN_EXPIRE_MINUTES   | Tempo de expiração do access token  | 1440 (24 horas)         |
| REFRESH_TOKEN_EXPIRE_MINUTES  | Tempo de expiração do refresh token | 10080 (7 dias)          |
| WEBHOOK_SECRET                | Chave secreta para webhooks         | (gerar uma chave segura)|
| CORS_ORIGINS                  | Origens permitidas para CORS        | ["http://localhost:3000"]|
