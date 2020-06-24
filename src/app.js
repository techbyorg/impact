import { z } from 'zorium'
import * as _ from 'lodash-es'

import $sharedApp from 'frontend-shared/app'
import $privacyPage from 'frontend-shared/pages/privacy'

import $homePage from './pages/home'
import $shellPage from './pages/shell'
import $404Page from './pages/404'

export default function $app (props) {
  return z($sharedApp, _.defaults({
    routes: {
      // add to lang/paths_en.json
      // <langKey>: $page
      home: $homePage,
      privacy: $privacyPage,
      shell: $shellPage,
      fourOhFour: $404Page
    }
  }, props))
}
