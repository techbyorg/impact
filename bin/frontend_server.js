#!/usr/bin/env node
import * as _ from 'lodash-es'
import cluster from 'cluster'
import os from 'os'

import app from '../server'
import config from '../src/config'

// if (cluster.isMaster) {
//   _.map(_.range(os.cpus().length), () => cluster.fork())

//   cluster.on('exit', function (worker) {
//     console.log({
//       event: 'cluster_respawn',
//       message: `Worker ${worker.id} died, respawning`
//     })
//     return cluster.fork()
//   })
// } else {
app.listen(config.PORT, () => console.log({
  event: 'cluster_fork',
  message: `Worker , listening on port ${config.PORT}`
}))
// }
