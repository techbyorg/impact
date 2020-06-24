const fs = require('fs')
const path = require('path')

const config = require('./babel.config')

// ignore all node_modules except non-es5 (ones that don't have cjs exports)
config.ignore = [new RegExp(
  fs.readFileSync(path.resolve('./.non_es5'), 'utf-8').slice(1, -2)
)]

require('@babel/register')(config)
