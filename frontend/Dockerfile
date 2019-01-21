FROM node:8

COPY ./frontend /frontend
WORKDIR /frontend/app
RUN npm i
RUN npm run build

ENV PORT=3001
EXPOSE 3001

ENTRYPOINT ["node", "server.js"]