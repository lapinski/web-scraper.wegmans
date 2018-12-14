FROM node:alpine

WORKDIR /scraper

COPY . /scraper
RUN yarn install
RUN yarn run build

CMD ["yarn", "start"]
