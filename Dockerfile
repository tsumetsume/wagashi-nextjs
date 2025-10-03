FROM node:22

WORKDIR /app
COPY ./package.json ./
COPY ./prisma ./prisma

RUN npm install -g pnpm && pnpm install

COPY . .
RUN pnpm build && pnpm prune 

#ENTRYPOINT ["/app/setup.sh"]

EXPOSE 3000

CMD ["pnpm", "start"]
