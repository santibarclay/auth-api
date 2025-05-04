# auth-api

Un servicio de autorización OAuth2 que actúa como gateway para proteger APIs

## Descripción

`auth-api` es un servicio de autorización OAuth2 que implementa un enfoque de Gateway para proteger APIs. Este servicio proporciona:

1. **Social Login** para administradores mediante Google OAuth
2. **Client Credentials** para aplicaciones cliente con control granular de permisos mediante scopes
3. **Gateway/Proxy** que valida tokens y reenvía solicitudes a APIs protegidas

Esta arquitectura permite que tus APIs permanezcan agnósticas respecto a la autenticación y autorización, centralizando toda la lógica de seguridad en un solo lugar.

## Requisitos previos

- Node.js 14.x o superior
- npm 6.x o superior
- Docker (para despliegue en contenedores)
- Una cuenta en Google Cloud Platform (para configurar OAuth)
- Una API existente para proteger (en este caso, una API de contactos en el puerto 8081)

## Características

- Autenticación de administradores mediante Google OAuth
- Panel de administración para gestionar clientes OAuth2
- Emisión y validación de tokens JWT
- Control granular de permisos mediante scopes
- Proxy/Gateway para APIs protegidas
- Interfaz web para gestión de clientes y credenciales
- Dockerizado para facilitar el despliegue

## Estructura del proyecto

```
auth-api/
├── src/
│   ├── config/          # Configuración de la aplicación
│   ├── controllers/     # Controladores de la aplicación
│   ├── middleware/      # Middleware personalizado
│   ├── models/          # Modelos de datos
│   ├── proxy/           # Implementación del gateway
│   ├── routes/          # Rutas de la API
│   ├── views/           # Plantillas EJS
│   │   ├── admin/       # Vistas del panel de administración
│   │   └── auth/        # Vistas de autenticación
│   └── server.js        # Punto de entrada de la aplicación
├── docker/              # Archivos para Docker
├── .env                 # Variables de entorno
├── .gitignore           # Archivos ignorados por git
├── package.json         # Dependencias y scripts
└── README.md            # Este archivo
```

## Instalación y configuración

### 1. Clonar el repositorio

```bash
git clone https://github.com/santibarclay/auth-api.git
cd auth-api
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Crear el archivo .env

Crea un archivo `.env` en la raíz del proyecto con la siguiente configuración:

```
PORT=9000
NODE_ENV=development
JWT_SECRET=tu-jwt-secret-para-desarrollo
SESSION_SECRET=tu-session-secret-para-desarrollo
GOOGLE_CLIENT_ID=tu-google-client-id
GOOGLE_CLIENT_SECRET=tu-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:9000/auth/google/callback
API_DOMAIN=http://localhost:9000
CONTACTS_API_URL=http://localhost:8081
ADMIN_EMAILS=tu-email@gmail.com,otro-admin@gmail.com
```

### 4. Configurar Google OAuth

1. Ve a la [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Ve a "APIs y Servicios" > "Credenciales"
4. Haz clic en "Crear credenciales" y selecciona "ID de cliente de OAuth"
5. Configura la aplicación:
   - Tipo: Aplicación web
   - Nombre: auth-api
   - Orígenes autorizados: `http://localhost:9000` (desarrollo) y tu dominio de producción
   - URLs de redirección: `http://localhost:9000/auth/google/callback` (desarrollo) y la URL de callback de producción
6. Copia el ID de cliente y el secreto a tu archivo `.env`

### 5. Iniciar la aplicación

```bash
npm run dev
```

La aplicación estará disponible en http://localhost:9000

## Uso

### Flujo para administradores (Social Login)

1. Accede a http://localhost:9000
2. Haz clic en "Iniciar Sesión"
3. Autentica con Google (debe ser un correo listado en ADMIN_EMAILS)
4. Accede al panel de administración
5. Gestiona los clientes OAuth2 y sus scopes

### Flujo para aplicaciones cliente (Client Credentials)

1. Obtén un Client ID y Client Secret desde el panel de administración
2. Solicita un token de acceso:

```bash
curl -X POST \
  http://localhost:9000/auth/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "client_id=TU_CLIENT_ID&client_secret=TU_CLIENT_SECRET&scope=contacts:read"
```

3. Utiliza el token para acceder a las APIs protegidas:

```bash
curl -X GET \
  http://localhost:9000/api/contacts \
  -H "Authorization: Bearer TU_TOKEN"
```

### Scopes disponibles

- `contacts:read`: Permite leer contactos
- `contacts:write`: Permite crear y actualizar contactos
- `contacts:delete`: Permite eliminar contactos

## Despliegue en producción

### Construcción de la imagen Docker

```bash
npm run docker:build
```

### Ejecución del contenedor

```bash
docker run -d \
  --name auth-api \
  --restart always \
  -p 9000:9000 \
  --env-file .env.production \
  auth-api
```

### Configuración para EC2

1. Conectarse a la instancia EC2
2. Clonar el repositorio
3. Configurar las variables de entorno para producción
4. Instalar dependencias y construir la imagen Docker
5. Ejecutar el contenedor

La configuración detallada para EC2 está disponible en la documentación.

## Seguridad

- Los tokens JWT se firman con un secreto configurable
- Las credenciales de clientes OAuth2 se generan de forma segura
- Los scopes proporcionan control granular de acceso
- Solo los correos electrónicos autorizados pueden acceder como administradores
- El panel de administración está protegido por autenticación

## Notas importantes

- Este servicio asume que hay una API de contactos ejecutándose en el puerto 8081
- Para un entorno de producción, se recomienda implementar persistencia de datos
- Las APIs protegidas no deben estar expuestas directamente a Internet
- Todos los accesos deben pasar a través de este gateway