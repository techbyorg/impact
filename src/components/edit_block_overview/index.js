import { z, useContext, useMemo, useStream } from 'zorium'
import * as Rx from 'rxjs'
import * as rx from 'rxjs/operators'
import * as _ from 'lodash-es'

import $button from 'frontend-shared/components/button'
import $dropdown from 'frontend-shared/components/dropdown'
import $input from 'frontend-shared/components/input'

import context from '../../context'

if (typeof window !== 'undefined' && window !== null) {
  require('./index.styl')
}

export default function $editBlockOverview (props) {
  const { dashboardId, blockStream, onSave } = props
  const { lang, model, router } = useContext(context)

  const {
    nameStreams, metricStreams, metricsStream, typeStreams
  } = useMemo(() => {
    const nameStreams = new Rx.ReplaySubject(1)
    nameStreams.next(blockStream.pipe(
      rx.map((block) => block?.name || '')
    ))

    const typeStreams = new Rx.ReplaySubject(1)
    typeStreams.next(blockStream.pipe(
      rx.map((block) => block?.settings?.type || '')
    ))

    const metricsStream = model.metric.getAll().pipe(
      rx.map(({ nodes }) => nodes)
    )
    const blockAndMetricsStream = Rx.combineLatest(blockStream, metricsStream)
    const metricStreams = new Rx.ReplaySubject(1)
    metricStreams.next(blockAndMetricsStream.pipe(
      rx.map(([block, metrics]) => block?.metricIds[0].id || metrics?.[0]?.id)
    ))

    return {
      blockStream,
      nameStreams,
      metricStreams,
      metricsStream,
      typeStreams
    }
  }, [])

  const {
    block, name, metric, metrics, type
  } = useStream(() => ({
    block: blockStream,
    name: nameStreams.pipe(rx.switchAll()),
    metric: metricStreams.pipe(rx.switchAll()),
    metrics: metricsStream,
    type: typeStreams.pipe(rx.switchAll())
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
      metricIds: [{ id: metric }],
      settings: { type }
    }
    if (dashboardId) {
      diff.dashboardId = dashboardId
    }
    await model.block.upsert(diff)
    onSave?.()
  }

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
        { value: 'pie', text: lang.get('blockType.pie') }
      ]
    })),
    z('.input', z($dropdown, {
      valueStreams: metricStreams,
      isFullWidth: true,
      options: _.map(metrics, ({ id, name }) => ({
        value: id, text: name
      }))
    })),
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
