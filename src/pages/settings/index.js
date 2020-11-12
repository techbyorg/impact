import { z } from 'zorium'

import $appBar from 'frontend-shared/components/app_bar'

import $appBarUserMenu from '../../components/app_bar_user_menu'
import $settings from '../../components/settings'

if (typeof window !== 'undefined') { require('./index.styl') }

export default function $settingsPage () {
  return z('.p-settings',
    z($appBar, {
      hasLogo: true,
      $topRightButton: z($appBarUserMenu)
    }),
    z($settings)
  )
}
