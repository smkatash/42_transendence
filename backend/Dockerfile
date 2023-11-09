FROM node:20-alpine3.18

WORKDIR /app-backend

EXPOSE 3000

RUN npm cache clean --force

CMD npm install && npm run start:dev
