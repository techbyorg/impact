import { z, useContext, useMemo, useStream } from 'zorium'

import $avatar from 'frontend-shared/components/avatar'
import $icon from 'frontend-shared/components/icon'
import { friendsIconPath, settingsIconPath } from 'frontend-shared/components/icon/paths'

import context from '../../context'

if (typeof window !== 'undefined') { require('./index.styl') }

export default function $appBarUserMenu () {
  const { model, colors, router } = useContext(context)

  const { meStream } = useMemo(() => {
    return {
      meStream: model.user.getMe()
    }
  }, [])

  const { me } = useStream(() => ({
    me: meStream
  }))

  return z('.z-app-bar-user-menu', [
    z('.icon', z($icon, {
      icon: friendsIconPath,
      color: colors.$bgText60,
      isTouchTarget: true,
      onclick: () => {
        router.go('orgSignIn')
      }
    })),
    z('.icon', z($icon, {
      icon: settingsIconPath,
      color: colors.$bgText60,
      isTouchTarget: true,
      onclick: () => {
        router.go('orgSettings')
      }
    })),
    z($avatar, { user: me })
  ])
}
