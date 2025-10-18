FROM node:24

WORKDIR /app
COPY ./package.json ./
COPY ./prisma ./prisma

RUN npm install -g pnpm && pnpm install

COPY . .
RUN pnpm build && CI=true pnpm prune --prod

# ENTRYPOINT ["/app/setup.sh"]

EXPOSE 3000

CMD ["pnpm", "start"]
