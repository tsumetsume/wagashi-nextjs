FROM node:22

WORKDIR /app
COPY ./package.json ./pnpm-lock.yaml ./

RUN npm install -g pnpm

RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm build
RUN pnpm prune --prod

EXPOSE 3000

CMD ["pnpm", "start"]