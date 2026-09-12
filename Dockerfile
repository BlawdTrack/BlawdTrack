# Imagen base ligera de Node.js
FROM node:18-alpine

# Directorio de trabajo en el contenedor
WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar el resto del código del proyecto
COPY . .

# Exponer el puerto por defecto de Vite
EXPOSE 5173

# Comando para iniciar el servidor de desarrollo en modo host
CMD ["npm", "run", "dev", "--", "--host"]