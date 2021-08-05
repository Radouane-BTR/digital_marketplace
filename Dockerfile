FROM docker.io/node:lts-alpine AS base
RUN apk add --update --no-cache python3 build-base
COPY package.json package.json
COPY package-lock.json package-lock.json
WORKDIR /usr/app

FROM base AS development
RUN npm install -g pm2
RUN npm install
COPY . /usr/app
ENV NODE_ENV=development
RUN chmod -R 775 /usr/app
RUN chown -R node:root /usr/app
EXPOSE 3000
CMD npm i && pm2-runtime ecosystem.config.js

FROM docker.io/node:lts-alpine AS production
RUN npm ci
COPY . /usr/app
ENV NODE_ENV=production
RUN npm run front-end:build
RUN npm run back-end:build
EXPOSE 3000
USER node
CMD npm start