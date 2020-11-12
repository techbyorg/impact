import { z, useContext, useMemo, useStream } from 'zorium'
import * as Rx from 'rxjs'
import * as rx from 'rxjs/operators'
import * as _ from 'lodash-es'

import $button from 'frontend-shared/components/button'
import $dialog from 'frontend-shared/components/dialog'
import $dropdown from 'frontend-shared/components/dropdown'
import $input from 'frontend-shared/components/input'
import $toggle from 'frontend-shared/components/toggle'

import context from '../../context'

if (typeof window !== 'undefined' && window !== null) {
  require('./index.styl')
}

export default function $newBlockDialog ({ dashboardId, blockId, onClose }) {
  const { lang, model } = useContext(context)

  const {
    blockStream, nameStreams, metricStreams, metricsStream, typeStreams,
    isPrivateStreams
  } = useMemo(() => {
    const blockStream = blockId && model.block.getById(blockId)

    const nameStreams = new Rx.ReplaySubject(1)
    blockId
      ? nameStreams.next(blockStream.pipe(rx.map((block) => block.name)))
      : nameStreams.next(Rx.of(''))

    const typeStreams = new Rx.ReplaySubject(1)
    blockId
      ? typeStreams.next(blockStream.pipe(rx.map((block) => block.settings?.type)))
      : typeStreams.next(Rx.of(''))

    const metricsStream = model.metric.getAll().pipe(
      rx.map(({ nodes }) => nodes)
    )
    const metricStreams = new Rx.ReplaySubject(1)
    blockId
      ? metricStreams.next(blockStream.pipe(rx.map((block) => block.metricIds[0].id)))
      : metricStreams.next(metricsStream.pipe(rx.map((metrics) => metrics?.[0]?.id)))

    const isPrivateStreams = new Rx.ReplaySubject(1)
    blockId
      ? isPrivateStreams.next(blockStream.pipe(rx.map((block) => !block.defaultPermissions?.view)))
      : isPrivateStreams.next(Rx.of(false))

    return {
      blockStream,
      nameStreams,
      metricStreams,
      metricsStream,
      typeStreams,
      isPrivateStreams
    }
  }, [])

  const { block, name, metric, metrics, type, isPrivate } = useStream(() => ({
    block: blockStream,
    name: nameStreams.pipe(rx.switchAll()),
    metric: metricStreams.pipe(rx.switchAll()),
    metrics: metricsStream,
    type: typeStreams.pipe(rx.switchAll()),
    isPrivate: isPrivateStreams.pipe(rx.switchAll())
  }))

  console.log('metrics', metrics, metric, block, type)

  const createBlock = async () => {
    await model.block.upsert({
      id: block?.id,
      dashboardId: dashboardId,
      name: name,
      metricIds: [{ id: metric }],
      settings: { type },
      defaultPermissions: _.defaults({ view: !isPrivate }, block.defaultPermissions)
    })
    onClose()
  }

  return z('.z-new-block-dialog', [
    z($dialog, {
      onClose,
      isWide: true,
      $title: lang.get('newBlockDialog.title'),
      $content:
        z('.z-new-block-dialog_content', [
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
          z('.input', [
            z('label.label', [
              z('.title', lang.get('newBlockDialog.private')),
              z('.description', lang.get('newBlockDialog.privateDescription'))
            ]),
            z($toggle, { isSelectedStreams: isPrivateStreams })
          ])
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
