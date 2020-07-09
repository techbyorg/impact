import { z, classKebab } from 'zorium'

import $blockChartBar from '../block_chart_bar'
import $blockChartLine from '../block_chart_line'
import $blockChartMap from '../block_chart_map'
import $blockChartPie from '../block_chart_pie'
import $blockOverview from '../block_overview'

if (typeof window !== 'undefined') { require('./index.styl') }

export default function $block ({ timeScale, block, colors }) {
  const $chart = block.settings.type === 'us-map'
    ? $blockChartMap
    : block.settings.type === 'overview'
      ? $blockOverview
      : block.settings.type === 'bar'
        ? $blockChartBar
        : block.settings.type === 'pie'
          ? $blockChartPie
          : $blockChartLine

  const isPinned = block.settings.isPinned

  return z('.z-block', { className: classKebab({ isPinned }) }, [
    z('.name', block.name),
    z($chart, { timeScale, block, colors })
  ])
}
