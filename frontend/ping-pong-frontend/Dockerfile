FROM node:latest

WORKDIR /app

COPY . /app

RUN npm install -g @angular/cli -y
RUN npm install

CMD ["ng", "serve", "--host", "0.0.0.0", "--disable-host-check"]


