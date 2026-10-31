# ---- Stage 1: build the React (Vite) frontend ----
FROM node:20-alpine AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# ---- Stage 2: Node/Express API + static frontend ----
FROM node:20-alpine
# Patch base-image OS packages (openssl/libcrypto) to their fixed releases
RUN apk upgrade --no-cache

WORKDIR /app
ENV NODE_ENV=production \
    PORT=9999 \
    HOST=0.0.0.0

COPY backend/package*.json ./backend/
RUN cd backend && npm ci --omit=dev && npm cache clean --force

COPY backend/ ./backend/
COPY --from=frontend-build /app/frontend/dist ./backend/public

WORKDIR /app/backend
EXPOSE 9999
CMD ["node", "server.js"]
