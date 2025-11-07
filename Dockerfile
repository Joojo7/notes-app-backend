FROM node:21-alpine
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install from public registry
RUN npm ci

# Copy the rest of the application
COPY . .

# Expose the port
EXPOSE 8000

CMD [ "npm", "start" ]