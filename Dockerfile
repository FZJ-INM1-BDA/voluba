FROM node:12 as builder

ARG VUE_APP_ALLOW_UPLOAD=true
ARG VUE_APP_BACKEND_URL
ARG VUE_APP_NONLINEAR_BACKEND
ARG VUE_APP_UPLOAD_URL
ARG VUE_APP_DEBUG=false
ARG MATOMO_URL
ARG MATOMO_ID
ARG VUE_APP_ENABLE_EXPERIMENTAL_FEATURES

ENV MATOMO_URL=$MATOMO_URL
ENV MATOMO_ID=$MATOMO_ID
ENV VUE_APP_ALLOW_UPLOAD=$VUE_APP_ALLOW_UPLOAD

ENV VUE_APP_BACKEND_URL=$VUE_APP_BACKEND_URL
ENV VUE_APP_NONLINEAR_BACKEND=$VUE_APP_NONLINEAR_BACKEND
ENV VUE_APP_ENABLE_EXPERIMENTAL_FEATURES=$VUE_APP_ENABLE_EXPERIMENTAL_FEATURES
ENV VUE_APP_UPLOAD_URL=$VUE_APP_UPLOAD_URL
ENV VUE_APP_DEBUG=$VUE_APP_DEBUG

COPY . /frontend
WORKDIR /frontend/app
RUN npm i

RUN npm run build

# gzipping container
FROM ubuntu:22.04 as compressor
RUN apt upgrade -y && apt update && apt install brotli

RUN mkdir -p /frontend/app

# copy frontend
COPY --from=builder /frontend/app/dist /frontend/app/dist

WORKDIR /frontend/app/dist

RUN for f in $(find . -type f); do gzip < $f > $f.gz && brotli < $f > $f.br; done

# deploy container
FROM python:3.10-alpine
RUN pip install -U pip

COPY backend/requirements.txt requirements.txt
RUN pip install -r requirements.txt

COPY ./backend/voluba_backend /voluba
RUN chown -R nobody /voluba
WORKDIR /voluba

COPY --from=builder /frontend/app/dist /voluba/public
ENV PATH_TO_STATIC=/voluba/public

USER nobody

EXPOSE 8080
ENTRYPOINT uvicorn app:app --port 8080 --host 0.0.0.0
