FROM node:20-alpine3.18

WORKDIR /app-frontend

RUN npm cache clean -force

EXPOSE 4200

CMD npm install --legacy-peer-deps && npm run start