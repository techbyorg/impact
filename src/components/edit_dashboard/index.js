import { z, useContext, useStream } from 'zorium'

import $sourceSettings from 'frontend-shared/components/source_settings'

import $editDashboardOverview from '../edit_dashboard_overview'
import $editDashboardPermissions from '../edit_dashboard_permissions'
import context from '../../context'

if (typeof window !== 'undefined' && window !== null) {
  require('./index.styl')
}

export default function $editDashboard ({ currentTabStream, dashboardStream }) {
  const { lang, router } = useContext(context)

  const { dashboard } = useStream(() => ({
    dashboard: dashboardStream
  }))

  const tabs = {
    overview: {
      title: lang.get('settingsTabs.overview'),
      path: router.get('orgEditDashboardWithTab', {
        dashboardSlug: dashboard?.slug,
        tab: 'overview'
      }),
      $el: $editDashboardOverview
    },
    permissions: {
      title: lang.get('settingsTabs.permissions'),
      path: router.get('orgEditDashboardWithTab', {
        dashboardSlug: dashboard?.slug,
        tab: 'permissions'
      }),
      $el: $editDashboardPermissions
    }
  }

  console.log('tabs', tabs, dashboard)

  return z('.z-edit-dashboard',
    z($sourceSettings, {
      title: dashboard?.name,
      subtitle: lang.get('editDashboard.title'),
      currentTabStream,
      tabs,
      tabProps: { dashboardStream }
    })
  )
};
