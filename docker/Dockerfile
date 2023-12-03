FROM node:20-alpine3.18

COPY ./script.sh /tmp

RUN chmod +x /tmp/script.sh

EXPOSE 3000

CMD ["/bin/sh", "/tmp/script.sh"]