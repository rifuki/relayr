# Use the official Bun image as the base image for all stages
FROM oven/bun:alpine AS base
WORKDIR /usr/src/app

FROM base AS install 
RUN mkdir -p /temp/dev
COPY package.json bun.lock /temp/dev/
RUN cd /temp/dev && bun install --frozen-lockfile

RUN mkdir -p /temp/prod
# Copy lock files to a temp directory to leverage Docker cache for dependency install
COPY package.json bun.lock /temp/prod/
# Install only production dependencies with Bun
RUN cd /temp/prod && bun install --frozen-lockfile --production

# --- Build Next.js app ---
FROM base AS build 
COPY --from=install /temp/dev/node_modules ./node_modules
COPY . .
# Copy environment variables used during build (make sure .env.production is not in .dockerignore)
COPY .env.production .env.production
ENV NODE_ENV=production
RUN bun run build --debug

# --- Release image: only contains runtime files ---
FROM base AS release
# Copy production node_modules
COPY --from=install /temp/prod/node_modules ./node_modules
# Copy Next.js build output and static assets
COPY --from=build /usr/src/app/.next ./.next
COPY --from=build /usr/src/app/public ./public
# Copy necessary metadata files for runtime
COPY --from=build /usr/src/app/package.json ./package.json
COPY --from=build /usr/src/app/bun.lock ./bun.lock

# Run as non-root user for security
USER bun
# Expose the default Next.js port
EXPOSE 3000
# Start the Next.js server in production mode using Bun
ENTRYPOINT ["bun", "run", "start"]
