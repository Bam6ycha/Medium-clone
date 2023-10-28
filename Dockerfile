FROM node:18-alpine3.14

WORKDIR /app

COPY prisma/ .
COPY package*.json .

RUN npm install && npm audit fix && npm cache clean --force

COPY . .
RUN npm run build

EXPOSE 8080
CMD [ "npm","run","start:prod" ]

