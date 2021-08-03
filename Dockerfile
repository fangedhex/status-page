FROM node:lts-alpine
RUN apk add --no-cache curl \
&& curl -f https://get.pnpm.io/v6.7.js | node - add --global pnpm
WORKDIR /app
ADD . .
RUN pnpm install
CMD ["pnpm", "dev"]
EXPOSE 8080
