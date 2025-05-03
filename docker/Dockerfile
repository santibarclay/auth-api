# Usar una imagen base de Node.js oficial
FROM node:18-alpine

# Crear directorio de trabajo en el contenedor
WORKDIR /app

# Copiar package.json y package-lock.json primero para aprovechar la caché de capas de Docker
COPY package*.json ./

# Instalar dependencias
RUN npm install --production

# Copiar el resto del código de la aplicación
COPY . .

# Crear un usuario sin privilegios
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Cambiar la propiedad de los archivos de la aplicación
RUN chown -R appuser:appgroup /app

# Cambiar al usuario sin privilegios
USER appuser

# Exponer el puerto 9000 que usa nuestra aplicación
EXPOSE 9000

# Comando para iniciar la aplicación
CMD ["node", "src/server.js"]