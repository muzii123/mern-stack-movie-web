FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --fetch-timeout=600000 --fetch-retries=5

COPY backend ./backend

EXPOSE 3000

CMD ["node", "backend/index.js"]
