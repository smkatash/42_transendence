FROM node:20-alpine3.18

WORKDIR /app-frontend

EXPOSE 4200

RUN npm cache clean --force

CMD npm install && npm run start