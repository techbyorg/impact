import { z } from 'zorium'
import * as _ from 'lodash'

import $chartLine from 'frontend-shared/components/chart_line'

if (typeof window !== 'undefined') { require('./index.styl') }

export default function $metricChart ({ metric, colors }) {
  // TODO: useMemo?
  const data = [{
    id: 'main',
    data: _.map(metric.datapoints, ({ scaledTime, value }) => {
      const time = scaledTime.replace('DAY-', '') // FIXME
      return { x: time, y: value || 0 }
    })
  }]

  console.log('data', data[0].data)

  return z('.z-metric-chart', [
    z('.name', metric.name),
    z($chartLine, {
      data,
      chartOptions: {
        colors,
        enableGridY: false,
        pointSize: 0,
        lineWidth: 3,
        margin: {
          left: 30
        },
        xScale: {
          type: 'time',
          format: '%Y-%m-%d',
          useUTC: true,
          precision: 'day'
        },
        xFormat: 'time:%b %d',
        axisLeft: {
          tickValues: 5
        },
        axisBottom: {
          format: '%b %d',
          tickValues: 4
        }
      }
    })
  ])
}
