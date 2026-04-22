FROM node:20-alpine AS builder

WORKDIR /app/frontend

ARG NEXT_PUBLIC_API_URL=http://localhost:3333
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV NEXT_TELEMETRY_DISABLED=1

COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ ./

RUN npm run build

FROM node:20-alpine AS runner

WORKDIR /app/frontend

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

COPY frontend/package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/frontend/.next ./.next
COPY --from=builder /app/frontend/next.config.mjs ./next.config.mjs

EXPOSE 3000

CMD ["npm", "start"]