# Arquitectura del Sistema - KambioP2P v3

## Visión General

KambioP2P es una plataforma P2P de intercambio de divisas construida con arquitectura serverless en AWS.

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND (Next.js)                       │
│                    Hosted en S3 Static Website                   │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         │ HTTPS
                         │
┌────────────────────────▼────────────────────────────────────────┐
│                      API Gateway (REST)                          │
└─────┬──────────┬──────────┬──────────┬────────────────────────┘
      │          │          │          │
      │          │          │          │
┌─────▼───┐ ┌───▼────┐ ┌──▼─────┐ ┌──▼────────┐
│ Usuarios│ │ Mercado│ │ Trans- │ │ Disputas  │
│ Lambda  │ │ Lambda │ │acciones│ │  Lambda   │
│         │ │        │ │ Lambda │ │           │
└─────┬───┘ └───┬────┘ └──┬─────┘ └──┬────────┘
      │         │          │          │
      │         │          │          │
┌─────▼─────────▼──────────▼──────────▼──────────────────────────┐
│                    DynamoDB Tables                               │
│  - Users          - Offers        - Trades    - Disputes        │
│  - Profiles       - ExternalRates - BankAccounts                │
│  - Reputation                                                    │
└──────────────────────────────────────────────────────────────────┘
```

## Componentes Principales

### Frontend (Next.js + React)

**Tecnologías:**
- Next.js 14 con App Router
- TypeScript
- Tailwind CSS
- Axios para HTTP requests

**Páginas:**
1. **Landing Page** (`/`): Calculadora de ahorro y presentación
2. **Registro** (`/register`): Registro multi-paso (2 pasos para móvil)
3. **Login** (`/login`): Autenticación de usuarios
4. **Marketplace** (`/marketplace`): Lista de ofertas en tiempo real
5. **Trade** (`/trade/[id]`): Gestión de transacciones individuales
6. **Rating** (`/rating/[id]`): Calificación post-transacción
7. **Profile** (`/profile`): Perfil de usuario y cuentas bancarias

**Características:**
- Responsive design (mobile-first)
- Actualización automática del marketplace cada 10 segundos
- Estado local con React hooks
- Validación de formularios
- Manejo de errores

### Backend (Python + Lambda + API Gateway)

#### 1. Microservicio de Usuarios

**Funciones Lambda:**
- `register`: Registro de nuevos usuarios
- `get_profile`: Obtención de perfil y reputación
- `update_reputation`: Actualización de puntuación

**Tablas DynamoDB:**
- `Users`: Credenciales y estado
- `Profiles`: Información personal
- `Reputation`: Puntuación y estadísticas

**Índices:**
- EmailIndex en Users (para login rápido)

#### 2. Microservicio de Mercado

**Funciones Lambda:**
- `get_offers`: Lista ofertas con filtros
- `create_offer`: Publica nueva oferta
- `delete_offer`: Cancela oferta
- `get_market_rates`: Tasas bancarias para calculadora

**Tablas DynamoDB:**
- `Offers`: Ofertas activas y históricas
- `ExternalRates`: Tasas bancarias

**Índices:**
- StatusIndex en Offers (para queries eficientes)

#### 3. Microservicio de Transacciones

**Funciones Lambda:**
- `initiate_trade`: Crea contrato de intercambio
- `confirm_deposit`: Confirma envío de fondos
- `release_funds`: Libera fondos del escrow
- `get_bank_accounts`: Lista cuentas bancarias
- `add_bank_account`: Agrega cuenta bancaria

**Tablas DynamoDB:**
- `Trades`: Transacciones y estado de escrow
- `BankAccounts`: Cuentas bancarias vinculadas

**Índices:**
- BuyerIndex y SellerIndex en Trades
- UserIndex en BankAccounts

#### 4. Microservicio de Disputas

**Funciones Lambda:**
- `open_dispute`: Abre ticket de soporte
- `get_dispute`: Consulta estado
- `resolve_dispute`: Mediador resuelve caso
- `list_disputes`: Lista para panel de soporte

**Tablas DynamoDB:**
- `Disputes`: Tickets de soporte y resoluciones

**Índices:**
- TradeIndex y StatusIndex en Disputes

## Flujo de Datos Principal

### 1. Registro de Usuario

```
Usuario → Frontend → API Gateway → Lambda (Usuarios)
                                    ↓
                            DynamoDB (Users + Profiles + Reputation)
                                    ↓
                            Response con user_id
