FROM node:20

ARG NODE_ENV
ARG NODE_METRICS_ADDRESS
ENV NODE_ENV ${NODE_ENV:-production}
ENV NODE_METRICS_ADDRESS ${NODE_METRICS_ADDRESS}

WORKDIR /usr/src/app

ADD package.json /usr/src/app
RUN npm install --omit=dev

COPY config /usr/src/app/config

COPY build /usr/src/app/build

ADD start.sh /usr/src/app
RUN chmod +x /usr/src/app/start.sh

CMD ["/usr/src/app/start.sh"]

EXPOSE 5003
EXPOSE 5004
