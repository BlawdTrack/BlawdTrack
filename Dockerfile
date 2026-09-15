# Usamos una versión ligera de Node.js
FROM node:20-alpine

# Establecemos el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copiamos los archivos de dependencias primero (optimiza el caché de Docker)
COPY package.json package-lock.json* ./

# Instalamos las dependencias
RUN npm install

# Copiamos el resto del código del proyecto
COPY . .

# Exponemos el puerto que usa Vite por defecto
EXPOSE 5173

# Comando para iniciar la aplicación, forzando a Vite a exponerse a la red del contenedor
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]