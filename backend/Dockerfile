FROM node:20-alpine3.18

WORKDIR /app-backend

EXPOSE 3000
RUN npm cache clean -force

CMD npm install --legacy-peer-deps && npm run start:dev