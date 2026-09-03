# ─────────────────────────────────────────────
# Stage 1 – deps (install node_modules)
# ─────────────────────────────────────────────
FROM node:24-alpine AS deps
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

# Copy lock files and install prod + dev deps
COPY package.json package-lock.json ./
RUN npm ci

# ─────────────────────────────────────────────
# Stage 2 – builder (compile Next.js)
# ─────────────────────────────────────────────
FROM node:24-alpine AS builder
RUN apk add --no-cache openssl
WORKDIR /app

# Copy all source files and deps from previous stage
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma client before build
RUN npx prisma generate

# Build the Next.js app in standalone mode
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
RUN npm run build

# ─────────────────────────────────────────────
# Stage 3 – runner (minimal production image)
# ─────────────────────────────────────────────
FROM node:24-alpine AS runner
RUN apk add --no-cache openssl
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create a non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy only what's needed to run
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Start the standalone Next.js server
CMD ["node", "server.js"]
