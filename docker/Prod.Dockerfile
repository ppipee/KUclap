# Building stage
FROM node:14.2-slim as builder
WORKDIR /usr/src/app

ARG URL_API
ARG SERVER_PORT
ARG SSR

COPY package.json ./
COPY *.js ./
COPY src src/
COPY .babelrc ./
RUN printf "URL_API=\"$URL_API\"\nSERVER_PORT=$SERVER_PORT\nSSR=$SSR\n" > .env.production
RUN npm install
RUN npm run build:prod_prd

# Starting stage
FROM node:14.2-slim
WORKDIR /usr/src/app
COPY --from=builder /usr/src/app/ .
RUN ls -al
EXPOSE 8000 8000
CMD [ "npm", "run", "start:prod"]