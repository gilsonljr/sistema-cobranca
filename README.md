# Sistema de Cobrança Inteligente

Sistema web para gerenciamento de cobranças de suplementos com pagamento na entrega.

## Funcionalidades Principais

- Integração via Webhook para recebimento automático de pedidos
- Sistema de permissões com diferentes níveis de acesso
- Interface responsiva e intuitiva
- Controle avançado de pedidos, operadores e supervisores
- Histórico de cobrança detalhado
- Monitoramento de tempo de atualização
- Suporte a pagamentos parciais e negociações
- Sistema de filtragem por status
- Relatórios detalhados e avançados com visualizações gráficas
- Integração com API dos Correios
- Detecção de pedidos duplicados

## Tecnologias Utilizadas

- Backend: Python FastAPI
- Frontend: React + TypeScript
- Banco de Dados: PostgreSQL
- Autenticação: JWT
- Deploy: Docker
- Visualização de Dados: Recharts (opcional, veja [INSTALL_RECHARTS.md](frontend/INSTALL_RECHARTS.md))

## Configuração do Ambiente

### Usando Docker (Recomendado)

1. Clone o repositório
2. Configure as variáveis de ambiente:
   ```bash
   cp .env.example .env
   ```
3. Edite o arquivo `.env` com suas configurações
4. Inicie os serviços com Docker Compose:
   ```bash
   docker-compose up -d
   ```
5. Acesse a aplicação:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

### Instalação Manual

1. Clone o repositório
2. Instale as dependências do backend:
   ```bash
   cd backend
   pip install -r requirements.txt
   ```
3. Configure as variáveis de ambiente no arquivo `.env`
4. Inicie o servidor de desenvolvimento:
   ```bash
   uvicorn app.main:app --reload
   ```
5. Instale as dependências do frontend:
   ```bash
   cd frontend
   npm install
   ```
6. Inicie o servidor de desenvolvimento do frontend:
   ```bash
   npm start
   ```

## Estrutura do Projeto

```
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── core/
│   │   ├── db/
│   │   ├── models/
│   │   ├── schemas/
│   │   └── services/
│   ├── tests/
│   └── alembic/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── contexts/
│   │   ├── hooks/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── types/
│   │   └── utils/
│   └── public/
├── docs/
│   ├── quick_start.md
│   ├── user_guide.md
│   ├── role_guides.md
│   └── technical_docs.md
├── docker-compose.yml
├── docker-compose.prod.yml
└── deploy.sh
```

## Usuários Padrão

Para desenvolvimento e testes, os seguintes usuários estão disponíveis:

- **Admin**:
  - Email: admin@sistema.com
  - Senha: admin123

- **Supervisor**:
  - Email: supervisor@sistema.com
  - Senha: supervisor123

- **Operador**:
  - Email: operador@sistema.com
  - Senha: operador123

- **Vendedor**:
  - Email: vendedor@sistema.com
  - Senha: vendedor123

## Documentação

Consulte a pasta `docs/` para documentação detalhada:

- [Guia Rápido](docs/quick_start.md)
- [Guia do Usuário](docs/user_guide.md)
- [Guias por Perfil](docs/role_guides.md)
- [Documentação Técnica](docs/technical_docs.md)

## Testes

### Frontend

```bash
cd frontend
npm test
```

### Backend

```bash
cd backend
pytest
```

## Contribuição

### Fluxo de Trabalho Git

1. Clone o repositório:
   ```bash
   git clone https://github.com/SEU_USUARIO/sistema-cobranca.git
   cd sistema-cobranca
   ```

2. Crie uma branch para sua feature:
   ```bash
   git checkout -b feature/nome-da-feature
   ```

3. Faça suas alterações e commit:
   ```bash
   git add .
   git commit -m "Descrição das alterações"
   ```

4. Envie para o GitHub:
   ```bash
   git push origin feature/nome-da-feature
   ```

5. Crie um Pull Request no GitHub para revisão.

## Licença

Proprietário - Todos os direitos reservados