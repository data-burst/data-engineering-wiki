FROM golang:1.22.1-bullseye

RUN apt update && \
    apt install -y hugo git

WORKDIR /site

COPY hugo-blog .

ENTRYPOINT hugo server -D --bind "0.0.0.0"
