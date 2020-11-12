// TODO: settings page might be better in frontend-shared
import { z, useContext, useMemo, useStream } from 'zorium'

import $orgUsers from '../org_users'
import context from '../../context'

if (typeof window !== 'undefined') { require('./index.styl') }

export default function $settings () {
  // const { model } = useContext(context)

  return z('.z-settings', [
    z($orgUsers)
  ])
}
