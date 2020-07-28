#!/bin/sh
[ -z "$NODE_ENV" ] && export NODE_ENV=development

node_modules/webpack-dev-server/bin/webpack-dev-server.js  --config-register ~/dev/impact/babel.register.config.js &
node_modules/nodemon/bin/nodemon.js -r ~/dev/impact/babel.register.config.js ./bin/dev_server.js
