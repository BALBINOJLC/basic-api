# Establecer la imagen base
FROM node:18

# Crear el directorio de la aplicación
WORKDIR /usr/src/app

# Instalar las dependencias de la aplicación
COPY package.json yarn.lock ./

RUN yarn install

# Instalar Doppler CLI
RUN curl -Ls https://cli.doppler.com/install.sh | sh

# Copiar el código de la aplicación al contenedor
COPY . .

# Exponer el puerto que usa la aplicación
EXPOSE 3000

# Comando para iniciar la aplicación
CMD ["doppler", "run", "--", "yarn", "start:dev"]
