import { z, useMemo } from 'zorium'
import * as _ from 'lodash-es'

import $chartLine from 'frontend-shared/components/chart_line'
import DateService from 'frontend-shared/services/date'
import FormatService from 'frontend-shared/services/format'

if (typeof window !== 'undefined') { require('./index.styl') }

const SCALES = {
  day: { format: '%b %d', precision: 'day' },
  week: { format: '%b %d', precision: 'day' },
  month: { format: '%B', precision: 'month' }
}
const MAX_MARGIN_LEFT_PX = 100

export default function $blockChartLine ({ timeScale, block, colors }) {
  const metric = block.metrics.nodes[0]

  const { data, marginLeft, isSingleDatapoint } = useMemo(() => {
    const dimension = metric.dimensions.nodes[0]
    const dimensionValues = _.groupBy(
      dimension.datapoints.nodes, 'dimensionValue'
    )
    const data = _.map(dimensionValues, (datapoints, dimensionValue) => ({
      id: dimensionValue,
      data: _.map(datapoints, ({ scaledTime, count }) => {
        const time = DateService.scaledTimeToUTC(scaledTime)

        return { x: time, y: count || 0 }
      })
    }))

    const longestLabel = _.max(_.map(data, ({ data }) => {
      const countLengths = _.map(data, ({ y }) => {
        const yFormatted = FormatService.unit(y, metric.unit, 'graph')
        return `${yFormatted}`.length
      })
      return _.max(countLengths)
    }))
    const marginLeft = Math.min(28 + longestLabel * 5, MAX_MARGIN_LEFT_PX)

    const mostDatapoints = _.max(_.map(data, ({ data }) => data.length))
    const isSingleDatapoint = mostDatapoints === 1

    return {
      data, marginLeft, isSingleDatapoint
    }
  })

  console.log('line', block.name, marginLeft, isSingleDatapoint, data)

  const scale = SCALES[timeScale]
  const xCount = data[0]?.data.length || 0
  const xTicksCount = Math.min(xCount, 4)
  const xTickFreq = Math.round(xCount / xTicksCount)

  return z('.z-block-chart-line', [
    !_.isEmpty(data) &&
      z($chartLine, {
        key: block.id,
        data,
        chartOptions: {
          colors,
          enableGridY: false,
          pointSize: isSingleDatapoint ? 6 : 0,
          lineWidth: 3,
          margin: {
            left: marginLeft
          },
          xScale: {
            type: 'time',
            format: 'native',
            useUTC: true,
            precision: scale.precision
          },
          xFormat: `time:${scale.format}`,
          yFormat: (val) => FormatService.unit(val, metric.unit, 'graph'),
          axisLeft: {
            tickValues: 5,
            format: (val) => FormatService.unit(val, metric.unit, 'graph')
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
