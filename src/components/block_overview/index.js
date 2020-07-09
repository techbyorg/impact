import { z } from 'zorium'
import * as _ from 'lodash-es'

import FormatService from 'frontend-shared/services/format'

if (typeof window !== 'undefined') { require('./index.styl') }

export default function $blocksOverview ({ timeScale, block }) {
  return z('.z-block-overview', [
    z('.metrics', _.map(block.metrics.nodes, (metric) => {
      const allDimension = _.find(metric.dimensions?.nodes, { slug: 'all' })
      const count = allDimension?.datapoints?.nodes[0]?.count || 0

      return [
        // server sums all into 1 datapoint for 'overview' type blocks
        z('.metric-value', FormatService.unit(count, metric.unit)),
        z('.metric-name', metric.name)
      ]
    }))
  ])
}
