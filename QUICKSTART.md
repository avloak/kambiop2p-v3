# KambioP2P v3 - Quick Start Guide

## 🚀 Inicio Rápido

### Opción 1: Deployment Automatizado (Recomendado)

#### Windows
```cmd
deploy.bat dev
```

#### Linux/Mac
```bash
chmod +x deploy.sh
./deploy.sh dev
```

Este script desplegará automáticamente todos los microservicios del backend y el frontend.

### Opción 2: Deployment Manual

#### 1. Backend

Cada microservicio:
```bash
cd backend/[microservicio]
npm install
serverless deploy --stage dev
```

#### 2. Frontend

```bash
cd frontend
npm install
npm run build
serverless deploy --stage dev
```

## 🧪 Modo Desarrollo Local

### Frontend (solo)
```bash
cd frontend
npm install
npm run dev
```

Abre http://localhost:3000 en tu navegador.

**Nota:** En modo dev local, las llamadas a API no funcionarán hasta que despliegues el backend.

## 📱 Probar la Aplicación

### Usuario Demo
- Email: `demo@kambiop2p.com`
- Password: `demo1234`

O crea un nuevo usuario usando el formulario de registro.

### Flujo de Prueba Completo

1. **Landing Page**
   - Ingresa un monto en USD
   - Observa el cálculo de ahorro vs bancos

2. **Registro**
   - Haz clic en "Registrarse"
   - Completa el formulario paso a paso
   - Paso 1: Email y contraseña
   - Paso 2: DNI, nombre completo, fecha de nacimiento

3. **Marketplace**
   - Visualiza ofertas disponibles
   - Filtra por tipo (Compra/Venta)
   - Observa tasas de cambio y reputación

4. **Crear Oferta**
   - Haz clic en "Crear Oferta"
   - Ingresa monto y tipo de cambio
   - Publica la oferta

5. **Aceptar Oferta**
   - Haz clic en "Aceptar Oferta" en cualquier oferta
   - Sigue las instrucciones paso a paso
   - Confirma depósito
   - Libera fondos
   - Califica la transacción

6. **Perfil de Usuario**
   - Ve tu reputación y estadísticas
   - Agrega cuentas bancarias
   - Observa historial de transacciones

## 📚 Documentación Adicional

- [DEPLOYMENT.md](DEPLOYMENT.md) - Guía detallada de deployment
- [API.md](API.md) - Referencia completa de APIs
- [ARCHITECTURE.md](ARCHITECTURE.md) - Arquitectura del sistema

## 🔧 Troubleshooting

### Error: "Cannot find module 'next'"
```bash
cd frontend
npm install
```

### Error: "Role LabRole does not exist"
Asegúrate de estar usando AWS Academy y que tu sesión de laboratorio esté activa.

### Error: CORS en el frontend
Verifica que los handlers Lambda incluyan los headers CORS (ya están implementados).

### Frontend no carga después del deployment
1. Verifica la URL de S3 en la salida del deployment
2. Asegúrate de que el bucket es público
3. Espera 1-2 minutos para propagación

## 🛠 Comandos Útiles

### Ver logs de una función Lambda
```bash
serverless logs -f nombreFuncion --stage dev --tail
```

### Eliminar todos los recursos (cleanup)
```bash
# Cada microservicio
cd backend/usuarios
serverless remove --stage dev

# Frontend
cd frontend
serverless remove --stage dev
```

### Redeploy rápido de una función
```bash
serverless deploy function -f nombreFuncion --stage dev
```

## 💡 Tips

1. **Desarrollo Local**: Usa `npm run dev` en el frontend para iterar rápidamente en la UI
2. **Logs**: Usa `serverless logs` para debugging de backend
3. **CloudWatch**: Revisa CloudWatch Logs en AWS Console para errores detallados
4. **DynamoDB**: Usa AWS Console para ver datos en las tablas

## 🎯 Próximos Pasos

Después de desplegar y probar:

1. ✅ Personaliza los colores y branding
2. ✅ Conecta a APIs bancarias reales
3. ✅ Implementa autenticación JWT
4. ✅ Agrega WebSockets para tiempo real
5. ✅ Implementa notificaciones push
6. ✅ Agrega tests unitarios e integración

## 📞 Soporte

Para problemas o preguntas:
1. Revisa [DEPLOYMENT.md](DEPLOYMENT.md)
2. Revisa [ARCHITECTURE.md](ARCHITECTURE.md)
3. Revisa los logs de CloudWatch
4. Verifica la configuración de IAM (rol LabRole)

## 🎉 ¡Listo!

Tu plataforma P2P de intercambio de divisas está lista para usar. 

**¡Feliz trading! 💱**
