import { z } from 'zorium'
import * as _ from 'lodash-es'

import $chartPie from 'frontend-shared/components/chart_pie'

if (typeof window !== 'undefined') { require('./index.styl') }

export default function $blockChartPie ({ block, colors }) {
  const dimensions = block.metrics.nodes[0].dimensions.nodes
  console.log('dim', dimensions)
  const data = _.map(
    dimensions[0].datapoints.nodes,
    ({ dimensionValue, count }) => ({ id: dimensionValue, value: count })
  )

  console.log('data', data)

  return z('.z-block-chart-pie', [
    z($chartPie, {
      key: block.id,
      data,
      colors
    })
  ])
}
