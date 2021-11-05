FROM node:12-alpine

RUN apk add --update --no-cache git ca-certificates openssl openssh
RUN apk add --update python3 py3-pip build-base
RUN npm install -g rollup
RUN npm install --save @types/screeps
run npm install screeps
run npm install screepsmod-auth unique-names-generator
run yarn add --dev eslint-plugin-prettier eslint-config-prettier prettier
# loop is rollup -cw --environment DEST:main
