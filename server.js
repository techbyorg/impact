// react/react-dom -> preact
import 'module-alias/register'

import setup from 'frontend-shared/services/setup_server'

import colors from './src/colors'
import config from './src/config'
import webpackPaths from './webpack_paths'
import $app from './src/app'
import Lang from './src/lang'
import Model from './src/models'

const app = setup({ config, colors, webpackPaths, $app, Lang, Model })

export default app
