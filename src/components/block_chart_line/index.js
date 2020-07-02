import { z } from 'zorium'
import * as _ from 'lodash'

import $chartLine from 'frontend-shared/components/chart_line'
import DateService from 'frontend-shared/services/date'

if (typeof window !== 'undefined') { require('./index.styl') }

const SCALES = {
  day: { format: '%b %d', precision: 'day' },
  week: { format: '%b %d', precision: 'day' },
  month: { format: '%B', precision: 'month' }
}

export default function $blockChartLine ({ timeScale, block, colors }) {
  // TODO: useMemo?
  const data = [{
    id: 'main',
    data: _.map(block.metrics.nodes[0].datapoints.nodes, ({ scaledTime, count }) => {
      const time = DateService.scaledTimeToUTC(scaledTime)

      return { x: time, y: count || 0 }
    })
  }]

  const scale = SCALES[timeScale]
  const xCount = data[0].data.length
  const xTicksCount = Math.min(xCount, 4)
  const xTickFreq = Math.round(xCount / xTicksCount)

  return z('.z-block-chart-line', [
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
          format: 'native',
          useUTC: true,
          precision: scale.precision
        },
        xFormat: `time:${scale.format}`,
        axisLeft: {
          tickValues: 5
        },
        axisBottom: {
          format: scale.format,
          // xTicks: <number> doesn't seem to work properly...
          tickValues: _.map(data[0].data, ({ x }, i) => {
            // Math.min(data[0].data.length, 4)
            if (!(i % xTickFreq)) { // || i === xCount - 1) {
              return x
            } else {
              return ''
            }
          })
        }
      }
    })
  ])
}
