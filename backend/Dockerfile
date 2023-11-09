FROM node:20-alpine3.18

COPY ./script.sh /tmp
RUN chmod +x /tmp/script.sh

EXPOSE 4200

CMD ["/bin/sh", "/tmp/script.sh"]
