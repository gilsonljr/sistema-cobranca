# Correios API Integration

This document describes the integration with the Correios API for tracking packages.

## Overview

The Sistema de Cobrança Inteligente integrates with the Correios API to track packages and provide real-time updates on package status. This integration allows the system to:

1. Track individual packages by their tracking code
2. Track multiple packages in batch
3. Detect critical status updates that require attention
4. Update the `atualizacaoCorreios` field with the exact date and time of tracking updates

## Configuration

### Environment Variables

The following environment variables are used for the Correios API integration:

- `CORREIOS_API_URL`: The base URL for the Correios API (default: https://api.correios.com.br)
- `CORREIOS_API_KEY`: The API key for authenticating with the Correios API

These variables should be set in the `.env` file or in the environment where the application is running.

### Docker Configuration

The docker-compose files have been updated to include these environment variables:

```yaml
# docker-compose.yml
environment:
  - CORREIOS_API_URL=https://api.correios.com.br
  - CORREIOS_API_KEY=your-correios-api-key-here
```

```yaml
# docker-compose.prod.yml
environment:
  - CORREIOS_API_URL=${CORREIOS_API_URL:-https://api.correios.com.br}
  - CORREIOS_API_KEY=${CORREIOS_API_KEY:-change-this-in-production}
```

## API Endpoints

The following API endpoints are available for tracking packages:

### Track a Single Package

```
GET /api/v1/tracking/{tracking_code}
```

**Response:**

```json
{
  "codigo": "LX002249507BR",
  "eventos": [
    {
      "data": "24/10/2023",
      "hora": "10:40",
      "local": "CURITIBA/PR",
      "status": "Objeto entregue ao destinatário",
      "subStatus": ""
    },
    {
      "data": "23/10/2023",
      "hora": "15:37",
      "local": "CURITIBA/PR",
      "status": "Objeto saiu para entrega ao destinatário",
      "subStatus": ""
    }
  ],
  "entregue": true,
  "servico": "SEDEX"
}
```

### Track Multiple Packages

```
POST /api/v1/tracking/batch
```

**Request:**

```json
{
  "tracking_codes": ["LX002249507BR", "LX002249508BR"]
}
```

**Response:**

```json
{
  "LX002249507BR": {
    "codigo": "LX002249507BR",
    "eventos": [
      {
        "data": "24/10/2023",
        "hora": "10:40",
        "local": "CURITIBA/PR",
        "status": "Objeto entregue ao destinatário",
        "subStatus": ""
      }
    ],
    "entregue": true,
    "servico": "SEDEX"
  },
  "LX002249508BR": {
    "codigo": "LX002249508BR",
    "eventos": [
      {
        "data": "23/10/2023",
        "hora": "15:37",
        "local": "CURITIBA/PR",
        "status": "Objeto saiu para entrega ao destinatário",
        "subStatus": ""
      }
    ],
    "entregue": false,
    "servico": "PAC"
  }
}
```

### Check Critical Packages

```
GET /api/v1/tracking/check-critical?tracking_codes=LX002249507BR&tracking_codes=LX002249508BR
```

**Response:**

```json
[
  {
    "codigo": "LX002249508BR",
    "eventos": [
      {
        "data": "23/10/2023",
        "hora": "15:37",
        "local": "CURITIBA/PR",
        "status": "Tentativa de entrega não efetuada",
        "subStatus": "Endereço incorreto"
      }
    ],
    "entregue": false,
    "servico": "PAC"
  }
]
```

## Correios Status Codes

The Correios API returns various status codes for package tracking. Here are some of the common status codes:

1. **Objeto postado** - The package has been posted
2. **Objeto em trânsito - por favor aguarde** - The package is in transit
3. **Objeto saiu para entrega ao destinatário** - The package is out for delivery
4. **Objeto entregue ao destinatário** - The package has been delivered
5. **Tentativa de entrega não efetuada** - Delivery attempt was unsuccessful
6. **Objeto aguardando retirada no endereço indicado** - The package is waiting to be picked up
7. **Objeto devolvido ao remetente** - The package has been returned to sender
8. **Objeto em processo de desembaraço** - The package is in the customs clearance process
9. **Objeto roubado** - The package has been stolen
10. **Objeto extraviado** - The package has been lost

### Critical Status Codes

The following status codes are considered critical and require attention:

1. **objeto devolvido** - The package has been returned
2. **endereço incorreto** - Incorrect address
3. **objeto aguardando retirada** - The package is waiting to be picked up
4. **tentativa de entrega** - Delivery attempt
5. **objeto roubado** - The package has been stolen
6. **objeto extraviado** - The package has been lost
7. **recusado** - The package has been refused
8. **entrega não efetuada** - Delivery was not completed

## Fallback Mechanism

If the Correios API is unavailable or returns an error, the system will use a fallback mechanism to generate mock tracking data. This ensures that the system can continue to function even if the Correios API is temporarily unavailable.

The mock data is generated based on the tracking code and includes realistic status updates and timestamps.

## Frontend Integration

The frontend has been updated to use the new backend API endpoints for tracking packages. The `CorreiosService` class now makes HTTP requests to the backend API instead of using mock data directly.

The frontend also includes error handling for API failures and will fall back to mock data if the API is unavailable.

## Updating the `atualizacaoCorreios` Field

When a tracking status is updated, the system will update the `atualizacaoCorreios` field with the exact date and time of the update in the format `dd/mm/yyyy - hh:mm:ss` in São Paulo time.

This field is used to display the last update time in the tracking history section and in the orders table.

## Future Improvements

1. **Webhook Integration**: Implement webhook integration with Correios to receive real-time updates instead of polling the API
2. **Caching**: Implement caching for tracking results to reduce API calls and improve performance
3. **Rate Limiting**: Implement rate limiting to avoid exceeding Correios API limits
4. **Error Reporting**: Implement more detailed error reporting for tracking failures
5. **Tracking History**: Store tracking history in the database for historical analysis
