# Usa una imagen base de Node.js oficial para tu aplicación
# Elige una versión que se adapte a tu proyecto (ej. node:20-slim, node:18-alpine)
FROM node:20-slim

# Establece el directorio de trabajo dentro del contenedor
WORKDIR /usr/src/app

# Copia los archivos de configuración de dependencias primero para aprovechar el cache de Docker
# Esto asegura que npm install solo se ejecute si package.json o package-lock.json cambian
COPY package.json package-lock.json ./

# Instala las dependencias.
# Incluye devDependencies porque 'tsc' es necesario para la fase de 'npm run build'.
# Si tu npm run build se ejecuta en un paso separado del Dockerfile,
# necesitas que tsc esté disponible en ese paso.
RUN npm install

# Copia el resto del código de la aplicación
# Esto se hace después de npm install para que los cambios en el código no invaliden el cache de npm install
COPY . .

# Ejecuta el script de compilación de TypeScript a JavaScript
# Esto generará tu código JavaScript en la carpeta 'dist' (o la que hayas configurado en tsconfig.json)
RUN npm run build

# Expone el puerto en el que la aplicación escuchará.
# Cloud Run inyecta la variable de entorno PORT, que por defecto es 8080.
# Tu aplicación debe escuchar en process.env.PORT.
EXPOSE 8080

# Define el comando para ejecutar la aplicación cuando el contenedor se inicie.
# Esto ejecutará el código JavaScript compilado.
CMD [ "npm", "start" ]

# .dockerignore (asegúrate de que exista en la raíz de tu proyecto)
# node_modules/
# dist/
# .env
# .git/
# .gitignore
# *.log
# .vscode/
