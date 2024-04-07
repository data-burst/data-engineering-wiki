FROM golang:alpine3.19

RUN apk add --no-cache hugo git

WORKDIR /site

COPY hugo-blog .

RUN git config --global init.defaultBranch master && git init &&  git submodule add https://github.com/alex-shpak/hugo-book themes/hugo-book

ENTRYPOINT hugo server -D --bind "0.0.0.0"
