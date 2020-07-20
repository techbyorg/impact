import { z } from 'zorium'
import * as _ from 'lodash-es'

import $sharedApp from 'frontend-shared/app'
import $privacyPage from 'frontend-shared/pages/privacy'

import $dashboardPage from './pages/dashboard'
import $shellPage from './pages/shell'
import $404Page from './pages/404'

export default function $app (props) {
  return z($sharedApp, _.defaults({
    routes: {
      // add to lang/paths_en.json
      // <langKey>: $page
      home: $dashboardPage,
      orgHome: $dashboardPage,
      orgDashboard: $dashboardPage,

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
