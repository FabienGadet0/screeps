FROM node:12-alpine

RUN apk add --update --no-cache git ca-certificates openssl openssh
RUN apk add --update python3 py3-pip build-base
RUN npm install -g rollup
RUN npm install --save @types/screeps
RUN npm install screeps
RUN npm install screepsmod-auth unique-names-generator
RUN yarn add --dev eslint-plugin-prettier eslint-config-prettier prettier
# loop is rollup -cw --environment DEST:main
