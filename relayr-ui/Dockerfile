# Build stage: install dependencies and build the Next.js app
FROM node:22-alpine AS builder
WORKDIR /usr/src/app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm ci

# Copy all source code and build for production
COPY . .

# Set environment variables for Next.js
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV NODE_ENV=production

# Build the Next.js application
RUN npm run build

# Production stage: serve static files with caddy
FROM caddy:alpine AS production
COPY --from=builder /usr/src/app/out /usr/share/caddy
COPY Caddyfile /etc/caddy/Caddyfile
EXPOSE 80
CMD ["caddy", "run", "--config", "/etc/caddy/Caddyfile"]
