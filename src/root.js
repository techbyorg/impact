import setup from 'frontend-shared/services/setup_client'

import $app from './app'
import Lang from './lang'
import Model from './models'
import colors from './colors'
import config from './config'

setup({ $app, Lang, Model, colors, config })
