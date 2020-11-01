// process.env.* is replaced at run-time with * environment variable
// Note that simply env.* is not replaced, and thus suitible for private config

import * as _ from 'lodash-es'
import assertNoneMissing from 'assert-none-missing/index.js'

let API_HOST, API_PATH, config

// Don't let server environment variables leak into client code
const serverEnv = process?.env

const HOST = process.env.IMPACT_HOST || '127.0.0.1'
const HOSTNAME = HOST.split(':')[0]

const API_URL =
  serverEnv.PHIL_API_URL || // server
  process.env.PUBLIC_PHIL_API_URL // client

const DEV_USE_HTTPS = process.env.DEV_USE_HTTPS && (process.env.DEV_USE_HTTPS !== '0')
const isUrl = API_URL.indexOf('/') !== -1
if (isUrl) {
  const API_HOST_ARRAY = API_URL.split('/')
  API_HOST = API_HOST_ARRAY[0] + '//' + API_HOST_ARRAY[2]
  API_PATH = API_URL.replace(API_HOST, '')
} else {
  API_HOST = API_URL
  API_PATH = ''
}

const CDN_URL = 'https://tdn.one/assets/images'

// All keys must have values at run-time (value may be null)
const isomorphic = {
  APP_KEY: 'impact',
  APP_NAME: 'TechBy',
  LANGUAGES: ['en'],

  // ALSO IN PHIL
  EMPTY_UUID: '00000000-0000-0000-0000-000000000000',
  CDN_URL,
  // d folder has longer cache
  SCRIPTS_CDN_URL: 'https://tdn.one/scripts',
  UGC_CDN_URL: 'https://tdn.one/ugc',
  FAVICON_URL: `${CDN_URL}/favicon.png?1`,
  ICON_256_URL: `${CDN_URL}/web_icon_256.png`,
  IOS_APP_URL: 'FIXME', // FIXME
  GOOGLE_PLAY_APP_URL: 'FIXME', // FIXME
  GOOGLE_ANALYTICS_ID: 'UA-168233278-1',
  HOST,
  API_URL,
  PUBLIC_API_URL: process.env.PUBLIC_PHIL_API_URL,
  API_HOST,
  API_PATH,
  DEFAULT_NOTIFICATIONS: {},
  FIREBASE: {
    API_KEY: process.env.FIREBASE_API_KEY,
    AUTH_DOMAIN: process.env.FIREBASE_AUTH_DOMAIN,
    DATABASE_URL: process.env.FIREBASE_DATABASE_URL,
    PROJECT_ID: process.env.FIREBASE_PROJECT_ID,
    MESSAGING_SENDER_ID: process.env.FIREBASE_MESSAGING_SENDER_ID
  },
  DEV_USE_HTTPS,
  AUTH_COOKIE: 'accessToken',
  ENV:
    serverEnv.NODE_ENV ||
    process.env.NODE_ENV,
  ENVS: {
    DEV: 'development',
    PROD: 'production',
    TEST: 'test'
  }
}

// Server only
// All keys must have values at run-time (value may be null)
const PORT = serverEnv.IMPACT_PORT || 3000
const WEBPACK_DEV_PORT = serverEnv.WEBPACK_DEV_PORT || (parseInt(PORT) + 1)
const WEBPACK_DEV_PROTOCOL = DEV_USE_HTTPS ? 'https://' : 'http://'

const server = {
  PORT,

  // Development
  WEBPACK_DEV_PORT,
  WEBPACK_DEV_PROTOCOL,
  WEBPACK_DEV_URL: serverEnv.WEBPACK_DEV_URL ||
    `${WEBPACK_DEV_PROTOCOL}${HOSTNAME}:${WEBPACK_DEV_PORT}`,
  SELENIUM_TARGET_URL: serverEnv.SELENIUM_TARGET_URL || null,
  REMOTE_SELENIUM: serverEnv.REMOTE_SELENIUM === '1',
  SELENIUM_BROWSER: serverEnv.SELENIUM_BROWSER || 'chrome',
  SAUCE_USERNAME: serverEnv.SAUCE_USERNAME || null,
  SAUCE_ACCESS_KEY: serverEnv.SAUCE_ACCESS_KEY || null
}

assertNoneMissing(isomorphic)
if (typeof window !== 'undefined' && window !== null) {
  // TODO: esm?
  config = isomorphic
} else {
  assertNoneMissing(server)
  // TODO: esm?
  config = _.merge(isomorphic, server)
}

export default config
