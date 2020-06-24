FROM node:14.3.0

# package-lock.json, package.json
COPY *.json /tmp/
RUN mkdir -p /opt/app && \
    cd /opt/app && \
    cp /tmp/package-lock.json . && \
    cp /tmp/package.json . && \
    npm install --production --unsafe-perm --loglevel warn

COPY . /opt/app

WORKDIR /opt/app

CMD ["npm", "start"]
