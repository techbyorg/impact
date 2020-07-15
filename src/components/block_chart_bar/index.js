import { z, useMemo } from 'zorium'
import * as _ from 'lodash-es'

import $chartBar from 'frontend-shared/components/chart_bar'

if (typeof window !== 'undefined') { require('./index.styl') }

const DAYS_OF_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const MAX_MARGIN_LEFT_PX = 100

export default function $blockChartBar ({ block, colors }) {
  const { data, marginLeft } = useMemo(() => {
    const dimensions = block.metrics.nodes[0].dimensions.nodes
    let data = _.map(
      dimensions[0].datapoints.nodes,
      ({ dimensionValue, count }) => ({ id: dimensionValue, value: count })
    )

    // FIXME: HACK: rm
    if (dimensions[0].slug === 'hour-of-day') {
      data = _.orderBy(data, ({ id }) => -1 * parseInt(id), 'asc')
    } else if (dimensions[0].slug === 'day-of-week') {
      data = _.orderBy(data, ({ id }) => {
        return -1 * DAYS_OF_WEEK.indexOf(id)
      })
    }

    const longestLabel = _.maxBy(data, ({ id }) => id.length)?.id.length
    const marginLeft = Math.min(28 + longestLabel * 5, MAX_MARGIN_LEFT_PX)

    return { data, marginLeft }
  })

  return z('.z-block-chart-bar', [
    !_.isEmpty(data) &&
      z($chartBar, {
        key: block.id,
        data,
        chartOptions: {
          colors,
          layout: 'horizontal',
          margin: {
            left: marginLeft
          }
        }
      })
  ])
}
