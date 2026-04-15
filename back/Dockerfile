FROM node:22-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY . .

EXPOSE 3001

CMD ["sh", "-c", "npx knex migrate:latest && npx knex seed:run && node src/server.js"]
