
FROM node:24-alpine AS builder

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build

FROM node:24-alpine

RUN apk add --no-cache curl

WORKDIR /usr/src/app

ENV NODE_ENV=production



COPY package*.json ./

COPY prisma ./prisma/ 
RUN npx prisma generate  
COPY generated ./generated/
COPY prisma.config.ts /usr/src/app/prisma.config.ts

RUN npm ci --omit=dev

COPY --from=builder /usr/src/app/dist ./dist

COPY docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

ENTRYPOINT ["./docker-entrypoint.sh"]

EXPOSE 4000

CMD ["npm", "run", "start:prod"]