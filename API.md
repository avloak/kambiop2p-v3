# API Reference - KambioP2P v3

## Microservicio de Usuarios

Base URL: `https://[api-id].execute-api.us-east-1.amazonaws.com/dev`

### POST /auth/register

Registra un nuevo usuario en la plataforma.

**Request Body:**
```json
{
  "email": "usuario@example.com",
  "password": "password123",
  "dni": "12345678",
  "full_name": "Juan Pérez García",
  "birth_date": "1990-01-15"
}
```

**Response (201):**
```json
{
  "message": "Usuario registrado exitosamente",
  "user_id": "uuid-here",
  "email": "usuario@example.com"
}
```

### GET /user/profile/{id}

Obtiene el perfil completo de un usuario.

**Response (200):**
```json
{
  "id": "uuid",
  "email": "usuario@example.com",
  "status": "ACTIVE",
  "profile": {
    "full_name": "Juan Pérez García",
    "dni": "12345678",
    "birth_date": "1990-01-15"
  },
  "reputation": {
    "score_avg": 4.8,
    "total_trades": 23
  }
}
```

### PATCH /user/reputation

Actualiza la reputación de un usuario después de una transacción.

**Request Body:**
```json
{
  "user_id": "uuid",
  "rating": 5
}
```

**Response (200):**
```json
{
  "message": "Reputación actualizada",
  "user_id": "uuid",
  "new_score_avg": 4.85,
  "total_trades": 24
}
```

---

## Microservicio de Mercado

Base URL: `https://[api-id].execute-api.us-east-1.amazonaws.com/dev`

### GET /offers

Lista las ofertas activas. Soporta filtros opcionales.

**Query Parameters:**
- `type` (opcional): BUY | SELL
- `currency` (opcional): USD | PEN
- `sort` (opcional): best_rate | created_at

**Response (200):**
```json
{
  "offers": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "type": "SELL",
      "currency": "USD",
      "amount": 500,
      "rate": 3.71,
      "status": "OPEN",
      "created_at": "2026-03-01T10:00:00Z"
    }
  ],
  "count": 1
}
```

### POST /offers/create

Crea una nueva oferta en el marketplace.

**Request Body:**
```json
{
  "user_id": "uuid",
  "type": "SELL",
  "currency": "USD",
  "amount": 500,
  "rate": 3.71
}
```

**Response (201):**
```json
{
  "message": "Oferta creada exitosamente",
  "offer_id": "uuid",
  "type": "SELL",
  "amount": 500,
  "rate": 3.71,
  "status": "OPEN"
}
```

### DELETE /offers/{id}

Cancela una oferta existente.

**Response (200):**
```json
{
  "message": "Oferta cancelada exitosamente",
  "offer_id": "uuid"
}
```

### GET /market/rates

Obtiene los tipos de cambio bancarios para la calculadora de ahorro.

**Response (200):**
```json
{
  "banks": [
    {
      "bank_name": "BCP",
      "buy_rate": 3.72,
      "sell_rate": 3.75,
      "timestamp": "2026-03-01T10:00:00Z"
    }
  ],
  "average": {
    "buy_rate": 3.71,
    "sell_rate": 3.76
  },
  "timestamp": "2026-03-01T10:00:00Z"
}
```

---

## Microservicio de Transacciones

Base URL: `https://[api-id].execute-api.us-east-1.amazonaws.com/dev`

### POST /trades/initiate

Inicia una transacción entre dos usuarios.

**Request Body:**
```json
{
  "offer_id": "uuid",
  "buyer_id": "uuid",
  "seller_id": "uuid",
  "amount_fiat": 500,
  "rate": 3.71
}
```

**Response (201):**
```json
{
  "message": "Trade iniciado exitosamente",
  "trade_id": "uuid",
  "escrow_status": "INITIATED",
  "amount_fiat": 500,
  "rate": 3.71
}
```

### POST /trades/{id}/confirm-deposit

El comprador confirma que ha enviado el dinero.

**Request Body:**
```json
{
  "user_id": "uuid",
  "receipt_url": "https://..."
}
```

