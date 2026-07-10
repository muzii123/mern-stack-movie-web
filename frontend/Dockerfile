# Stage 1: Build the React app
FROM node:20-alpine AS builder

WORKDIR /app/frontend

COPY frontend/package*.json ./

RUN npm config set fetch-retries 5 \
    && npm config set fetch-retry-mintimeout 20000 \
    && npm config set fetch-retry-maxtimeout 120000 \
    && npm install

COPY frontend .

# Accept backend URL as build argument
ARG VITE_BACKEND_TARGET=http://localhost:3000
ENV VITE_BACKEND_TARGET=$VITE_BACKEND_TARGET

RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy our custom nginx config
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

# Copy built static files
COPY --from=builder /app/frontend/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
