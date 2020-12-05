import { z } from 'zorium'
import * as _ from 'lodash-es'

import $sharedApp from 'frontend-shared/app'
import $privacyPage from 'frontend-shared/pages/privacy'

import $dashboardPage from './pages/dashboard'
import $editBlockPage from './pages/edit_block'
import $editDashboardPage from './pages/edit_dashboard'
import $homePage from './pages/home'
import $signInPage from 'frontend-shared/pages/sign_in'
import $settingsPage from './pages/settings'
import $shellPage from './pages/shell'
import $404Page from './pages/404'

export default function $app (props) {
  return z($sharedApp, _.defaults({
    routes: {
      // add to lang/paths_en.json
      // <langKey>: $page
      home: $homePage,
      orgHome: $dashboardPage,
      orgDashboard: $dashboardPage,
      orgDashboardWithSegment: $dashboardPage,
      orgEditBlock: $editBlockPage,
      orgEditBlockWithTab: $editBlockPage,
      orgEditDashboard: $editDashboardPage,
      orgEditDashboardWithTab: $editDashboardPage,
      orgPartner: $dashboardPage,
      orgSignIn: $signInPage,
      orgInvite: $signInPage,
      orgSettings: $settingsPage,
      orgSettingsWithTab: $settingsPage,

      // duplicate for org routes too for custom domains to work
      // TODO: come up with better solution. currently we detect custom
      // domain and add /org/orgSlug to the hash.get
      orgPrivacy: $privacyPage,
      orgShell: $shellPage,
      privacy: $privacyPage,
      shell: $shellPage,
      fourOhFour: $404Page
    }
  }, props))
}
