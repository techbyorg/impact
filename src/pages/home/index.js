import { z } from 'zorium'

import $home from '../../components/home'

if (typeof window !== 'undefined') { require('./index.styl') }

export default function $homePage () {
  return z('.p-home',
    z($home)
  )
}
