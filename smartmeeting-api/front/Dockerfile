# syntax=docker/dockerfile:1

# ---- Etapa 1: build ------------------------------------------------------
FROM node:20-alpine AS build
WORKDIR /build

COPY package*.json ./
RUN npm ci

COPY . .

# ATENÇÃO: o Vite resolve import.meta.env no BUILD, não em runtime. Por isso a
# URL da API entra como build-arg e não como variável do container — definir
# VITE_API_BASE_URL no `docker run` não teria efeito nenhum. Publicar em outro
# host exige rebuildar a imagem.
ARG VITE_API_BASE_URL=http://localhost:8080
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
RUN npm run build

# ---- Etapa 2: runtime ----------------------------------------------------
FROM nginx:alpine AS runtime

COPY --from=build /build/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
