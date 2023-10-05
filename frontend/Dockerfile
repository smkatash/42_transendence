FROM node:20-alpine3.18

WORKDIR /app-frontend

RUN npm install -g @angular/cli
RUN npm install ngx-socket-io@3.2.0 --save

EXPOSE 4200

CMD npm install && npm run start