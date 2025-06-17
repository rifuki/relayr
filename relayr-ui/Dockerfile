# Build stage: install dependencies and build the Next.js app
FROM node:latest AS builder
WORKDIR /usr/src/app

# Copy package.json and install dependencies
COPY package.json ./
RUN npm install 

# Copy all source code and build for production
COPY . .
ENV NODE_ENV=production
RUN npm run build

# Production stage: serve static files with nginx
FROM nginx:latest AS production
COPY --from=builder /usr/src/app/out /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
