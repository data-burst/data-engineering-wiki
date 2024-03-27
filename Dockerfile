FROM alpine:3.19.1

RUN apk add --no-cache hugo git

WORKDIR /site

COPY hugo-blog .

RUN hugo

ENTRYPOINT hugo server -D --bind "0.0.0.0"

