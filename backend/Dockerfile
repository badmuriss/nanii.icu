FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci && npm cache clean --force

COPY . .
RUN npm run build

FROM node:20-alpine AS runtime

RUN apk add --no-cache curl

RUN addgroup -g 1001 -S nodejs
RUN adduser -S backend -u 1001

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

COPY --from=builder --chown=backend:nodejs /app/dist ./dist

# No need for database directory with MongoDB

USER backend

EXPOSE 3002

CMD ["node", "dist/server.js"]