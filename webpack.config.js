import getConfig from 'frontend-shared-dev/dist/webpack_setup.js'

import paths from './webpack_paths'
import Lang from './src/lang'
import config from './src/config'

export default getConfig({ paths, Lang, config })
