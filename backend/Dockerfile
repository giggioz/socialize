FROM node:22-alpine AS build
WORKDIR /repo

COPY package.json package-lock.json ./
COPY backend/package.json ./backend/package.json
RUN npm ci

COPY backend ./backend
RUN npm run -w backend build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY package.json package-lock.json ./
COPY backend/package.json ./backend/package.json
RUN npm ci --omit=dev -w backend && npm cache clean --force

COPY --from=build /repo/backend/dist ./backend/dist

EXPOSE 3001
CMD ["node", "backend/dist/index.js"]

