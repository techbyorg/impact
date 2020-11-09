import { z, useContext, useMemo, useStream } from 'zorium'
import * as Rx from 'rxjs'
import * as rx from 'rxjs/operators'
import * as _ from 'lodash-es'

import $button from 'frontend-shared/components/button'
import $dialog from 'frontend-shared/components/dialog'
import $dropdown from 'frontend-shared/components/dropdown'
import $input from 'frontend-shared/components/input'

import context from '../../context'

if (typeof window !== 'undefined' && window !== null) {
  require('./index.styl')
}

export default function $newBlockDialog ({ dashboardId, onClose }) {
  const { lang, model } = useContext(context)

  const { nameStream, metricStreams, metricsStream, typeStream } = useMemo(() => {
    const metricsStream = model.metric.getAll().pipe(
      rx.map(({ nodes }) => nodes)
    )
    const metricStreams = new Rx.ReplaySubject(1)
    metricStreams.next(metricsStream.pipe(rx.map((metrics) => metrics?.[0]?.id)))
    return {
      nameStream: new Rx.BehaviorSubject(''),
      metricStreams,
      metricsStream,
      typeStream: new Rx.BehaviorSubject('line')
    }
  }, [])

  const { name, metric, metrics, type } = useStream(() => ({
    name: nameStream,
    metric: metricStreams.pipe(rx.switchAll()),
    metrics: metricsStream,
    type: typeStream
  }))

  console.log('metrics', metrics, metric)

  const createBlock = async () => {
    await model.block.upsert({
      dashboardId: dashboardId,
      name: name,
      metricIds: [{ id: metric }],
      settings: {
        type: type
      }
    })
    onClose()
  }

  return z('.z-new-block-dialog', [
    z($dialog, {
      onClose,
      $title: lang.get('newBlockDialog.title'),
      $content:
        z('.z-new-block-dialog_content', [
          z('.input', z($input, {
            valueStream: nameStream,
            placeholder: lang.get('general.name'),
            type: 'text'
          })),
          z('.input', z($dropdown, {
            valueStream: typeStream,
            options: [
              { value: 'line', text: lang.get('blockType.line') },
              { value: 'bar', text: lang.get('blockType.bar') },
              { value: 'pie', text: lang.get('blockType.pie') }
            ]
          })),
          z('.input', z($dropdown, {
            valueStreams: metricStreams,
            options: _.map(metrics, ({ id, name }) => ({
              value: id, text: name
            }))
          }))
        ]),
      $actions:
        z('.z-new-block-dialog_actions', [
          z('.save', [
            z($button, {
              text: lang.get('general.save'),
              isPrimary: true,
              onclick: createBlock,
              shouldHandleLoading: true
            })
          ])
        ])
    })
  ])
};
