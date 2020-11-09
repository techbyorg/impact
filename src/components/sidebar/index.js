import { z, classKebab, useContext, useMemo, useStream } from 'zorium'
import * as _ from 'lodash-es'
import * as Rx from 'rxjs'
import * as rx from 'rxjs/operators'

import $button from 'frontend-shared/components/button'
import $dropdown from 'frontend-shared/components/dropdown'
import $importedInlineSvg from 'frontend-shared/components/imported_inline_svg'
import $icon from 'frontend-shared/components/icon'
import { addIconPath } from 'frontend-shared/components/icon/paths'

import $newDashboardDialog from '../new_dashboard_dialog'
import context from '../../context'

if (typeof window !== 'undefined') { require('./index.styl') }

export default function $home (props) {
  const {
    orgStream, dashboardSlugStream, partnerStream, isMenuVisibleStream
  } = props
  const { model, lang, router, colors } = useContext(context)

  const {
    dashboardsStream, partnersStream, partnerStreams,
    isNewDashboardDialogVisibleStream
  } = useMemo(() => {
    const partnerStreams = new Rx.ReplaySubject(1)
    partnerStreams.next(partnerStream)

    return {
      dashboardsStream: orgStream.pipe(
        rx.switchMap((org) => model.dashboard.getAllByOrgId(org.id))
      ),
      partnersStream: orgStream.pipe(
        rx.switchMap((org) =>
          model.partner.getAllByOrgId(org.id)
        )
      ),
      partnerStreams,
      isNewDashboardDialogVisibleStream: new Rx.BehaviorSubject(false)
    }
  }, [])

  const {
    dashboard, dashboardSlug, dashboards, partners, org, isMenuVisible,
    isNewDashboardDialogVisible
  } = useStream(() => ({
    dashboardSlug: dashboardSlugStream,
    dashboards: dashboardsStream,
    partners: partnersStream,
    org: orgStream,
    isMenuVisible: isMenuVisibleStream,
    isNewDashboardDialogVisible: isNewDashboardDialogVisibleStream
  }))

  const currentDashboardSlug = dashboardSlug || dashboard?.slug

  const logo = org?.slug === 'hackclub'
    ? 'https://assets.hackclub.com/flag-orpheus-top.svg'
    : org?.slug === 'upchieve'
      ? 'https://static1.squarespace.com/static/57c0d8d1e58c622e8b6d5328/t/58e6f7d3cd0f6890d14a989b/1596229917902/?format=600w'
      : org?.slug === 'raisedbyus' && 'https://images.squarespace-cdn.com/content/5a88648ca9db09295b5d7a8c/1518888367733-ME6DC2YQFWXG595E6OGG/RAISEDBY.US_.jpg?format=1500w&content-type=image%2Fjpeg'

  const isHackClub = org?.slug === 'hackclub' // TODO: a way to not hardcode their type of logo?

  return z('.z-sidebar', {
    className: classKebab({ hasLogo: logo, isMenuVisible, isHackClub })
  }, [
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
    z('.dashboards', [
      _.map(dashboards?.nodes, ({ slug, name }) =>
        router.linkIfHref(z('a.dashboard', {
          className: classKebab({
            isSelected: slug === currentDashboardSlug
          }),
          href: router.get('orgDashboard', {
            orgSlug: org?.slug,
            dashboardSlug: slug
          })
        }, name))
      ),
      z('.add-dashboard', {
        onclick: () => isNewDashboardDialogVisibleStream.next(true)
      }, [
        z('.icon', z($icon, {
          icon: addIconPath,
          color: colors.$bgText54
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
    ]),
    isNewDashboardDialogVisible && z($newDashboardDialog, {
      onClose: () => {
        isNewDashboardDialogVisibleStream.next(false)
      }
    })
  ])
}
