FROM node:20-alpine3.18

WORKDIR /app-backend

EXPOSE 3000

RUN rm -rf node_modules

CMD npm install --legacy-peer-deps && npm run start:dev
