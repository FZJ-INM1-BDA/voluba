FROM node:8 as builder

ARG HOSTNAME
ARG VUE_APP_ALLOW_UPLOAD
ARG IV_HOST
ARG VUE_APP_BACKEND_URL
ARG VUE_APP_NONLINEAR_BACKEND
ARG VUE_APP_UPLOAD_URL
ARG PORT

ENV HOSTNAME=$HOSTNAME
ENV VUE_APP_ALLOW_UPLOAD=$VUE_APP_ALLOW_UPLOAD
ENV IV_HOST=$IV_HOST
ENV VUE_APP_BACKEND_URL=$VUE_APP_BACKEND_URL
ENV VUE_APP_NONLINEAR_BACKEND=$VUE_APP_NONLINEAR_BACKEND
ENV VUE_APP_UPLOAD_URL=$VUE_APP_UPLOAD_URL
ENV PORT=$PORT

COPY . /frontend
WORKDIR /frontend/app
RUN npm i

RUN npm run build

# gzipping container
FROM ubuntu:18.10 as compressor
RUN apt upgrade -y && apt update && apt install brotli

RUN mkdir -p /frontend/app
COPY --from=builder /frontend/app/dist /frontend/app/dist
WORKDIR /frontend/app/dist

RUN for f in $(find . -type f); do gzip < $f > $f.gz && brotli < $f > $f.br; done

# deploy container
FROM node:8-alpine

ENV NODE_ENV=production

ARG PORT
ENV PORT=${PORT:-8080}
EXPOSE ${PORT:-8080}

RUN apk --no-cache add ca-certificates
RUN mkdir /landmark-reg-app
WORKDIR /landmark-reg-app

RUN mkdir public
COPY --from=compressor /frontend/app/dist ./public
COPY --from=builder /frontend/deploy .

RUN npm i

ENTRYPOINT ["node", "server/server.js"]