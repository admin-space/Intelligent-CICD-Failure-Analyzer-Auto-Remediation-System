# Production-grade multi-stage Dockerfile for React SPA Frontend
FROM node:20-alpine as builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:1.25-alpine as runner

COPY --from=builder /app/dist /usr/share/nginx/html
# Custom Nginx configs could be mounted here if routing switches are present.

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
