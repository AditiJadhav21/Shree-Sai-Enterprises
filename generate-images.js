# Production Dockerfile for Shree Sai Enterprises Web Application
FROM node:20-alpine AS base

# Install system dependencies
RUN apk add --no-cache tzdata
ENV TZ=Asia/Kolkata

WORKDIR /app

# Install production dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy application files
COPY . .

# Ensure data and upload directories exist with write permissions
RUN mkdir -p /app/data /app/public/images/uploads /app/public/images/products /app/public/images/gallery

# Expose server port
EXPOSE 3000

# Healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/business-info || exit 1

# Start production server
CMD ["node", "server.js"]
