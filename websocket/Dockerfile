FROM node:21.7.1

RUN npm install -g pnpm

WORKDIR /usr/src/app

COPY package.json pnpm-lock.yaml websocket/server.ts .env types.ts tsconfig.json ./

RUN pnpm install

CMD ["pnpm", "dlx", "tsx", "server.ts"]