```

### 2. Crear Oferta

```
Usuario → Marketplace → API Gateway → Lambda (Mercado)
                                      ↓
                              Validar fondos
                              ↓
                              DynamoDB (Offers)
                              ↓
                              Status: OPEN
```

### 3. Aceptar Oferta y Realizar Trade

```
Buyer acepta oferta
    ↓
API Gateway → Lambda (Transacciones)
    ↓
Crear Trade con escrow_status: INITIATED
    ↓
Buyer confirma depósito
    ↓
escrow_status: FUNDS_IN_CUSTODY (cancelación bloqueada)
    ↓
Seller libera fondos
    ↓
escrow_status: COMPLETED
    ↓
Solicitar calificación (1-5 estrellas)
    ↓
Lambda (Usuarios) → Actualizar reputación
```

### 4. Flujo de Disputa

```
15+ minutos sin confirmación
    ↓
Usuario reporta incidencia
    ↓
API Gateway → Lambda (Disputas)
    ↓
Crear Dispute (status: PENDING)
    ↓
Congelar liberación de fondos
    ↓
Notificar agente de soporte
    ↓
Mediador revisa evidencia
    ↓
Resolución: REFUND o RELEASE
    ↓
Lambda (Transacciones) → Ejecutar acción
```

## Seguridad

### Actual (Desarrollo)
- Hash SHA-256 para passwords
- CORS habilitado
- Validación básica de entrada
- Estado de usuario en DynamoDB

### Recomendaciones para Producción
- Implementar JWT para autenticación
- Usar AWS Cognito para gestión de usuarios
- Bcrypt para hashing de passwords
- Rate limiting en API Gateway
- WAF (Web Application Firewall)
- Encryption at rest en DynamoDB
- VPC para Lambdas
- Secrets Manager para credenciales

## Escalabilidad

### DynamoDB
- Modo PAY_PER_REQUEST: Escala automáticamente
- GSI (Global Secondary Indexes) para queries eficientes
- Sin límite de almacenamiento

### Lambda
- Auto-scaling integrado
- Concurrencia configurable
- Cold start < 1s con Python

### S3
- CDN con CloudFront (recomendado)
- Hosting estático ilimitado
- Alta disponibilidad

## Monitoreo y Logs

### CloudWatch
- Logs automáticos de todas las Lambdas
- Métricas de API Gateway
- Alarmas configurables

### X-Ray (Recomendado)
- Tracing distribuido
- Análisis de rendimiento
- Detección de cuellos de botella

## Costos Estimados (Tier Gratuito)

### Lambda
- 1M requests/mes gratis
- 400,000 GB-segundos gratis

### API Gateway
- 1M requests/mes gratis (primer año)

### DynamoDB
- 25 GB almacenamiento gratis
- 25 unidades de lectura/escritura gratis

### S3
- 5 GB almacenamiento gratis
- 20,000 GET requests gratis

**Total estimado:** $0-5/mes en desarrollo con tráfico bajo

## Mejoras Futuras

1. **Notificaciones en Tiempo Real**
   - WebSockets con API Gateway
   - Notificaciones push

2. **Integración Bancaria Real**
   - APIs de BCP, Interbank, BBVA, Scotiabank
   - Verificación automática de depósitos

3. **KYC/AML**
   - Verificación de identidad
   - Límites de transacción
   - Cumplimiento regulatorio

4. **Panel de Administración**
   - Dashboard para mediadores
   - Estadísticas en tiempo real
   - Gestión de usuarios

5. **Mobile App**
   - React Native
   - Push notifications
   - Biometría

6. **Analytics**
   - Google Analytics
   - Métricas de conversión
   - A/B testing
