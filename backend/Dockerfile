# Production image for the NestJS API. Built on the server itself, so it
# matches the server's CPU (ARM64 on Hetzner CAX).

FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
# Runtime dependencies only; scripts off so no install step runs extra tools.
RUN npm ci --omit=dev --ignore-scripts

FROM node:22-alpine
ENV NODE_ENV=production
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY package.json ./
# Run as the unprivileged "node" user, not root.
USER node
EXPOSE 3001
HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3001/ >/dev/null || exit 1
CMD ["node", "dist/src/main.js"]
