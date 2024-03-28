FROM golang:alpine3.19

RUN apk add --no-cache hugo git

WORKDIR /site

COPY hugo-blog .

ENTRYPOINT hugo server -D --bind "0.0.0.0"
