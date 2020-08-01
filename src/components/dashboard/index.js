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
import { graphColors } from 'frontend-shared/colors'

import $block from '../block'
import { bankIconPath } from '../icon/paths'
import context from '../../context'

if (typeof window !== 'undefined') { require('./index.styl') }

const DATE_DEBOUNCE_TIME_MS = 10

export default function $home (props) {
  const { orgStream, dashboardSlugStream, dashboardStream } = props
  const { model, lang, colors, router, cookie } = useContext(context)

  const {
    startDateStream, endDateStream, presetDateRangeStream, timeScaleStream,
    gColors, isMenuVisibleStream, isLoadingStream, dashboardsStream,
    blocksStream
  } = useMemo(() => {
    const timeScaleStream = new Rx.BehaviorSubject(
      cookie.get('timeScale') || 'month'
    )
    const initialPresetDateRange = cookie.get('presetDateRange') || 'last6Months'
    const presetDateRangeStream = new Rx.BehaviorSubject(initialPresetDateRange)
    // TODO: get from url. broken with preact (rerender suspense bug)
    // https://github.com/preactjs/preact/pull/2570
    // ^^ "fix" was merged in, but still breaks (this time when trying
    // to dismount lazy component)
    const presetDates = DateService.getDatesFromPresetDateRange(
      initialPresetDateRange
    )

    const startDateStream = new Rx.BehaviorSubject(
      cookie.get('startDate') ||
        DateService.format(presetDates.startDate, 'yyyy-mm-dd')
    )
    const endDateStream = new Rx.BehaviorSubject(
      cookie.get('endDate') ||
        DateService.format(presetDates.endDate, 'yyyy-mm-dd')
    )

    const datesAndDashboardStream = Rx.combineLatest(
      startDateStream,
      endDateStream,
      timeScaleStream,
      dashboardStream
    // if timeScaleStream and dates change on same action (eg the
    // preset date dropdown), combine both
    ).pipe(rx.debounceTime(DATE_DEBOUNCE_TIME_MS))

    let isFirstPresetDateRange = true

    // FIXME: rm when internal dashboard
    const urlParams = new URLSearchParams(globalThis?.window?.location.search)
    const hackPw = urlParams.get('secret') || cookie.get('hackPw')
    if (hackPw) {
      cookie.set('hackPw', hackPw)
    }

    return {
      // TODO: uncomment when fixed in preact (and rm cookie.set from calendar)
      // https://github.com/preactjs/preact/pull/2570
      // ^^ "fix" was merged in, but still breaks (this time when trying
      // to dismount lazy component)
      // startDateStream: startDateStream.pipe(
      //   rx.tap((startDate) => {
      //     if (!globalThis.window) return
      //     startDate && cookie.set('startDate', startDate)
      //   })
      // ),
      // endDateStream: endDateStream.pipe(
      //   rx.tap((endDate) => {
      //     if (!globalThis.window) return
      //     endDate && cookie.set('endDate', endDate)
      //   })
      // ),
      presetDateRangeStream: presetDateRangeStream.pipe(
        rx.tap((presetDateRange) => {
          if (!globalThis.window) return
          // timeout because the start and endDate cookies are also being
          // set when presetDateRange changes
          presetDateRange && cookie.set('presetDateRange', presetDateRange)

          if (isFirstPresetDateRange) {
            // don't override timeScale from cookie
            isFirstPresetDateRange = false
            return
          }

          setTimeout(() => {
            cookie.set('startDate', '')
            cookie.set('endDate', '')
          }, 0)

          let timeScale
          switch (presetDateRange) {
            case 'today':
            case '7days':
            case '30days':
            case 'thisMonth':
            case 'lastMonth':
              timeScale = 'day'
              break
            default:
              timeScale = 'month'
          }
          timeScaleStream.next(timeScale)
        })
      ),
      timeScaleStream: timeScaleStream.pipe(
        rx.tap((timeScale) => {
          if (!globalThis.window) return
          timeScale && cookie.set('timeScale', timeScale)
        })
      ),
      startDateStream,
      endDateStream,
      // presetDateRangeStream,
      // timeScaleStream,
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
          return model.block.getAllByDashboardId(dashboard.id, {
            startDate,
            endDate,
            timeScale,
            hackPw // FIXME: rm when we have internal dashboards
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
    blocks: blocksStream.pipe(
      rx.map((blocks) =>
        _.filter(blocks.nodes, ({ settings }) => !settings?.isPinned)
      )
    ),
    pinnedBlock: blocksStream.pipe(
      rx.map((blocks) => _.find(blocks.nodes, ({ settings }) => settings?.isPinned))
    ),
    presetDateRange: presetDateRangeStream, // only sub'd for side-effect
    timeScale: timeScaleStream
  }))

  const currentDashboardSlug = dashboardSlug || dashboard?.slug

  console.log('render dashboard')

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
            : org.slug === 'freeroam'
              ? 'FreeRoam'
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
            orgSlug: org?.slug,
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
              } else if (org?.slug === 'freeroam') {
                router.openLink('https://freeroam.app/donate')
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
              valueStream: timeScaleStream,
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
