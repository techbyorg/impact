import { z, classKebab, useContext, useMemo, useStream } from 'zorium'
import * as _ from 'lodash'
import * as Rx from 'rxjs'
import * as rx from 'rxjs/operators'

import $dropdown from 'frontend-shared/components/dropdown'
import $inputDateRange from 'frontend-shared/components/input_date_range'
import DateService from 'frontend-shared/services/date'

import $block from '../block'
import context from '../../context'

if (typeof window !== 'undefined') { require('./index.styl') }

const ONE_WEEK_MS = 3600 * 24 * 7 * 1000

export default function $home (props) {
  const { orgStream, dashboardSlugStream, dashboardStream } = props
  const { model, lang, colors, router } = useContext(context)

  const {
    startDateStream, endDateStream, timeScaleValueStream,
    dashboardsStream, blocksStream
  } = useMemo(() => {
    // TODO: get from url. broken with preact (rerender suspense bug)
    // https://github.com/preactjs/preact/pull/2570
    // const startDateStreams = new Rx.ReplaySubject(1)
    // startDateStreams.next(Rx.of(Date.now()))
    // const endDateStreams = new Rx.ReplaySubject(1)
    // endDateStreams.next(Rx.of(Date.now()))

    const startDateStream = new Rx.BehaviorSubject(
      DateService.format(new Date(Date.now() - ONE_WEEK_MS), 'yyyy-mm-dd')
    )
    const endDateStream = new Rx.BehaviorSubject(
      DateService.format(new Date(), 'yyyy-mm-dd')
    )
    const timeScaleValueStream = new Rx.BehaviorSubject('day')

    const datesAndDashboardStream = Rx.combineLatest(
      startDateStream,
      endDateStream,
      timeScaleValueStream,
      dashboardStream
    )

    return {
      startDateStream,
      endDateStream,
      timeScaleValueStream,
      dashboardsStream: orgStream.pipe(
        rx.switchMap((org) => model.dashboard.getAllByOrgId(org.id))
      ),
      blocksStream: datesAndDashboardStream.pipe(
        rx.filter(([startDate, endDate, dashboard]) => startDate && endDate),
        rx.switchMap(([startDate, endDate, timeScale, dashboard]) => {
          console.log('get', dashboard, startDate, endDate)
          return model.block.getAllByDashboardId(dashboard.id, {
            startDate, endDate, timeScale
          })
        })
      )
    }
  }, [])

  const {
    dashboard, dashboardSlug, dashboards, blocks, timeScale
  } = useStream(() => ({
    dashboard: dashboardStream,
    dashboardSlug: dashboardSlugStream,
    dashboards: dashboardsStream,
    blocks: blocksStream,
    timeScale: timeScaleValueStream
  }))

  console.log('dash', dashboard, blocks)

  return z('.z-dashboard', [
    z('.menu', [
      z('.logo', [
        'UPchieve',
        z('span.data', 'Data')
      ]),
      z('.title', lang.get('general.dashboards')),
      z('.dashboards', _.map(dashboards?.nodes, ({ slug, name }) =>
        router.link(z('a.dashboard', {
          className: classKebab({
            isSelected: slug === dashboardSlug
          }),
          href: router.get('dashboard', {
            orgSlug: 'upchieve', // FIXME
            dashboardSlug: slug
          })
        }, name))
      ))
    ]),
    z('.content', [
      z('.top', [
        z('.sup', lang.get('general.dashboard') + ':'),
        z('.name', dashboard?.name)
      ]),
      z('.filters', [
        // select
        z('.date-range', [
          z($inputDateRange, { startDateStream, endDateStream })
        ]),
        z('.time-scale', [
          z($dropdown, {
            valueStream: timeScaleValueStream,
            options: [
              { value: 'day', text: lang.get('frequencies.day') },
              { value: 'week', text: lang.get('frequencies.week') },
              { value: 'month', text: lang.get('frequencies.month') }
            ]
          })
        ])
      ]),
      z('.data', [
        z('.blocks',
          _.map(blocks?.nodes, (block) => {
            return z('.block', [
              z($block, {
                timeScale, block, colors: [colors.$upchieve500]
              })
            ])
          })
        )
      ])
    ])
  ])
}
