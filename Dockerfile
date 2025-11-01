FROM node:24

WORKDIR /app
COPY ./package.json ./
COPY ./prisma ./prisma

RUN npm install -g pnpm && pnpm install

COPY . .
RUN pnpm build
RUN pnpm exec playwright install --with-deps
RUN CI=true pnpm prune --prod

# ENTRYPOINT ["/app/setup.sh"]

ENV PLAYWRIGHT_BASE_URL=http://localhost:3000

EXPOSE 3000

CMD ["pnpm", "start"]
