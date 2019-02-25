FROM node:8 as builder

ARG VUE_APP_BACKEND_URL
ENV VUE_APP_BACKEND_URL=$VUE_APP_BACKEND_URL

COPY . /frontend
WORKDIR /frontend/app
RUN npm i

RUN npm run build

FROM node:8-alpine

ENV PORT=8080
EXPOSE 8080

RUN apk --no-cache add ca-certificates
RUN mkdir /landmark-reg-app
WORKDIR /landmark-reg-app

RUN mkdir public
COPY --from=builder /frontend/app/dist ./public
COPY --from=builder /frontend/deploy .

RUN npm i

ENTRYPOINT ["node", "server/index.js"]
