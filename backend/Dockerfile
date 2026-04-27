FROM node:20-alpine AS dev

RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ttf-freefont \
    font-noto-emoji

WORKDIR /app/backend

COPY backend/package*.json ./
RUN npm ci

COPY backend/ ./
COPY data /app/data

CMD ["npm", "run", "dev"]

FROM dev AS builder

RUN npm run build

FROM node:20-alpine AS runner

RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ttf-freefont \
    font-noto-emoji

WORKDIR /app/backend

ENV NODE_ENV=production
ENV PORT=3333
ENV HOST=0.0.0.0

COPY backend/package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/backend/dist ./dist
COPY --from=builder /app/data /app/data

EXPOSE 3333

CMD ["node", "dist/server.js"]