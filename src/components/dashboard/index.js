import { z, classKebab, useContext, useMemo, useStream } from 'zorium'
import * as _ from 'lodash-es'
import * as Rx from 'rxjs'
import * as rx from 'rxjs/operators'

import $dropdown from 'frontend-shared/components/dropdown'
import $inputDateRange from 'frontend-shared/components/input_date_range'
import $masonryGrid from 'frontend-shared/components/masonry_grid'
import $spinner from 'frontend-shared/components/spinner'
import DateService from 'frontend-shared/services/date'

import $block from '../block'
import { graphColors } from '../../colors'
import context from '../../context'

if (typeof window !== 'undefined') { require('./index.styl') }

export default function $home (props) {
  const { orgStream, dashboardSlugStream, dashboardStream } = props
  const { model, lang, colors, router } = useContext(context)

  const {
    startDateStream, endDateStream, timeScaleValueStream, gColors,
    isMenuVisibleStream, isLoadingStream, dashboardsStream, blocksStream
  } = useMemo(() => {
    // TODO: get from url. broken with preact (rerender suspense bug)
    // https://github.com/preactjs/preact/pull/2570
    // const startDateStreams = new Rx.ReplaySubject(1)
    // startDateStreams.next(Rx.of(Date.now()))
    // const endDateStreams = new Rx.ReplaySubject(1)
    // endDateStreams.next(Rx.of(Date.now()))

    const startOfSixMonthsAgo = new Date()
    startOfSixMonthsAgo.setMonth(startOfSixMonthsAgo.getMonth() - 6)
    startOfSixMonthsAgo.setDate(1)
    const startDateStream = new Rx.BehaviorSubject(
      DateService.format(startOfSixMonthsAgo, 'yyyy-mm-dd')
    )
    const endOfLastMonth = new Date()
    endOfLastMonth.setDate(0)
    const endDateStream = new Rx.BehaviorSubject(
      DateService.format(endOfLastMonth, 'yyyy-mm-dd')
    )
    const timeScaleValueStream = new Rx.BehaviorSubject('month')

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
      gColors: _.map(graphColors, 'graph'),
      isMenuVisibleStream: new Rx.BehaviorSubject(false),
      isLoadingStream: new Rx.BehaviorSubject(false),
      dashboardsStream: orgStream.pipe(
        rx.switchMap((org) => model.dashboard.getAllByOrgId(org.id))
      ),
      blocksStream: datesAndDashboardStream.pipe(
        rx.filter(([startDate, endDate, dashboard]) => startDate && endDate),
        rx.tap(() => { isLoadingStream.next(true) }),
        rx.switchMap(([startDate, endDate, timeScale, dashboard]) => {
          console.log('get', dashboard, startDate, endDate)
          return model.block.getAllByDashboardId(dashboard.id, {
            startDate, endDate, timeScale
          })
        }),
        rx.tap(() => { isLoadingStream.next(false) })
      )
    }
  }, [])

  const {
    isMenuVisible, isLoading, dashboard, dashboardSlug, dashboards, blocks,
    pinnedBlock, timeScale
  } = useStream(() => ({
    isMenuVisible: isMenuVisibleStream,
    isLoading: isLoadingStream,
    dashboard: dashboardStream,
    dashboardSlug: dashboardSlugStream,
    dashboards: dashboardsStream,
    blocks: blocksStream.pipe(
      rx.map((blocks) =>
        _.filter(blocks.nodes, ({ settings }) => !settings?.isPinned)
      )
    ),
    pinnedBlock: blocksStream.pipe(
      rx.map((blocks) => _.find(blocks.nodes, ({ settings }) => settings?.isPinned))
    ),
    timeScale: timeScaleValueStream
  }))

  const currentDashboardSlug = dashboardSlug || dashboard?.slug

  return z('.z-dashboard', {
    className: classKebab({ isMenuVisible })
  }, [
    z('.menu', [
      z('.logo', [
        'UPchieve',
        z('span.data', 'Data')
      ]),
      z('.title', lang.get('general.dashboards')),
      z('.dashboards', _.map(dashboards?.nodes, ({ slug, name }) =>
        router.link(z('a.dashboard', {
          className: classKebab({
            isSelected: slug === currentDashboardSlug
          }),
          href: router.get('dashboard', {
            orgSlug: 'upchieve', // FIXME
            dashboardSlug: slug
          })
        }, name))
      ))
    ]),
    z('.content', [
      z('.top', {
        onclick: () => { isMenuVisibleStream.next(!isMenuVisible) }
      }, [
        z('.sup', lang.get('general.dashboard') + ':'),
        z('.name', [
          dashboard?.name,
          z('.arrow')
        ])
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
        ]),
        isLoading && z('.spinner', z($spinner, { size: 30 }))
      ]),
      z('.data', [
        pinnedBlock && z('.pinned-block', [
          z($block, {
            timeScale,
            block: pinnedBlock,
            colors: [colors.$upchieve500].concat(gColors)
          })
        ]),
        z('.blocks',
          z($masonryGrid, {
            columnCounts: {
              mobile: 1,
              tablet: 1,
              desktop: 2
            },
            columnGapPxs: {
              mobile: 0,
              tablet: 0,
              desktop: 20
            },
            $elements: _.map(blocks, (block) => {
              return z('.block', [
                z($block, {
                  timeScale,
                  block,
                  colors: [colors.$upchieve500].concat(gColors)
                })
              ])
            })
          })
        )
      ])
    ])
  ])
}
