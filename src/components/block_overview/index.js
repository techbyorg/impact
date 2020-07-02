import { z } from 'zorium'
import * as _ from 'lodash'

if (typeof window !== 'undefined') { require('./index.styl') }

export default function $blocksOverview ({ timeScale, block }) {
  return z('.z-block-overview', [
    z('.metrics', _.map(block.metrics.nodes, (metric) =>
      z('.metric', [
        // server sums all into 1 datapoint for 'overview' type blocks
        z('.value', metric.datapoints.nodes[0].count),
        z('.name', metric.name)
      ])
    ))
  ])
}
