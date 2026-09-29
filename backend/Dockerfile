FROM node:20-alpine AS base
WORKDIR /app

# Install dependencies required for native modules and openssl for Prisma
RUN apk add --no-cache openssl libc6-compat

# Copy package definition files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies (including devDependencies for prisma CLI)
RUN npm install

# Generate Prisma Client
RUN npx prisma generate

# Copy source code
COPY . .

# Expose default backend port
EXPOSE 4000

ENV PORT=4000
ENV NODE_ENV=production

# Start backend server
CMD ["node", "src/index.js"]
