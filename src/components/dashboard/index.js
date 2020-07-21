import { z, classKebab, useContext, useMemo, useStream } from 'zorium'
import * as _ from 'lodash-es'
import * as Rx from 'rxjs'
import * as rx from 'rxjs/operators'

import $button from 'frontend-shared/components/button'
import $dropdown from 'frontend-shared/components/dropdown'
import $icon from 'frontend-shared/components/icon'
import $inputDateRange from 'frontend-shared/components/input_date_range'
import $importedInlineSvg from 'frontend-shared/components/imported_inline_svg'
import $masonryGrid from 'frontend-shared/components/masonry_grid'
import $spinner from 'frontend-shared/components/spinner'
import DateService from 'frontend-shared/services/date'

import $block from '../block'
import { bankIconPath } from '../icon/paths'
import { graphColors } from '../../colors'
import context from '../../context'

if (typeof window !== 'undefined') { require('./index.styl') }

const DATE_DEBOUNCE_TIME_MS = 10

export default function $home (props) {
  const { orgStream, dashboardSlugStream, dashboardStream } = props
  const { model, lang, colors, router } = useContext(context)

  const {
    startDateStream, endDateStream, presetDateRangeStream, timeScaleValueStream,
    gColors, isMenuVisibleStream, isLoadingStream, dashboardsStream,
    blocksStream
  } = useMemo(() => {
    // TODO: get from url. broken with preact (rerender suspense bug)
    // https://github.com/preactjs/preact/pull/2570
    // ^^ "fix" was merged in, but still breaks (this time when trying
    // to dismount lazy component)
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
    const presetDateRangeStream = new Rx.BehaviorSubject(null)

    const datesAndDashboardStream = Rx.combineLatest(
      startDateStream,
      endDateStream,
      timeScaleValueStream,
      dashboardStream
    // if timeScaleValueStream and dates change on same action (eg the
    // preset date dropdown), combine both
    ).pipe(rx.debounceTime(DATE_DEBOUNCE_TIME_MS))

    return {
      startDateStream,
      endDateStream,
      presetDateRangeStream,
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
          console.log('gooo')
          console.warn(startDate, endDate, timeScale)
          return model.block.getAllByDashboardId(dashboard.id, {
            startDate, endDate, timeScale
          })
        }),
        rx.tap(() => { isLoadingStream.next(false) })
      )
    }
  }, [])

  const {
    isMenuVisible, isLoading, dashboard, dashboardSlug, dashboards, org, blocks,
    pinnedBlock, timeScale
  } = useStream(() => ({
    isMenuVisible: isMenuVisibleStream,
    isLoading: isLoadingStream,
    dashboard: dashboardStream,
    dashboardSlug: dashboardSlugStream,
    dashboards: dashboardsStream,
    org: orgStream,
    // subscribed for side-effect
    presetDateRange: presetDateRangeStream.pipe(
      rx.map((presetDateRange) => {
        switch (presetDateRange) {
          case 'today':
          case '7days':
          case '30days':
          case 'thisMonth':
          case 'lastMonth':
            return 'day'
          default:
            return 'month'
        }
      }),
      rx.tap((timeScale) => {
        timeScaleValueStream.next(timeScale)
      })
    ),
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

  console.log('blocks', blocks)

  const isHackClub = org?.slug === 'hackclub' // FIXME: non-hardcoded logo

  return z('.z-dashboard', {
    className: classKebab({ isMenuVisible, isHackClub })
  }, [
    z('.menu', [
      z('.logo', org && [
        // TODO: non-hardcoded
        org.slug === 'hackclub'
          ? 'Hack Club'
          : org.slug === 'upchieve'
            ? 'UPchieve'
            : '',
        z('span.data', 'Data')
      ]),
      z('.title', [
        z('.icon'),
        lang.get('general.dashboards')
      ]),
      z('.dashboards', _.map(dashboards?.nodes, ({ slug, name }) =>
        router.linkIfHref(z('a.dashboard', {
          className: classKebab({
            isSelected: slug === currentDashboardSlug
          }),
          href: router.get('orgDashboard', {
            // orgSlug: 'upchieve', // FIXME
            dashboardSlug: slug
          })
        }, name))
      )),
      z('.donate', [
        z('.image', [
          z($importedInlineSvg, {
            importPromise: import(
              /* webpackChunkName: "donate_svg" */
              '../svgs/donate.js'
            )
          })
        ]),
        z('.text', lang.get('dashboard.donateText')),
        z('.button', [
          z($button, {
            text: lang.get('general.donate'),
            isSecondary: true,
            isFullWidth: false,
            onclick: () => {
              // TODO: non-hardcoded
              if (org?.slug === 'hackclub') {
                router.openLink('https://hackclub.com/donate/')
              } else {
                router.openLink('https://secure.givelively.org/donate/upchieve')
              }
            }
          })
        ])
      ])
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
      z('.data', [
        // FIXME: non-hardcoded
        org?.slug === 'hackclub' && z('.custom-message', [
          z('.icon', [
            z($icon, {
              icon: bankIconPath,
              color: colors.$bgText,
              size: '16px'
            })
          ]),
          z('.text',
            'Our finances are open too. See them ',
            router.link(z('a.link', {
              href: 'https://bank.hackclub.com/hq'
            }, 'here'))
          )
        ]),
        z('.filters', [
          // select
          z('.date-range', [
            z($inputDateRange, {
              startDateStream, endDateStream, presetDateRangeStream
            })
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
        pinnedBlock && z('.pinned-block', [
          z($block, {
            timeScale,
            block: pinnedBlock,
            colors: [colors.getRawColor(colors.$primaryMain)].concat(gColors)
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
                  colors: [colors.getRawColor(colors.$primaryMain)].concat(gColors)
                })
              ])
            })
          })
        )
      ])
    ])
  ])
}
