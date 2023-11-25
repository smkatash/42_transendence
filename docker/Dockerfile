FROM node:20-alpine3.18

COPY ./script.sh /tmp

COPY ./replace_ng_env.sh /tmp

COPY ./dev.env .

RUN chmod +x /tmp/script.sh /tmp/replace_ng_env.sh

EXPOSE 3000

CMD ["/bin/sh", "/tmp/script.sh"]