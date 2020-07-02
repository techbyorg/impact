import { z, useContext, useMemo } from 'zorium'
import * as _ from 'lodash'
import * as Rx from 'rxjs'
import * as rx from 'rxjs/operators'

import $dashboard from '../../components/dashboard'
import context from '../../context'

if (typeof window !== 'undefined') { require('./index.styl') }

export default function $dashboardPage ({ requestsStream }) {
  const { model } = useContext(context)

  const orgStream = new Rx.BehaviorSubject({ id: 'b6295100-bb45-11ea-91c2-9d708da068b3' }) // FIXME, subdomain, maybe in app.js

  const { dashboardSlugStream, dashboardStream } = useMemo(() => {
    const dashboardSlugStream = requestsStream.pipe(
      rx.map(({ route }) => route.params.dashboardSlug)
    )
    const orgAndDashboardSlug = Rx.combineLatest(orgStream, dashboardSlugStream)
    return {
      dashboardSlugStream,
      dashboardStream: orgAndDashboardSlug.pipe(
        rx.switchMap(([org, dashboardSlug]) =>
          model.dashboard.getByOrgIdAndSlug(org.id, dashboardSlug)
        )
      )
    }
  }, [])

  return z('.p-dashboard',
    z($dashboard, { orgStream, dashboardSlugStream, dashboardStream })
  )
}
