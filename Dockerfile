# --- 1. Build Stage ---
FROM node:20-slim AS builder

WORKDIR /app

# Install required dependencies
COPY package*.json ./
RUN npm install

# Copy full app code
COPY . .

# Build arguments for environment variables
ARG NEXT_PUBLIC_CDP_WRITEKEY
ARG NEXT_PUBLIC_CDP_ENDPOINT
ARG NEXT_PUBLIC_DISCOVER_DEFAULT_SCRIPT
ARG NEXT_PUBLIC_INTERACT_ENDPOINT
ARG NEXT_PUBLIC_INTERACT_CHANNEL_NAME
ARG NEXT_PUBLIC_INTERACTION_POINT
ARG NEXT_PUBLIC_GA_MEASUREMENT_ID
ARG NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

# Set environment variables for build
ENV NEXT_PUBLIC_CDP_WRITEKEY=$NEXT_PUBLIC_CDP_WRITEKEY
ENV NEXT_PUBLIC_CDP_ENDPOINT=$NEXT_PUBLIC_CDP_ENDPOINT
ENV NEXT_PUBLIC_DISCOVER_DEFAULT_SCRIPT=$NEXT_PUBLIC_DISCOVER_DEFAULT_SCRIPT
ENV NEXT_PUBLIC_INTERACT_ENDPOINT=$NEXT_PUBLIC_INTERACT_ENDPOINT
ENV NEXT_PUBLIC_INTERACT_CHANNEL_NAME=$NEXT_PUBLIC_INTERACT_CHANNEL_NAME
ENV NEXT_PUBLIC_INTERACTION_POINT=$NEXT_PUBLIC_INTERACTION_POINT
ENV NEXT_PUBLIC_GA_MEASUREMENT_ID=$NEXT_PUBLIC_GA_MEASUREMENT_ID
ENV NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=$NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

# Generate Prisma Client with binaries matching the Docker runtime
RUN npx prisma generate

# Build Next.js app (standalone)
RUN npm run build

# --- 2. Production Runner ---
FROM node:20-slim AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV DOCKER_CONTAINER=true

# Install only production dependencies
COPY package*.json ./
RUN npm install --omit=dev

RUN apt-get update -y && apt-get install -y openssl postgresql-client && rm -rf /var/lib/apt/lists/*

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static .next/static
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/language ./language

# Prisma engines
COPY --from=builder /app/node_modules/.prisma /app/node_modules/.prisma
COPY --from=builder /app/prisma ./prisma

# Copy lib for database setup
COPY --from=builder /app/lib ./lib

# Copy entrypoint scripts
COPY docker-entrypoint.sh /usr/local/bin/
COPY docker-entrypoint-multitenant.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint-multitenant.sh

# Expose port
EXPOSE 3000

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["node", "server.js"]
