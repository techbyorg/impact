import { z, useContext, useMemo } from 'zorium'
import * as rx from 'rxjs/operators'

import $appBar from 'frontend-shared/components/app_bar'
import $appBarUserMenu from 'frontend-shared/components/app_bar_user_menu'

import $editDashboard from '../../components/edit_dashboard'

import context from '../../context'

if (typeof window !== 'undefined') { require('./index.styl') }

export default function $editDashboardPage ({ requestsStream }) {
  const { model } = useContext(context)

  const { currentTabStream, dashboardStream } = useMemo(() => {
    return {
      currentTabStream: requestsStream.pipe(
        rx.map(({ route }) => route.params.tab)
      ),
      dashboardStream: requestsStream.pipe(
        rx.switchMap(({ route }) =>
          model.dashboard.getBySlug(route.params.dashboardSlug)
        )
      )
    }
  }, [])

  return z('.p-edit-dashboard',
    z($appBar, {
      hasLogo: true,
      isContained: false,
      $topRightButton: z($appBarUserMenu)
    }),
    z($editDashboard, { currentTabStream, dashboardStream })
  )
}
