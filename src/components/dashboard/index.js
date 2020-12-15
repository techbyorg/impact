import { z, classKebab, useContext, useEffect, useMemo, useStream } from 'zorium'
import * as _ from 'lodash-es'
import * as Rx from 'rxjs'
import * as rx from 'rxjs/operators'

import $conditionalVisible from 'frontend-shared/components/conditional_visible'
import $dropdown from 'frontend-shared/components/dropdown'
import $fab from 'frontend-shared/components/fab'
import $icon from 'frontend-shared/components/icon'
import $inputDateRange from 'frontend-shared/components/input_date_range'
import $masonryGrid from 'frontend-shared/components/masonry_grid'
import $spinner from 'frontend-shared/components/spinner'
import { addIconPath, editIconPath } from 'frontend-shared/components/icon/paths'
import { graphColors } from 'frontend-shared/colors'

import $block from '../block'
import $newBlockDialog from '../new_block_dialog'
import $newDashboardDialog from '../new_dashboard_dialog'
import $segmentsDropdown from '../segments_dropdown'
import $sidebar from '../sidebar'
import { bankIconPath } from '../icon/paths'
import context from '../../context'

if (typeof window !== 'undefined') { require('./index.styl') }

export default function $home (props) {
  const {
    orgStream, dashboardSlugStream, dashboardStream, segmentStream,
    isLoadingStream, startDateStreams, endDateStreams, timeScaleStream
  } = props
  const { model, lang, colors, router, cookie } = useContext(context)

  const {
    presetDateRangeStream, gColors, isMenuVisibleStream,
    isNewBlockDialogVisibleStream, editingBlockIdStream,
    isNewDashboardDialogVisibleStream
  } = useMemo(() => {
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
      isNewBlockDialogVisibleStream: new Rx.BehaviorSubject(false),
      editingBlockIdStream: new Rx.BehaviorSubject(null),
      isNewDashboardDialogVisibleStream: new Rx.BehaviorSubject(false)
    }
  }, [])

  const {
    startDate, endDate, isMenuVisible, isLoading, dashboard,
    org, pinnedBlock, earliestTime, timeScale
  } = useStream(() => ({
    startDate: startDateStreams.stream,
    endDate: startDateStreams.stream,
    isMenuVisible: isMenuVisibleStream,
    isLoading: isLoadingStream,
    dashboard: dashboardStream,
    org: orgStream,
    pinnedBlock: dashboardStream.pipe(
      rx.map((dashboard) =>
        _.find(dashboard?.blocks.nodes, ({ settings }) => settings?.isPinned)
      )
    ),
    earliestTime: dashboardStream.pipe(
      rx.map((dashboard) => {
        const firstDatapointTimes = _.filter(_.flatten(
          _.map(dashboard?.blocks?.nodes, (block) =>
            _.map(block.metrics?.nodes, (metric) =>
              metric.firstDatapointTime
            )
          )
        ))
        return _.min(firstDatapointTimes)
      })
    ),
    presetDateRange: presetDateRangeStream, // only sub'd for side-effect
    timeScale: timeScaleStream
  }))

  console.log('org', org, earliestTime)

  if (globalThis.window) {
    useEffect(() => {
      startDate && cookie.set('startDate', startDate)
      endDate && cookie.set('startDate', startDate)
    }, [startDate, endDate])
  }

  const blocks = dashboard?.blocks.nodes

  const hasEditDashboardPermission = model.orgUser.hasPermission({
    orgUser: org?.orgUser,
    sourceType: 'impact-dashboard',
    sourceId: dashboard?.id,
    permissions: ['edit']
  })

  console.log('render dash')

  return z('.z-dashboard', {
    className: classKebab({ isMenuVisible, hasPinnedBlock: pinnedBlock })
  }, [
    z($sidebar, {
      orgStream,
      dashboardSlugStream,
      isMenuVisibleStream,
      isNewDashboardDialogVisibleStream,
      hasEditDashboardPermission
    }),
    z('.content', [
      z('.top', [
        z('.info', {
          onclick: () => { isMenuVisibleStream.next(!isMenuVisible) }
        }, [
          z('.sup', lang.get('general.dashboard') + ':'),
          z('.name', [
            dashboard?.name,
            z('.arrow')
          ])
        ]),
        z('.right', [
          z('.segments-dropdown', z($segmentsDropdown, {
            segmentStream, dashboardSlug: dashboard?.slug
          })),
          hasEditDashboardPermission && z($icon, {
            icon: editIconPath,
            isCircled: true,
            color: colors.$bgText60,
            onclick: () => {
              router.go('orgEditDashboard', {
                dashboardSlug: dashboard?.slug
              })
            }
          })
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
              startDateStreams,
              endDateStreams,
              presetDateRangeStream,
              earliestTime
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
            hasEditPermission: hasEditDashboardPermission,
            block: pinnedBlock,
            editingBlockIdStream,
            isNewBlockDialogVisibleStream,
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
            $elements: _.filter(_.map(blocks, (block) => {
              const isCumulative = [ // HACK for upchieve
                'cumulative-sessions', 'cumulative-students'
              ].includes(block.slug)
              if (!block.settings.isPinned && (!isCumulative || timeScale !== 'month')) {
                return z('.block', [
                  z($block, {
                    timeScale,
                    hasEditPermission: hasEditDashboardPermission,
                    block,
                    editingBlockIdStream,
                    isNewBlockDialogVisibleStream,
                    colors: [colors.getRawColor(colors.$primaryMain)].concat(gColors)
                  })
                ])
              }
            }))
          })
        )
      ])
    ]),
    hasEditDashboardPermission && z('.add', z($fab, {
      icon: addIconPath,
      isInverted: true,
      onclick: () => {
        isNewBlockDialogVisibleStream.next(true)
      }
    })),
    z($conditionalVisible, {
      isVisibleStream: isNewBlockDialogVisibleStream,
      $component: z($newBlockDialog, {
        dashboardId: dashboard?.id,
        blockIdStream: editingBlockIdStream,
        onClose: () => {
          editingBlockIdStream.next(null)
          isNewBlockDialogVisibleStream.next(false)
        }
      })
    }),
    z($conditionalVisible, {
      isVisibleStream: isNewDashboardDialogVisibleStream,
      $component: z($newDashboardDialog, {
        onClose: () => {
          isNewDashboardDialogVisibleStream.next(false)
        }
      })
    })
  ])
}
