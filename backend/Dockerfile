FROM node:20-alpine
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY prisma ./prisma
RUN npx prisma generate

COPY . .

ENV NODE_ENV=production
EXPOSE 3000

# Aplica migraciones pendientes sobre la DB del volumen y arranca la API
CMD ["sh", "-c", "npx prisma migrate deploy && node server.js"]
