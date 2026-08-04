# ==========================================
# Stage 1: Build Stage
# ==========================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package manifests
COPY package*.json ./

# Install all dependencies (including devDependencies for SvelteKit/Vite)
RUN npm ci

# Copy full repository source
COPY . .

# Build the SvelteKit app (Outputs to build/)
RUN npm run build

# Remove devDependencies to shrink production image
RUN npm prune --production

# ==========================================
# Stage 2: Production Runner
# ==========================================
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOST=0.0.0.0

# Copy node_modules and built application from builder
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/build ./build

# Expose SvelteKit server port
EXPOSE 3000

# Run with non-root node user for security
USER node

# SvelteKit Node adapter outputs entry point to build/index.js
CMD ["node", "build/index.js"]