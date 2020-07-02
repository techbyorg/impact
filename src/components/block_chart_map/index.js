import { z } from 'zorium'

import $chartUsMap from 'frontend-shared/components/chart_us_map'

if (typeof window !== 'undefined') { require('./index.styl') }

export default function $blockChartMap ({ metric, colors }) {
  const data = []

  return z('.z-block-chart-map', [
    z($chartUsMap, {
      data
    })
  ])
}
