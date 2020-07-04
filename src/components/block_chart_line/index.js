import { z, useMemo } from 'zorium'
import * as _ from 'lodash-es'

import $chartLine from 'frontend-shared/components/chart_line'
import DateService from 'frontend-shared/services/date'

if (typeof window !== 'undefined') { require('./index.styl') }

const SCALES = {
  day: { format: '%b %d', precision: 'day' },
  week: { format: '%b %d', precision: 'day' },
  month: { format: '%B', precision: 'month' }
}

export default function $blockChartLine ({ timeScale, block, colors }) {
  const data = useMemo(() => {
    const metric = block.metrics.nodes[0]
    const dimension = metric.dimensions.nodes[0]
    const dimensionValues = _.groupBy(
      dimension.datapoints.nodes, 'dimensionValue'
    )
    return _.map(dimensionValues, (datapoints, dimensionValue) => ({
      id: dimensionValue,
      data: _.map(datapoints, ({ scaledTime, count }) => {
        const time = DateService.scaledTimeToUTC(scaledTime)

        if (metric.unit === 'second') {
          count = DateService.secondsToMinutes(count)
        }

        return { x: time, y: count || 0 }
      })
    }))
  })

  console.log('line', data)

  const scale = SCALES[timeScale]
  const xCount = data[0]?.data.length || 0
  const xTicksCount = Math.min(xCount, 4)
  const xTickFreq = Math.round(xCount / xTicksCount)

  return z('.z-block-chart-line', [
    z($chartLine, {
      key: block.id,
      data,
      chartOptions: {
        colors,
        enableGridY: false,
        pointSize: 0,
        lineWidth: 3,
        margin: {
          left: 40
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
