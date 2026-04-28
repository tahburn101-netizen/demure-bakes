FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:18-alpine
WORKDIR /app
RUN npm install express
COPY --from=builder /app/dist ./dist
COPY server.cjs ./server.cjs
EXPOSE 8080
CMD ["node", "server.cjs"]
# Cache bust Tue Apr 28 19:14:44 EDT 2026
