FROM golang:alpine3.19

RUN apk add --no-cache hugo git

WORKDIR /site

COPY hugo-blog .

RUN git config --global init.defaultBranch master && git init &&  git submodule add https://github.com/alex-shpak/hugo-book themes/hugo-book

# Resolve hugo-book inconsistent version
RUN cd themes/hugo-book/ && git checkout da22a41f609c74b9720b6d7b5eda334882da0d28 && cd ../..

ENTRYPOINT hugo server -D --bind "0.0.0.0"
