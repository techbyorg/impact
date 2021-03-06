import { z } from 'zorium'
import * as _ from 'lodash-es'

import $chartUsMap from 'frontend-shared/components/chart_us_map'

if (typeof window !== 'undefined') { require('./index.styl') }

export default function $blockChartMap ({ block, colors }) {
  const dimensions = block.metrics.nodes[0].dimensions.nodes
  const data = _.map(
    dimensions[0].datapoints.nodes,
    ({ dimensionValue, count }) => ({ id: dimensionValue, value: count })
  )

  return z('.z-block-chart-map', [
    z('.map', [
      z($chartUsMap, {
        key: block.id,
        data
      })
    ])
  ])
}