**Response (200):**
```json
{
  "message": "Depósito confirmado. Fondos en custodia",
  "trade_id": "uuid",
  "escrow_status": "FUNDS_IN_CUSTODY",
  "cancellation_blocked": true
}
```

### POST /trades/{id}/release-funds

El vendedor libera los fondos después de recibir el pago.

**Request Body:**
```json
{
  "user_id": "uuid",
  "operation_number": "OP123456"
}
```

**Response (200):**
```json
{
  "message": "Fondos liberados exitosamente",
  "trade_id": "uuid",
  "escrow_status": "COMPLETED",
  "operation_number": "OP123456"
}
```

### GET /trades/bank-accounts

Lista las cuentas bancarias de un usuario.

**Query Parameters:**
- `user_id`: UUID del usuario

**Response (200):**
```json
{
  "accounts": [
    {
      "id": "uuid",
      "bank_name": "BCP",
      "account_number": "123-456789-0-12",
      "currency_type": "PEN",
      "created_at": "2026-03-01T10:00:00Z"
    }
  ],
  "count": 1
}
```

### POST /trades/bank-accounts

Agrega una nueva cuenta bancaria.

**Request Body:**
```json
{
  "user_id": "uuid",
  "bank_name": "BCP",
  "account_number": "123-456789-0-12",
  "currency_type": "PEN"
}
```

**Response (201):**
```json
{
  "message": "Cuenta bancaria agregada exitosamente",
  "account_id": "uuid",
  "bank_name": "BCP",
  "currency_type": "PEN"
}
```

---

## Microservicio de Disputas

Base URL: `https://[api-id].execute-api.us-east-1.amazonaws.com/dev`

### POST /disputes/open

Abre una disputa para una transacción.

**Request Body:**
```json
{
  "trade_id": "uuid",
  "reporter_id": "uuid",
  "reason": "El vendedor no respondió después de 20 minutos",
  "evidence_url": "https://..."
}
```

**Response (201):**
```json
{
  "message": "Disputa abierta exitosamente. Un agente revisará el caso",
  "dispute_id": "uuid",
  "trade_id": "uuid",
  "status": "PENDING",
  "escrow_frozen": true
}
```

### GET /disputes/{id}

Obtiene el estado de una disputa.

**Response (200):**
```json
{
  "id": "uuid",
  "trade_id": "uuid",
  "reporter_id": "uuid",
  "reason": "...",
  "evidence_url": "https://...",
  "status": "PENDING",
  "resolution": "",
  "resolved_by": "",
  "created_at": "2026-03-01T10:00:00Z",
  "updated_at": "2026-03-01T10:00:00Z",
  "resolved_at": ""
}
```

### POST /disputes/{id}/resolve

El mediador resuelve una disputa.

**Request Body:**
```json
{
  "mediator_id": "uuid",
  "resolution": "REFUND",
  "notes": "Se confirma que el vendedor no respondió. Fondos devueltos al comprador."
}
```

**Response (200):**
```json
{
  "message": "Disputa resuelta. Fondos devueltos al comprador",
  "dispute_id": "uuid",
  "trade_id": "uuid",
  "resolution": "REFUND",
  "status": "RESOLVED"
}
```

### GET /disputes

Lista todas las disputas (para panel de soporte).

**Query Parameters:**
- `status` (opcional): PENDING | RESOLVED

**Response (200):**
```json
{
  "disputes": [
    {
      "id": "uuid",
      "trade_id": "uuid",
      "reporter_id": "uuid",
      "reason": "...",
      "status": "PENDING",
      "created_at": "2026-03-01T10:00:00Z",
      "resolved_at": ""
    }
  ],
  "count": 1
}
```

---

## Códigos de Error Comunes

- **400 Bad Request**: Datos de entrada inválidos
- **401 Unauthorized**: No autenticado
- **403 Forbidden**: No autorizado para esta acción
- **404 Not Found**: Recurso no encontrado
- **500 Internal Server Error**: Error del servidor

## Headers CORS

Todos los endpoints incluyen los siguientes headers CORS:

```
Access-Control-Allow-Origin: *
Access-Control-Allow-Credentials: true
Access-Control-Allow-Headers: Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token
Access-Control-Allow-Methods: GET,POST,PUT,PATCH,DELETE,OPTIONS
```
