FROM node:20 as builder

COPY . /app
WORKDIR /app/frontend
RUN npm i
RUN npm run build

# gzipping container
FROM ubuntu:22.04 as compressor
RUN apt upgrade -y && apt update && apt install brotli

RUN mkdir -p /app/frontend

# copy frontend
COPY --from=builder /app/frontend/dist /app/frontend/dist

WORKDIR /app/frontend/dist

RUN for f in $(find . -type f); do gzip < $f > $f.gz && brotli < $f > $f.br; done

# deploy container
FROM python:3.10-alpine
RUN pip install -U pip

COPY backend/requirements.txt requirements.txt
RUN pip install -r requirements.txt

COPY ./backend/voluba_backend /voluba
RUN chown -R nobody /voluba
WORKDIR /voluba

COPY --from=compressor /app/frontend/dist/frontend /voluba/public
ENV PATH_TO_STATIC=/voluba/public

USER nobody

EXPOSE 8080
ENTRYPOINT uvicorn app:app --port 8080 --host 0.0.0.0
