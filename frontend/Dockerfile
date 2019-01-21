FROM node:8

ARG backendUrl

COPY . /frontend
WORKDIR /frontend/app
RUN npm i
RUN npm run build

ENV VUE_APP_BACKEND_URL=$backendUrl

ENV PORT=8080
EXPOSE 8080

ENTRYPOINT ["node", "server.js"]