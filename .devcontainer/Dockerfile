FROM node:12-alpine

RUN apk add --update --no-cache git ca-certificates openssl openssh
RUN npm install -g rollup
RUN npm install --save @types/screeps
run yarn add --dev eslint-plugin-prettier eslint-config-prettier prettier

# loop is rollup -cw --environment DEST:main
