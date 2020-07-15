import { z, useContext, useMemo } from 'zorium'
import * as Rx from 'rxjs'
import * as rx from 'rxjs/operators'

import useMeta from 'frontend-shared/services/use_meta'

import $dashboard from '../../components/dashboard'
import context from '../../context'

if (typeof window !== 'undefined') { require('./index.styl') }

export default function $dashboardPage ({ requestsStream }) {
  const { model, router } = useContext(context)

  const { orgStream, dashboardSlugStream, dashboardStream } = useMemo(() => {
    const dashboardSlugStream = requestsStream.pipe(
      rx.map(({ route }) => route.params.dashboardSlug)
    )
    const orgStream = requestsStream.pipe(
      rx.switchMap(({ route }) => {
        console.log('get org', route.params.orgSlug || 'upchieve')
        return model.org.getBySlug(route.params.orgSlug || 'upchieve') // FIXME: rm upchieve
      })
    )
    const orgAndDashboardSlug = Rx.combineLatest(orgStream, dashboardSlugStream)
    return {
      orgStream,
      dashboardSlugStream,
      dashboardStream: orgAndDashboardSlug.pipe(
        rx.switchMap(([org, dashboardSlug]) => {
          console.log('got org', org)
          return model.dashboard.getByOrgIdAndSlug(org.id, dashboardSlug)
        })
      )
    }
  }, [])

  useMeta(() => {
    // TODO: non-hardcoded
    if (router.getHost() === 'data.upchieve.org') {
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
  }, [])

  return z('.p-dashboard',
    z($dashboard, { orgStream, dashboardSlugStream, dashboardStream })
  )
}
