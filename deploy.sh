#!/bin/bash

# Script de deployment completo para KambioP2P v3
# Este script despliega todos los microservicios del backend y el frontend

echo "========================================="
echo "KambioP2P v3 - Deployment Automatizado"
echo "========================================="
echo ""

# Colores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function para mostrar errores
error_exit() {
    echo -e "${RED}Error: $1${NC}" 1>&2
    exit 1
}

# Function para mostrar éxito
success() {
    echo -e "${GREEN}✓ $1${NC}"
}

# Function para mostrar warnings
warn() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

# Verificar prerequisitos
echo "Verificando prerequisitos..."

command -v node >/dev/null 2>&1 || error_exit "Node.js no está instalado"
command -v npm >/dev/null 2>&1 || error_exit "npm no está instalado"
command -v python3 >/dev/null 2>&1 || error_exit "Python3 no está instalado"
command -v serverless >/dev/null 2>&1 || error_exit "Serverless Framework no está instalado. Ejecuta: npm install -g serverless"
command -v aws >/dev/null 2>&1 || error_exit "AWS CLI no está instalado"

success "Todos los prerequisitos están instalados"
echo ""

# Obtener stage (dev por defecto)
STAGE=${1:-dev}
echo "Desplegando en stage: $STAGE"
echo ""

# Array para almacenar URLs de API Gateway
declare -A API_URLS

# Deploy Backend Microservices
echo "========================================="
echo "Desplegando Microservicios del Backend"
echo "========================================="
echo ""

# Microservicio de Usuarios
echo "1. Desplegando Microservicio de Usuarios..."
cd backend/usuarios || error_exit "No se puede acceder a backend/usuarios"
npm install || error_exit "Error instalando dependencias de usuarios"
OUTPUT=$(serverless deploy --stage $STAGE 2>&1)
if [ $? -eq 0 ]; then
    success "Microservicio de Usuarios desplegado"
    API_URLS[usuarios]=$(echo "$OUTPUT" | grep -oP 'https://[a-z0-9]+\.execute-api\.[a-z0-9-]+\.amazonaws\.com/[a-z]+' | head -1)
    echo "URL: ${API_URLS[usuarios]}"
else
    error_exit "Error desplegando microservicio de usuarios"
fi
cd ../..
echo ""

# Microservicio de Mercado
echo "2. Desplegando Microservicio de Mercado..."
cd backend/mercado || error_exit "No se puede acceder a backend/mercado"
npm install || error_exit "Error instalando dependencias de mercado"
OUTPUT=$(serverless deploy --stage $STAGE 2>&1)
if [ $? -eq 0 ]; then
    success "Microservicio de Mercado desplegado"
    API_URLS[mercado]=$(echo "$OUTPUT" | grep -oP 'https://[a-z0-9]+\.execute-api\.[a-z0-9-]+\.amazonaws\.com/[a-z]+' | head -1)
    echo "URL: ${API_URLS[mercado]}"
else
    error_exit "Error desplegando microservicio de mercado"
fi
cd ../..
echo ""

# Microservicio de Transacciones
echo "3. Desplegando Microservicio de Transacciones..."
cd backend/transacciones || error_exit "No se puede acceder a backend/transacciones"
npm install || error_exit "Error instalando dependencias de transacciones"
OUTPUT=$(serverless deploy --stage $STAGE 2>&1)
if [ $? -eq 0 ]; then
    success "Microservicio de Transacciones desplegado"
    API_URLS[transacciones]=$(echo "$OUTPUT" | grep -oP 'https://[a-z0-9]+\.execute-api\.[a-z0-9-]+\.amazonaws\.com/[a-z]+' | head -1)
    echo "URL: ${API_URLS[transacciones]}"
else
    error_exit "Error desplegando microservicio de transacciones"
fi
cd ../..
echo ""

# Microservicio de Disputas
echo "4. Desplegando Microservicio de Disputas..."
cd backend/disputas || error_exit "No se puede acceder a backend/disputas"
npm install || error_exit "Error instalando dependencias de disputas"
OUTPUT=$(serverless deploy --stage $STAGE 2>&1)
if [ $? -eq 0 ]; then
    success "Microservicio de Disputas desplegado"
    API_URLS[disputas]=$(echo "$OUTPUT" | grep -oP 'https://[a-z0-9]+\.execute-api\.[a-z0-9-]+\.amazonaws\.com/[a-z]+' | head -1)
    echo "URL: ${API_URLS[disputas]}"
else
    error_exit "Error desplegando microservicio de disputas"
fi
cd ../..
echo ""

success "Todos los microservicios del backend desplegados exitosamente"
echo ""

# Deploy Frontend
echo "========================================="
echo "Desplegando Frontend"
echo "========================================="
echo ""

cd frontend || error_exit "No se puede acceder a frontend"

# Crear archivo .env.local con las URLs de los microservicios
echo "Creando archivo .env.local con URLs de API..."
cat > .env.local << EOF
NEXT_PUBLIC_API_USUARIOS=${API_URLS[usuarios]}
NEXT_PUBLIC_API_MERCADO=${API_URLS[mercado]}
NEXT_PUBLIC_API_TRANSACCIONES=${API_URLS[transacciones]}
NEXT_PUBLIC_API_DISPUTAS=${API_URLS[disputas]}
EOF
success "Archivo .env.local creado"

# Instalar dependencias
echo "Instalando dependencias del frontend..."
npm install || error_exit "Error instalando dependencias del frontend"
success "Dependencias instaladas"

# Build
echo "Construyendo aplicación Next.js..."
npm run build || error_exit "Error construyendo frontend"
success "Build completado"

# Deploy a S3
echo "Desplegando a S3..."
npm install --save-dev serverless serverless-s3-sync || error_exit "Error instalando plugins de serverless"
OUTPUT=$(serverless deploy --stage $STAGE 2>&1)
if [ $? -eq 0 ]; then
    success "Frontend desplegado a S3"
    WEBSITE_URL=$(echo "$OUTPUT" | grep -oP 'http://[a-z0-9.-]+\.s3-website[a-z0-9.-]+\.amazonaws\.com' | head -1)
    echo "URL del sitio web: $WEBSITE_URL"
else
    error_exit "Error desplegando frontend"
fi

cd ..
echo ""

# Resumen
echo "========================================="
echo "Deployment Completado"
echo "========================================="
echo ""
echo "URLs de los Microservicios:"
echo "  Usuarios:      ${API_URLS[usuarios]}"
echo "  Mercado:       ${API_URLS[mercado]}"
echo "  Transacciones: ${API_URLS[transacciones]}"
echo "  Disputas:      ${API_URLS[disputas]}"
echo ""
echo "URL del Frontend:"
echo "  $WEBSITE_URL"
echo ""
success "¡Deployment completado exitosamente!"
echo ""
echo "Próximos pasos:"
echo "1. Abre el sitio web en tu navegador"
echo "2. Registra un usuario de prueba"
echo "3. Explora el marketplace"
echo ""
warn "Nota: Este es un entorno de desarrollo. Para producción, implementa las mejoras de seguridad recomendadas."
