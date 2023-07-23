FROM node:latest

COPY ./app/ /app/data/

WORKDIR /app/data/

RUN npm install

CMD ["npm", "run", "start:dev"]

EXPOSE 3000