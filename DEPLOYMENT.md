# Guía de Deployment - KambioP2P v3

## Prerrequisitos

1. **AWS Account** configurado con el rol `LabRole`
2. **Node.js 18+** instalado
3. **Python 3.11+** instalado
4. **AWS CLI** configurado con credenciales
5. **Serverless Framework** instalado globalmente:
   ```bash
   npm install -g serverless
   ```

## Deployment del Backend

Cada microservicio debe desplegarse individualmente. El proceso es el mismo para todos.

### 1. Microservicio de Usuarios

```bash
cd backend/usuarios
npm install
serverless deploy --stage dev
```

Anota el endpoint de API Gateway que se genera (lo necesitarás para el frontend).

### 2. Microservicio de Mercado

```bash
cd backend/mercado
npm install
serverless deploy --stage dev
```

### 3. Microservicio de Transacciones

```bash
cd backend/transacciones
npm install
serverless deploy --stage dev
```

### 4. Microservicio de Disputas

```bash
cd backend/disputas
npm install
serverless deploy --stage dev
```

## Deployment del Frontend

### 1. Configurar Variables de Entorno

Crea el archivo `.env.local` en el directorio `frontend/`:

```bash
cd frontend
cp .env.example .env.local
```

Edita `.env.local` y reemplaza las URLs con los endpoints de API Gateway generados en el paso anterior:

```
NEXT_PUBLIC_API_USUARIOS=https://[tu-api-id].execute-api.us-east-1.amazonaws.com/dev
NEXT_PUBLIC_API_MERCADO=https://[tu-api-id].execute-api.us-east-1.amazonaws.com/dev
NEXT_PUBLIC_API_TRANSACCIONES=https://[tu-api-id].execute-api.us-east-1.amazonaws.com/dev
NEXT_PUBLIC_API_DISPUTAS=https://[tu-api-id].execute-api.us-east-1.amazonaws.com/dev
```

### 2. Instalar Dependencias

```bash
npm install
```

### 3. Build de la Aplicación

```bash
npm run build
```

Esto genera los archivos estáticos en el directorio `out/`.

### 4. Deploy a S3

Primero instala las dependencias de deployment:

```bash
npm install --save-dev serverless serverless-s3-sync
```

Luego despliega:

```bash
serverless deploy --stage dev
```

El comando mostrará la URL de tu sitio web en S3.

## Verificación del Deployment

### Backend

Para cada microservicio, verifica que los endpoints funcionen:

```bash
# Test registro de usuario
curl -X POST https://[api-usuarios-url]/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "dni": "12345678",
    "full_name": "Test User",
    "birth_date": "1990-01-01"
  }'

# Test listado de ofertas
curl https://[api-mercado-url]/offers
```

### Frontend

Abre la URL de S3 en tu navegador y verifica que la aplicación cargue correctamente.

## Troubleshooting

### Error: "Role LabRole does not exist"

Si estás en AWS Academy, asegúrate de que tu sesión esté activa. El rol LabRole se crea automáticamente cuando inicias el laboratorio.

### Error: CORS en el Frontend

Verifica que todos los handlers de Lambda incluyan los headers CORS correctos (ya están implementados en el código).

### Error: DynamoDB Tables not found

Las tablas se crean automáticamente con el deployment. Si hay errores, verifica los logs de CloudFormation en la consola de AWS.

## Comandos Útiles

### Ver logs de una función Lambda

```bash
serverless logs -f nombreFuncion --stage dev
```

### Eliminar un deployment

```bash
serverless remove --stage dev
```

### Redeploy rápido de una función específica

```bash
serverless deploy function -f nombreFuncion --stage dev
```

## Notas Importantes

1. **Costos**: AWS cobra por uso de Lambda, API Gateway, DynamoDB y S3. Con el tier gratuito, los costos deberían ser mínimos para desarrollo.

2. **Seguridad**: Este código es para desarrollo/demostración. Para producción:
   - Implementa autenticación JWT real
   - Usa bcrypt para hashear contraseñas
   - Implementa rate limiting
   - Agrega validación de entrada más robusta
   - Configura HTTPS/SSL

3. **Escalabilidad**: DynamoDB está configurado en modo PAY_PER_REQUEST, lo que significa que escala automáticamente.

## Desarrollo Local

Para desarrollo local del frontend:

```bash
cd frontend
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`.

## Actualizar después de cambios

### Backend
```bash
cd backend/[microservicio]
serverless deploy --stage dev
```

### Frontend
```bash
cd frontend
npm run build
serverless deploy --stage dev
```
