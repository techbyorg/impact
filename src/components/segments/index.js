import { z, useContext, useMemo, useStream } from 'zorium'
import * as Rx from 'rxjs'
import * as rx from 'rxjs/operators'
import * as _ from 'lodash-es'

import $sidebarMenu from 'frontend-shared/components/sidebar_menu'
import { streams } from 'frontend-shared/services/obs'

import $editRole from '../edit_segment'
import context from '../../context'

if (typeof window !== 'undefined') { require('./index.styl') }

export default function $segments () {
  const { model, lang } = useContext(context)

  const {
    currentMenuItemStream, segmentsStream, segmentStreams
  } = useMemo(() => {
    const currentMenuItemStream = new Rx.BehaviorSubject('everyone')
    const segmentsStream = model.segment.getAll()
    const segmentStreams = streams(
      Rx.combineLatest(currentMenuItemStream, segmentsStream).pipe(
        rx.map(([currentMenuItem, segments]) =>
          _.find(segments?.nodes, { slug: currentMenuItem }) || segments?.nodes[0]
        )
      )
    )

    return {
      currentMenuItemStream,
      segmentsStream,
      segmentStreams
    }
  }, [])

  const { menuItems } = useStream(() => ({
    menuItems: segmentsStream.pipe(rx.map((segments) =>
      _.map(segments?.nodes, (segment) => ({
        id: segment.id, menuItem: segment.slug, text: segment.slug
      }))
    ))
  }))

  return z('.z-segments', [
    z('.sidebar', [
      z($sidebarMenu, {
        title: lang.get('general.segments'),
        isDraggable: true,
        onReorder: (ids) => model.segment.setPriorities(ids),
        onAdd: () => {
          return model.segment.upsert({
            name: 'New segment'
          })
        },
        currentMenuItemStream,
        menuItems
      })
    ]),
    z('.content', [
      z($editRole, { segmentStreams })
    ])
  ])
}
