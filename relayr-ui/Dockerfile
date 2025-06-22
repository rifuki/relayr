# Build stage: install dependencies and build the Next.js app
FROM node:latest AS builder
WORKDIR /usr/src/app

# Copy package.json and install dependencies
COPY package.json ./
RUN npm install 

# Copy all source code and build for production
COPY . .

# Set environment variables for Next.js
ARG NEXT_PUBLIC_API_HOST
ENV NEXT_PUBLIC_API_HOST=${NEXT_PUBLIC_API_HOST}
ENV NODE_ENV=production

# Build the Next.js application
RUN npm run build

# Production stage: serve static files with caddy
FROM caddy:alpine AS production
COPY --from=builder /usr/src/app/out /usr/share/caddy
EXPOSE 80
CMD ["caddy", "file-server", "--root", "/usr/share/caddy", "--listen", ":80"]
