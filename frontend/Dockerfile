FROM node:latest

COPY ./angular /app/data/

COPY ./scripts/script.sh /tmp

WORKDIR /app/data/

CMD ["bash", "/tmp/script.sh"]

EXPOSE 4200
