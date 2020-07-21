import { z, useContext, useMemo, useStream } from 'zorium'
import * as Rx from 'rxjs'
import * as rx from 'rxjs/operators'

import useMeta from 'frontend-shared/services/use_meta'
import useCssVariables from 'frontend-shared/services/use_css_variables'

import $dashboard from '../../components/dashboard'
import context from '../../context'

if (typeof window !== 'undefined') { require('./index.styl') }

export default function $dashboardPage ({ requestsStream }) {
  const { model, router, colors } = useContext(context)

  const {
    orgStream, orgSlugStream, dashboardSlugStream, dashboardStream
  } = useMemo(() => {
    const dashboardSlugStream = requestsStream.pipe(
      rx.map(({ route }) => route.params.dashboardSlug)
    )
    const orgSlugStream = requestsStream.pipe(
      rx.map(({ route }) => {
        if (route.params.orgSlug) {
          return route.params.orgSlug
        } else if (router.getHost() === 'data.upchieve.org') {
          // FIXME: non-hardcoded
          return 'upchieve'
        } else if (router.getHost() === 'numberwang.hackclub.com') {
          return 'hackclub'
        }
      })
    )

    const orgStream = orgSlugStream.pipe(
      rx.switchMap((orgSlug) => {
        return model.org.getBySlug(orgSlug)
      })
    )
    const orgAndDashboardSlug = Rx.combineLatest(orgStream, dashboardSlugStream)
    return {
      orgStream,
      orgSlugStream,
      dashboardSlugStream,
      dashboardStream: orgAndDashboardSlug.pipe(
        rx.switchMap(([org, dashboardSlug]) => {
          return model.dashboard.getByOrgIdAndSlug(org.id, dashboardSlug)
        })
      )
    }
  }, [])

  const { org, orgSlug } = useStream(() => ({
    org: orgStream,
    orgSlug: orgSlugStream
  }))

  useMeta((org) => {
    // TODO: non-hardcoded
    if (org?.slug === 'upchieve') {
      return {
        title: 'UPchieve Transparent Data',
        description: 'UPchieve is an EdTech nonprofit providing on-demand STEM tutoring + college counseling to underserved HS students in the U.S.'
      }
    } else {
      return {
        title: 'Hack Club Transparent Data',
        description: 'Hack Club is a global network of programming clubs where members learn to code through tinkering and building projects.'
      }
    }
  }, [org])

  useCssVariables(() => {
    if (orgSlug === 'upchieve') {
      return colors.getCssVariables({
        '--primary-50': '#E3FAF5',
        '--primary-100': '#B9F2E6',
        '--primary-200': '#8BE9D5',
        '--primary-300': '#5CE0C4',
        '--primary-400': '#39D9B7',
        '--primary-500': '#16D2AA',
        '--primary-600': '#13CDA3',
        '--primary-700': '#10C799',
        '--primary-800': '#0CC190',
        '--primary-900': '#06B67F',
        '--primary-main': '#16d2aa', // primary500
        '--primary-main-8': 'rgba(22, 210, 170, 0.08)',
        '--secondary-50': '#E6F3F9',
        '--secondary-100': '#C2E0F0',
        '--secondary-200': '#99CCE7',
        '--secondary-300': '#70B7DD',
        '--secondary-400': '#51A7D5',
        '--secondary-500': '#3298CE',
        '--secondary-600': '#2D90C9',
        '--secondary-700': '#2685C2',
        '--secondary-800': '#1F7BBC',
        '--secondary-900': '#136AB0'
      })
    } else if (orgSlug === 'hackclub') {
      return colors.getCssVariables({
        '--primary-50': '#FDE7EA',
        '--primary-100': '#F9C3CB',
        '--primary-200': '#F69BA8',
        '--primary-300': '#F27385',
        '--primary-400': '#EF556A',
        '--primary-500': '#EC3750',
        '--primary-600': '#EA3149',
        '--primary-700': '#E72A40',
        '--primary-800': '#E42337',
        '--primary-900': '#DF1627',
        '--primary-main': '#EC3750', // primary500
        '--primary-main-8': 'rgba(236, 55, 80, 0.08)',
        '--secondary-50': '#E4E6E8',
        '--secondary-100': '#BCC0C5',
        '--secondary-200': '#8F969E',
        '--secondary-300': '#626C77',
        '--secondary-400': '#414D5A',
        '--secondary-500': '#1F2D3D',
        '--secondary-600': '#1B2837',
        '--secondary-700': '#17222F',
        '--secondary-800': '#121C27',
        '--secondary-900': '#0A111A'
      })
    } else {
      return colors.getCssVariables()
    }
  }, [orgSlug])

  return z('.p-dashboard',
    z($dashboard, { orgStream, dashboardSlugStream, dashboardStream })
  )
}
