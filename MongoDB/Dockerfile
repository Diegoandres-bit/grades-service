# Imagen base de MongoDB
FROM mongo:latest

# Variables para crear usuario y base de datos
ENV MONGO_INITDB_ROOT_USERNAME=admin
ENV MONGO_INITDB_ROOT_PASSWORD=123
ENV MONGO_INITDB_DATABASE=grade-service

# Copia un script inline para crear el usuario dentro de grade-service
COPY init.js /docker-entrypoint-initdb.d/

# Expone el puerto de MongoDB
EXPOSE 27017
