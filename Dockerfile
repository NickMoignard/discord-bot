FROM node:12-alpine

LABEL author="Nick Moignard" maintainer="nick@moignard.com"

RUN mkdir -p /usr/src/app \
    && apk add --no-cache git

WORKDIR /usr/src/app

COPY package-lock.json /usr/src/app
COPY package.json /usr/src/app
COPY patches /usr/src/app

RUN npm install

COPY . .

RUN npm run build

EXPOSE 3000

ENV NODE_ENV=production

VOLUME ["/app/db"]

ENTRYPOINT ["/usr/local/bin/npm"]
CMD ["start"]
