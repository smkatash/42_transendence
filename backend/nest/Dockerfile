FROM node:latest

COPY ./app/ /app/data/

COPY ./tools/script.sh /tmp

WORKDIR /app/data/

# RUN npm install

CMD ["bash", "/tmp/script.sh"]

EXPOSE 3000