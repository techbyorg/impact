import { z, useContext, useMemo, useStream } from 'zorium'
import * as Rx from 'rxjs'
import * as rx from 'rxjs/operators'
import * as _ from 'lodash-es'

import $button from 'frontend-shared/components/button'
import $dropdown from 'frontend-shared/components/dropdown'
import $dropdownMultiple from 'frontend-shared/components/dropdown_multiple'
import $input from 'frontend-shared/components/input'
import { streams } from 'frontend-shared/services/obs'
import DateService from 'frontend-shared/services/date'

import $block from '../block'
import context from '../../context'

if (typeof window !== 'undefined' && window !== null) {
  require('./index.styl')
}

export default function $editBlockOverview (props) {
  const { dashboardId, blockStream, onSave } = props
  const { lang, model, router } = useContext(context)

  const {
    nameStreams, selectedMetricIdsStreams, typeStreams, previewBlockStream,
    optionsStream
  } = useMemo(() => {
    const nameStreams = streams(blockStream.pipe(
      rx.map((block) => block?.name || '')
    ))

    const typeStreams = streams(blockStream.pipe(
      rx.map((block) => block?.settings?.type || '')
    ))

    const metricsStream = model.metric.getAll().pipe(
      rx.map(({ nodes }) => nodes)
    )
    const blockAndMetricsStream = Rx.combineLatest(blockStream, metricsStream)
    const selectedMetricIdsStreams = streams(blockAndMetricsStream.pipe(
      rx.map(([block, metrics]) =>
        block ? _.map(block?.metricIds, 'id') : [metrics?.[0]?.id]
      )
    ))

    const previewBlockStream = Rx.combineLatest(
      blockStream,
      typeStreams.stream,
      selectedMetricIdsStreams.stream
    ).pipe(
      rx.switchMap(([block, type, metricIds]) => {
        const presetDates = DateService.getDatesFromPresetDateRange('30days')
        return block ? model.block.getByIdWithDatapoints(block.id, {
          type,
          metricIds: _.map(metricIds, (id) => ({ id })),
          timeScale: 'day',
          startDate: DateService.format(presetDates.startDate, 'yyyy-mm-dd'),
          endDate: DateService.format(presetDates.endDate, 'yyyy-mm-dd')
        }) : Rx.of(null)
      })
    )

    const optionsStream = metricsStream.pipe(
      rx.map((metrics) => _.map(metrics, ({ id, name }) => ({
        value: id, text: name
      })))
    )

    return {
      blockStream,
      previewBlockStream,
      nameStreams,
      selectedMetricIdsStreams,
      typeStreams,
      optionsStream
    }
  }, [])

  const {
    block, previewBlock, name, selectedMetricIds, type
  } = useStream(() => ({
    block: blockStream,
    previewBlock: previewBlockStream,
    name: nameStreams.stream,
    selectedMetricIds: selectedMetricIdsStreams.stream,
    type: typeStreams.stream
  }))

  const deleteBlock = async () => {
    if (confirm(lang.get('general.areYouSure'))) {
      await model.block.deleteById(block.id)
      router.back()
    }
  }

  const createBlock = async () => {
    const diff = {
      id: block?.id,
      dashboardId: dashboardId,
      name: name,
      metricIds: _.map(_.filter(selectedMetricIds), (id) => ({ id })),
      settings: { type }
    }
    if (dashboardId) {
      diff.dashboardId = dashboardId
    }
    await model.block.upsert(diff)
    onSave?.()
  }

  console.log('block', block)

  return z('.z-edit-block-overview', [
    z('.input', z($input, {
      valueStreams: nameStreams,
      placeholder: lang.get('general.name'),
      type: 'text',
      isFullWidth: true
    })),
    z('.input', z($dropdown, {
      valueStreams: typeStreams,
      isFullWidth: true,
      options: [
        { value: 'line', text: lang.get('blockType.line') },
        { value: 'bar', text: lang.get('blockType.bar') },
        { value: 'pie', text: lang.get('blockType.pie') },
        { value: 'overview', text: lang.get('blockType.overview') }
      ]
    })),
    z('.input', z($dropdownMultiple, {
      valuesStreams: selectedMetricIdsStreams,
      isFullWidth: true,
      optionsStream
    })),
    z('.preview', [
      previewBlock && z($block, {
        timeScale: 'week',
        block: _.defaultsDeep({ name }, previewBlock)
        // colors: [colors.getRawColor(colors.$primaryMain)].concat(gColors)
      })
    ]),
    z('.actions', [
      block && z($button, {
        text: lang.get('general.delete'),
        onclick: deleteBlock,
        shouldHandleLoading: true,
        isFullWidth: false
      }),
      z($button, {
        text: lang.get('general.save'),
        isPrimary: true,
        onclick: createBlock,
        shouldHandleLoading: true,
        isFullWidth: false
      })
    ])
  ])
};
