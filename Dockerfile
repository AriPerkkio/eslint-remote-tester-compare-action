FROM node:18-alpine

COPY dist/index.js /index.js

RUN apk add --no-cache git

ENTRYPOINT [ "node", "/index.js" ]