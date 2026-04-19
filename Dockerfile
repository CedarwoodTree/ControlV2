FROM node:lts-alpine3.22

#Change Working Directory
WORKDIR /app

# Copy the lock and package file
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build dist/
RUN npm run build

# Run Service
CMD ["node", "server.js"]