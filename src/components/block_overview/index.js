import { z } from 'zorium'
import * as _ from 'lodash-es'

import DateService from 'frontend-shared/services/date'
import FormatService from 'frontend-shared/services/format'

if (typeof window !== 'undefined') { require('./index.styl') }

export default function $blocksOverview ({ timeScale, block }) {
  return z('.z-block-overview', [
    z('.metrics', _.map(block.metrics.nodes, (metric) => {
      const allDimension = _.find(metric.dimensions.nodes, { slug: 'all' })
      let count = allDimension.datapoints.nodes[0]?.count || 0
      if (metric.unit === 'second') {
        count = DateService.secondsToMinutes(count)
      }
      console.log('count', count)
      return z('.metric', [
        // server sums all into 1 datapoint for 'overview' type blocks
        z('.value',
          FormatService.abbreviateNumber(count)
        ),
        z('.name', metric.name)
      ])
    }))
  ])
}
