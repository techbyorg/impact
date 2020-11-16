import { z, classKebab, useContext } from 'zorium'

import $blockChartBar from '../block_chart_bar'
import $blockChartLine from '../block_chart_line'
import $blockChartMap from '../block_chart_map'
import $blockChartPie from '../block_chart_pie'
import $blockOverview from '../block_overview'
import $icon from 'frontend-shared/components/icon'
import { editIconPath } from 'frontend-shared/components/icon/paths'

import context from '../../context'

if (typeof window !== 'undefined') { require('./index.styl') }

export default function $block (props) {
  const {
    timeScale, block, colors, hasEditPermission, editingBlockIdStream,
    isNewBlockDialogVisibleStream
  } = props
  const allColors = useContext(context).colors

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
    z('.top', [
      z('.name', block.name),
      hasEditPermission && z('.edit', z($icon, {
        icon: editIconPath,
        color: allColors.$bgText70,
        size: '14px',
        onclick: () => {
          editingBlockIdStream.next(block.id)
          isNewBlockDialogVisibleStream.next(true)
        }
      }))
    ]),
    z($chart, { timeScale, block, colors })
  ])
}
