# Establecer la imagen base
FROM node:18 AS builder

# Crear el directorio de la aplicación
WORKDIR /usr/src/app

# Instalar las dependencias de la aplicación
COPY package.json yarn.lock ./
RUN yarn install

# Copiar el código de la aplicación y el archivo firebase-admin.json al contenedor
COPY . .
COPY firebase-admin.json ./

# Construir la aplicación para producción
RUN yarn build

# Etapa de producción
FROM node:18-slim

# Crear el directorio de la aplicación
WORKDIR /usr/src/app

# Copiar la aplicación construida y las dependencias necesarias
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/dist ./dist

# Install Doppler CLI
RUN apt-get update && apt-get install -y apt-transport-https ca-certificates curl gnupg && \
    curl -sLf --retry 3 --tlsv1.2 --proto "=https" 'https://packages.doppler.com/public/cli/gpg.DE2A7741A397C129.key' | gpg --dearmor -o /usr/share/keyrings/doppler-archive-keyring.gpg && \
    echo "deb [signed-by=/usr/share/keyrings/doppler-archive-keyring.gpg] https://packages.doppler.com/public/cli/deb/debian any-version main" | tee /etc/apt/sources.list.d/doppler-cli.list && \
    apt-get update && \
    apt-get -y install doppler

# Exponer el puerto que usa la aplicación
EXPOSE 8081

# Comando para iniciar la aplicación en producción
CMD ["doppler", "run", "--", "node", "dist/src/main.js"]

