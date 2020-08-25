import { z, classKebab, useContext, useEffect, useMemo, useStream } from 'zorium'
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
import { graphColors } from 'frontend-shared/colors'

import $block from '../block'
import { bankIconPath } from '../icon/paths'
import context from '../../context'

if (typeof window !== 'undefined') { require('./index.styl') }

export default function $home (props) {
  const {
    orgStream, dashboardSlugStream, dashboardStream, partnerStream,
    isLoadingStream, startDateStreams, endDateStreams, timeScaleStream
  } = props
  const { model, lang, colors, router, cookie } = useContext(context)

  const {
    presetDateRangeStream, gColors, isMenuVisibleStream, dashboardsStream,
    partnersStream, partnerStreams
  } = useMemo(() => {
    const partnerStreams = new Rx.ReplaySubject(1)
    partnerStreams.next(partnerStream)

    let isFirstPresetDateRange = true
    const initialPresetDateRange = cookie.get('presetDateRange') || 'last6Months'
    const presetDateRangeStream = new Rx.BehaviorSubject(initialPresetDateRange)

    return {
      presetDateRangeStream: presetDateRangeStream.pipe(
      // TODO: could try to move this into useEffect. need to figure out
      // solution for isFirstPresetDateRange
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
      // presetDateRangeStream,
      // timeScaleStream,
      gColors: _.map(graphColors, 'graph'),
      isMenuVisibleStream: new Rx.BehaviorSubject(false),
      dashboardsStream: orgStream.pipe(
        rx.switchMap((org) => model.dashboard.getAllByOrgId(org.id))
      ),
      partnersStream: orgStream.pipe(
        rx.switchMap((org) =>
          // FIXME: rm hackPw when internal dash
          model.partner.getAllByOrgId(org.id, cookie.get('hackPw'))
        )
      ),
      partnerStreams
    }
  }, [])

  const {
    startDate, endDate, isMenuVisible, isLoading, dashboard, dashboardSlug,
    dashboards, partners, org, pinnedBlock, timeScale
  } = useStream(() => ({
    startDate: startDateStreams.pipe(rx.switchAll()),
    endDate: startDateStreams.pipe(rx.switchAll()),
    isMenuVisible: isMenuVisibleStream,
    isLoading: isLoadingStream,
    dashboard: dashboardStream,
    dashboardSlug: dashboardSlugStream,
    dashboards: dashboardsStream,
    partners: partnersStream,
    org: orgStream,
    pinnedBlock: dashboardStream.pipe(
      rx.map((dashboard) =>
        _.find(dashboard?.blocks.nodes, ({ settings }) => settings?.isPinned)
      )
    ),
    presetDateRange: presetDateRangeStream, // only sub'd for side-effect
    timeScale: timeScaleStream
  }))

  if (globalThis.window) {
    useEffect(() => {
      startDate && cookie.set('startDate', startDate)
      endDate && cookie.set('startDate', startDate)
    }, [startDate, endDate])
  }

  const currentDashboardSlug = dashboardSlug || dashboard?.slug

  const blocks = dashboard?.blocks.nodes

  console.log('render dashboard', dashboard, blocks, pinnedBlock)

  const isHackClub = org?.slug === 'hackclub' // TODO: a way to not hardcode their type of logo?
  const logo = org?.slug === 'hackclub'
    ? 'https://assets.hackclub.com/flag-orpheus-top.svg'
    : org?.slug === 'upchieve'
      ? 'https://static1.squarespace.com/static/57c0d8d1e58c622e8b6d5328/t/58e6f7d3cd0f6890d14a989b/1596229917902/?format=600w'
      : org?.slug === 'raisedbyus' && 'https://images.squarespace-cdn.com/content/5a88648ca9db09295b5d7a8c/1518888367733-ME6DC2YQFWXG595E6OGG/RAISEDBY.US_.jpg?format=1500w&content-type=image%2Fjpeg'

  return z('.z-dashboard', {
    className: classKebab({ isMenuVisible, hasLogo: logo, isHackClub })
  }, [
    z('.menu', [
      !_.isEmpty(partners?.nodes) && z('.partners', [
        z($dropdown, {
          onChange: (value) => {
            router.go('orgPartner', {
              orgSlug: org.slug,
              partnerSlug: value
            })
          },
          valueStreams: partnerStreams,
          options: _.map(partners.nodes, ({ slug }) => ({
            value: slug,
            text: slug
          }))
        })
      ]),
      z('.logo', {
        style: {
          backgroundImage: logo && `url(${logo})`
        }
      }, [
        z('.text', org && [
          // TODO: non-hardcoded
          org.slug === 'hackclub'
            ? 'Hack Club'
            : org.slug === 'upchieve'
              ? 'UPchieve'
              : org.slug === 'freeroam'
                ? 'FreeRoam'
                : '',
          z('span.data', 'Data')
        ])
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
              startDateStreams, endDateStreams, presetDateRangeStream
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
