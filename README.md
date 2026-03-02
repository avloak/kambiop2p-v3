# KambioP2P v3 - Plataforma P2P de Intercambio de Divisas

Plataforma digital P2P que facilita el intercambio de dólares y soles en el mercado peruano.

## Arquitectura

### Backend
- **4 Microservicios Python** desplegados en AWS Lambda
- **API Gateway** para endpoints REST
- **DynamoDB** para persistencia de datos
- **Serverless Framework** para gestionar deployment

#### Microservicios:
1. **Usuarios**: Autenticación, perfiles y reputación
2. **Mercado**: Ofertas y tipos de cambio
3. **Transacciones**: Gestión de trades y escrow
4. **Disputas**: Sistema de reportes y mediación

### Frontend
- **Next.js 14** con React
- **Responsive Design** para móviles y desktop
- **Desplegado en AWS S3** con hosting estático
- **Actualización en tiempo real** del marketplace

## Deployment

### Requisitos previos
- Node.js 18+
- Python 3.11+
- AWS CLI configurado
- Serverless Framework instalado: `npm install -g serverless`

### Backend (cada microservicio)
```bash
cd backend/usuarios  # o mercado, transacciones, disputas
npm install
serverless deploy --stage dev
```

### Frontend
```bash
cd frontend
npm install
npm run build
serverless deploy --stage dev
```

## Variables de Entorno

Cada microservicio requiere configurar variables de entorno en el archivo `.env` respectivo.

## Estructura del Proyecto

```
kambiop2p-v3/
├── backend/
│   ├── usuarios/
│   ├── mercado/
│   ├── transacciones/
│   └── disputas/
├── frontend/
└── README.md
```

## Funcionalidades Principales

1. **Landing Page con Calculadora de Ahorro**: Compara automáticamente con tasas bancarias
2. **Marketplace P2P en Tiempo Real**: Visualiza y publica ofertas
3. **Sistema Escrow**: Fondos bloqueados hasta confirmación mutua
4. **Multi-Banco**: BCP, Interbank, BBVA, Scotiabank
5. **Sistema de Reputación**: Valoración de 1-5 estrellas
6. **Soporte y Disputas**: Reportes automáticos tras 15 minutos sin confirmación
