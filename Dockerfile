FROM node:18-alpine AS base

RUN npm install -g pnpm

FROM base AS dependencies

WORKDIR /app

COPY package.json .
COPY pnpm-lock.yaml .

RUN pnpm install

FROM dependencies AS builder
ARG RELEASE_ENV

WORKDIR /app

COPY . .

RUN pnpm run build:${RELEASE_ENV}

FROM nginx:alpine
ARG RELEASE_ENV

COPY docker/nginx.${RELEASE_ENV}.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]