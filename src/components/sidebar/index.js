import { z, classKebab, useContext, useMemo, useStream } from 'zorium'
import * as _ from 'lodash-es'

import $button from 'frontend-shared/components/button'
import $importedInlineSvg from 'frontend-shared/components/imported_inline_svg'
import $icon from 'frontend-shared/components/icon'
import { addIconPath } from 'frontend-shared/components/icon/paths'

import context from '../../context'

if (typeof window !== 'undefined') { require('./index.styl') }

export default function $home (props) {
  const {
    orgStream, dashboardSlugStream, isMenuVisibleStream,
    isNewDashboardDialogVisibleStream, hasEditDashboardPermission
  } = props
  const { model, lang, router, colors } = useContext(context)

  const { dashboardsStream } = useMemo(() => {
    return {
      dashboardsStream: model.dashboard.getAll()
    }
  }, [])

  const {
    dashboard, dashboardSlug, dashboards, org, isMenuVisible
  } = useStream(() => ({
    dashboardSlug: dashboardSlugStream,
    dashboards: dashboardsStream,
    org: orgStream,
    isMenuVisible: isMenuVisibleStream
  }))

  const currentDashboardSlug = dashboardSlug || dashboard?.slug

  return z('.z-sidebar', {
    className: classKebab({ isMenuVisible })
  }, [
    z('.title', [
      z('.icon'),
      lang.get('general.dashboards')
    ]),
    z('.dashboards', [
      _.map(dashboards?.nodes, ({ slug, name }, i) => {
        const isSelected = slug === currentDashboardSlug || (!currentDashboardSlug && i === 0)
        return router.linkIfHref(z('a.dashboard', {
          className: classKebab({ isSelected }),
          href: router.get('orgDashboard', {
            orgSlug: org?.slug,
            dashboardSlug: slug
          })
        }, name))
      }),
      hasEditDashboardPermission && z('.add-dashboard', {
        onclick: () => isNewDashboardDialogVisibleStream.next(true)
      }, [
        z('.icon', z($icon, {
          icon: addIconPath,
          color: colors.$bgText54,
          size: '16px'
        })),
        z('.text', lang.get('sidebar.addDashboard'))
      ])
    ]),
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
  ])
}
