FROM alpine:3.20

ARG HUGO_VERSION=0.163.0
ARG HUGO_BOOK_COMMIT=7875ae6

RUN apk add --no-cache git curl ca-certificates \
 && curl -fsSL "https://github.com/gohugoio/hugo/releases/download/v${HUGO_VERSION}/hugo_${HUGO_VERSION}_linux-amd64.tar.gz" | tar -xz -C /usr/local/bin hugo

WORKDIR /site

COPY hugo-blog .

# Theme is a git submodule; fetch it at the pinned commit so the build doesn't depend on the checkout.
RUN rm -rf themes/hugo-book \
 && git clone -q https://github.com/alex-shpak/hugo-book themes/hugo-book \
 && git -C themes/hugo-book checkout -q ${HUGO_BOOK_COMMIT}

EXPOSE 1313

# --baseURL/--appendPort keep canonical, Open Graph and sitemap URLs pointing at the real domain.
ENTRYPOINT ["hugo", "server", "--bind", "0.0.0.0", "--baseURL", "https://wiki.databurst.tech/", "--appendPort=false", "--disableLiveReload", "--environment", "production"]
