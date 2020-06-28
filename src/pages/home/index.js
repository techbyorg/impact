import { z } from 'zorium'
import * as Rx from 'rxjs'

import $home from '../../components/home'

if (typeof window !== 'undefined') { require('./index.styl') }

export default function $homePage () {
  const org = new Rx.BehaviorSubject({}) // FIXME, subdomain, maybe in app.js

  return z('.p-home',
    z($home, { org })
  )
}
