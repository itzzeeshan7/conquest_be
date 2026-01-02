# Build stage
FROM node:20-alpine AS build

WORKDIR /app

# Install build dependencies
RUN apk add --no-cache python3 make g++

# Copy package files
COPY package*.json ./
COPY yarn.lock ./

# Install dependencies
RUN yarn install

# Copy source code
COPY . .

# Build the application
RUN yarn build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Install runtime dependencies
RUN apk add --no-cache python3 make g++

# Copy package files
COPY package*.json ./
COPY yarn.lock ./

# Install only production dependencies
RUN yarn install --production

# Copy built application from build stage
COPY --from=build /app/dist ./dist

# Expose port
EXPOSE 9000

# Start the application
CMD ["node", "dist/main"]
