import { z, useContext, useMemo } from 'zorium'
import * as rx from 'rxjs/operators'

import $appBar from 'frontend-shared/components/app_bar'
import $appBarUserMenu from 'frontend-shared/components/app_bar_user_menu'
import $settings from 'frontend-shared/components/settings'

import $metrics from '../../components/metrics'
import $segments from '../../components/segments'

import context from '../../context'

if (typeof window !== 'undefined') { require('./index.styl') }

export default function $settingsPage ({ requestsStream }) {
  const { router, lang } = useContext(context)

  const { currentTabStream } = useMemo(() => {
    return {
      currentTabStream: requestsStream.pipe(
        rx.map(({ route }) => route.params.tab)
      )
    }
  }, [])

  const additionalTabs = [
    {
      menuItem: 'metrics',
      text: lang.get('general.metrics'),
      path: router.get('orgSettingsWithTab', { tab: 'metrics' }),
      $tab: $metrics
    },
    {
      menuItem: 'segments',
      text: lang.get('general.segments'),
      path: router.get('orgSettingsWithTab', { tab: 'segments' }),
      $tab: $segments
    }
  ]

  return z('.p-settings',
    z($appBar, {
      hasLogo: true,
      isContained: false,
      $topRightButton: z($appBarUserMenu)
    }),
    z($settings, { currentTabStream, additionalTabs })
  )
}
