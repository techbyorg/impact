import { z, useContext, useMemo, useStream } from 'zorium'
import * as Rx from 'rxjs'
import * as rx from 'rxjs/operators'
import * as _ from 'lodash-es'

import $sidebarMenu from 'frontend-shared/components/sidebar_menu'
import { streams } from 'frontend-shared/services/obs'

import $editRole from '../edit_metric'
import context from '../../context'

if (typeof window !== 'undefined') { require('./index.styl') }

export default function $metrics () {
  const { model, lang } = useContext(context)

  const {
    currentMenuItemStream, metricsStream, metricStreams
  } = useMemo(() => {
    const currentMenuItemStream = new Rx.BehaviorSubject('')
    const metricsStream = model.metric.getAll()
    const metricStreams = streams(
      Rx.combineLatest(currentMenuItemStream, metricsStream).pipe(
        rx.map(([currentMenuItem, metrics]) =>
          _.find(metrics?.nodes, { slug: currentMenuItem }) || metrics?.nodes[0]
        )
      )
    )

    return {
      currentMenuItemStream,
      metricsStream,
      metricStreams
    }
  }, [])

  const { menuItems } = useStream(() => ({
    menuItems: metricsStream.pipe(rx.map((metrics) =>
      _.map(metrics?.nodes, (metric) => ({
        id: metric.id, menuItem: metric.slug, text: metric.name
      }))
    ))
  }))

  return z('.z-metrics', [
    z('.sidebar', [
      z($sidebarMenu, {
        title: lang.get('general.metrics'),
        onReorder: (ids) => model.metric.setPriorities(ids),
        onAdd: () => {
          return model.metric.upsert({
            name: 'New metric'
          })
        },
        onDelete: (id) => {
          if (confirm(lang.get('general.areYouSure'))) {
            model.metric.deleteById(id)
          }
        },
        currentMenuItemStream,
        menuItems
      })
    ]),
    z('.content', [
      z($editRole, { metricStreams })
    ])
  ])
}
