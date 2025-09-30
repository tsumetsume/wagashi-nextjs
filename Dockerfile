FROM node:22

WORKDIR /app
COPY ./package.json ./
COPY ./prisma ./prisma

RUN npm install -g pnpm

RUN pnpm install
RUN pnpm db:generate

COPY . .
RUN pnpm build
RUN pnpm prune --prod

# 初回セットアップのときだけ
RUN ./setup.sh

EXPOSE 3000

CMD ["pnpm", "start"]