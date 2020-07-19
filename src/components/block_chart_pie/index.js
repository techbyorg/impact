import { z, useMemo } from 'zorium'
import * as _ from 'lodash-es'

import $chartPie from 'frontend-shared/components/chart_pie'

if (typeof window !== 'undefined') { require('./index.styl') }

export default function $blockChartPie ({ block, colors }) {
  colors = colors.splice(1) // don't use branded color
  const dimensions = block.metrics.nodes[0].dimensions.nodes
  const data = useMemo(() => {
    const datapoints = _.orderBy(
      dimensions[0].datapoints.nodes, 'count', 'desc'
    )
    const sum = _.sumBy(datapoints, 'count')
    return _.map(datapoints, ({ dimensionValue, count }, i) => ({
      id: dimensionValue,
      value: count,
      percent: 100 * count / sum,
      color: colors[i % colors.length]
    }))
  }, [dimensions[0].datapoints.nodes[0]?.count])

  return z('.z-block-chart-pie', [
    z($chartPie, {
      key: block.id,
      data,
      colors,
      heightPx: 300
    })
  ])
}
