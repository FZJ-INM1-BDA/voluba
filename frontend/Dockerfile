FROM node:8

ARG VUE_APP_BACKEND_URL
ENV VUE_APP_BACKEND_URL=$VUE_APP_BACKEND_URL

COPY . /frontend
WORKDIR /frontend/app
RUN npm i

# terser build error temp fix
# https://github.com/vuejs/vue-cli/issues/3407
# https://github.com/terser-js/terser/pull/254
RUN npm i terser@3.14

RUN npm run build

ENV PORT=8080
EXPOSE 8080

ENTRYPOINT ["node", "server.js"]