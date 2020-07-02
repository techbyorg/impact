import { z } from 'zorium'

import $blockChartLine from '../block_chart_line'
import $blockChartMap from '../block_chart_map'
import $blockOverview from '../block_overview'

if (typeof window !== 'undefined') { require('./index.styl') }

export default function $block ({ timeScale, block, colors }) {
  const $chart = block.settings.type === 'us-map'
    ? $blockChartMap
    : block.settings.type === 'overview'
      ? $blockOverview
      : $blockChartLine

  return z('.z-block', [
    z('.name', block.name),
    z($chart, { timeScale, block, colors })
  ])
}
