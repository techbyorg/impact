import Cache from 'frontend-shared/service_worker/cache'
import Portal from 'frontend-shared/service_worker/portal'
import Push from 'frontend-shared/service_worker/push'

import config from '../config'

const push = new Push({ cdnUrl: config.CDN_URL, host: config.HOST })
push.listen()

const cache = new Cache()
cache.listen()

const portal = new Portal({ cache })
portal.listen()

self.onerror = function (message, file, line, column, error) {
  // if we log with `new Error` it's pretty pointless (gives error message that
  // just points to this line). if we pass the 5th argument (error), it breaks
  // on json.stringify
  const err = { message, file, line, column }
  return fetch(config.API_URL + '/log', {
    method: 'POST',
    headers: {
      'Content-Type': 'text/plain'
    }, // Avoid CORS preflight
    body: JSON.stringify({
      event: 'client_error',
      trace: null, // trace
      error: 'INSIDE SW ERR' + JSON.stringify(err)
    })
  }).catch((err) =>
    console.log('logs post', err)
  )
}
