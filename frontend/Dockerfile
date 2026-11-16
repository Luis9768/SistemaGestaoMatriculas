# Estágio 1: Instalação de Dependências
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

# Estágio 2: Build da Aplicação Next.js
FROM node:20-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Argumento para URL da API em build time (usado pelos componentes cliente)
ARG NEXT_PUBLIC_API_URL=http://localhost:8080/api
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

RUN npm run build

# Estágio 3: Runner Standalone Mínimo e Seguro (Ultra Leve ~120MB)
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Usuário de segurança não-root (UID 1001)
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs

# Copia apenas os artefatos standalone compilados
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

# Healthcheck nativo em Node 20 (sem dependência de BusyBox wget / IPv6 localhost)
HEALTHCHECK --interval=10s --timeout=5s --start-period=15s --retries=5 \
  CMD ["node", "-e", "fetch('http://127.0.0.1:' + (process.env.PORT || 3000) + '/').then(r => process.exit(r.status < 500 ? 0 : 1)).catch(() => process.exit(1))"]

CMD ["node", "server.js"]
