FROM  node:20-alpine AS base 

RUN apk update 
RUN apk upgrade
RUN apk add --no-cache ffmpeg
WORKDIR /app



COPY package.json .
RUN  npm install
COPY . .

COPY index.js .



CMD [ "npm","start" ] 