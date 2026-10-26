# syntax=docker/dockerfile:1
# Frontend para el entorno de pruebas de extremo a extremo: se compila y se sirve con nginx. El contexto es la
# carpeta frontend/. VITE_API_URL se fija al compilar (lo pasa docker-compose.e2e.yml).
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm npm ci
COPY . .
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

# La configuración de nginx (rutas del SPA) se monta desde docker-compose.e2e.yml: COPY no puede salir del contexto.
FROM nginx:1.27-alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
