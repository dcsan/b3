FROM node:18-alpine as build-image
RUN apk update && apk add bash && apk add curl
SHELL ["/bin/bash", "-o", "pipefail", "-c"]

WORKDIR /usr/src/app
COPY package*.json ./
COPY tsconfig.json ./
COPY prisma ./prisma

#   COPY [".env"] ./
COPY .env ./

COPY ./src ./src

RUN npm ci
RUN npm run build
RUN npx prisma generate

CMD [ "node", "./dist/server.js" ]
EXPOSE 8080
