FROM node:12-alpine

LABEL author="Nick Moignard" maintainer="nick@moignard.com"

RUN mkdir -p /app \
    && apk add --no-cache git

WORKDIR /app

COPY package-lock.json /app
COPY package.json /app
COPY patches /app

RUN /usr/local/bin/npm install

COPY . /app

RUN /usr/local/bin/npm run build

ENV NODE_ENV=production

VOLUME ["/app/db"]

ENTRYPOINT ["/usr/local/bin/npm"]
CMD ["start"]
