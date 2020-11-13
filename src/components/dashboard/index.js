import { z, classKebab, useContext, useEffect, useMemo, useStream } from 'zorium'
import * as _ from 'lodash-es'
import * as Rx from 'rxjs'
import * as rx from 'rxjs/operators'

import $dropdown from 'frontend-shared/components/dropdown'
import $fab from 'frontend-shared/components/fab'
import $icon from 'frontend-shared/components/icon'
import $inputDateRange from 'frontend-shared/components/input_date_range'
import $masonryGrid from 'frontend-shared/components/masonry_grid'
import $spinner from 'frontend-shared/components/spinner'
import { addIconPath, editIconPath } from 'frontend-shared/components/icon/paths'
import { graphColors } from 'frontend-shared/colors'

import $block from '../block'
import $partnersDropdown from '../partners_dropdown'
import $newBlockDialog from '../new_block_dialog'
import $newDashboardDialog from '../new_dashboard_dialog'
import $sidebar from '../sidebar'
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
    presetDateRangeStream, gColors, isMenuVisibleStream,
    isNewBlockDialogVisibleStream, editingBlockIdStream,
    isNewDashboardDialogVisibleStream, editingDashboardIdStream
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
      isNewBlockDialogVisibleStream: new Rx.BehaviorSubject(false),
      editingBlockIdStream: new Rx.BehaviorSubject(null),
      isNewDashboardDialogVisibleStream: new Rx.BehaviorSubject(false),
      editingDashboardIdStream: new Rx.BehaviorSubject(null)
    }
  }, [])

  const {
    startDate, endDate, isMenuVisible, isLoading, dashboard,
    org, pinnedBlock, timeScale, isNewBlockDialogVisible, editingBlockId,
    isNewDashboardDialogVisible, editingDashboardId
  } = useStream(() => ({
    startDate: startDateStreams.pipe(rx.switchAll()),
    endDate: startDateStreams.pipe(rx.switchAll()),
    isMenuVisible: isMenuVisibleStream,
    isLoading: isLoadingStream,
    dashboard: dashboardStream,
    org: orgStream,
    pinnedBlock: dashboardStream.pipe(
      rx.map((dashboard) =>
        _.find(dashboard?.blocks.nodes, ({ settings }) => settings?.isPinned)
      )
    ),
    presetDateRange: presetDateRangeStream, // only sub'd for side-effect
    timeScale: timeScaleStream,
    isNewBlockDialogVisible: isNewBlockDialogVisibleStream,
    editingBlockId: editingBlockIdStream,
    isNewDashboardDialogVisible: isNewDashboardDialogVisibleStream,
    editingDashboardId: editingDashboardIdStream
  }))

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
      z('.top', {
        onclick: () => { isMenuVisibleStream.next(!isMenuVisible) }
      }, [
        z('.info', [
          z('.sup', lang.get('general.dashboard') + ':'),
          z('.name', [
            dashboard?.name,
            z('.arrow')
          ])
        ]),
        z('.right', [
          z('.partners-dropdown', z($partnersDropdown, { partnerStream })),
          hasEditDashboardPermission && z($icon, {
            icon: editIconPath,
            isCircled: true,
            color: colors.$bgText60,
            onclick: () => {
              editingDashboardIdStream.next(dashboard.id)
              isNewDashboardDialogVisibleStream.next(true)
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
            hasEditPermission: hasEditDashboardPermission,
            block: pinnedBlock,
            editingBlockIdStream,
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
              if (!block.settings.isPinned) {
                return z('.block', [
                  z($block, {
                    timeScale,
                    hasEditPermission: hasEditDashboardPermission,
                    block,
                    editingBlockIdStream,
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
    (editingBlockId || isNewBlockDialogVisible) &&
      z($newBlockDialog, {
        dashboardId: dashboard?.id,
        blockId: editingBlockId,
        onClose: () => {
          editingBlockIdStream.next(null)
          isNewBlockDialogVisibleStream.next(false)
        }
      }),
    isNewDashboardDialogVisible && z($newDashboardDialog, {
      dashboardId: editingDashboardId,
      onClose: () => {
        isNewDashboardDialogVisibleStream.next(false)
      }
    })
  ])
}
