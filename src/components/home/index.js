import { z, useContext } from 'zorium'

import $button from 'frontend-shared/components/button'
import $icon from 'frontend-shared/components/icon'
import { heartDotPath } from 'frontend-shared/components/icon/paths'

import context from '../../context'

if (typeof window !== 'undefined') { require('./index.styl') }

export default function $home () {
  const { colors, lang, router } = useContext(context)

  return z('.z-home', [
    z('.main-info', [
      z('.title', [
        lang.get('home.title'),
        z('.heart', [
          z($icon, {
            icon: heartDotPath,
            color: colors.$secondaryMain,
            size: '16px'
          })
        ])
      ]),
      z('.description', lang.get('home.description')),
      z('.screenshot-container', z('.screenshot')),
      z('.nonprofits-using', lang.get('home.nonprofitsUsing')),
      z('.nonprofits', [
        router.link(z('a.nonprofit.hackclub', {
          href: 'https://impact.techby.org/org/hackclub'
        }, [
          z('.image'),
          z('.name', 'Hack Club')
        ])),
        router.link(z('a.nonprofit.upchieve', {
          href: 'https://data.upchieve.org'
        }, [
          z('.image'),
          z('.name', 'UPchieve')
        ]))
      ])
    ]),
    z('.request-access', [
      z('.title', lang.get('home.inviteOnly')),
      z('.button', [
        z($button, {
          text: lang.get('home.requestAccess'),
          isDisplay: true,
          isFullWidth: false,
          onclick: () => {
            router.openLink('mailto:austin@techby.org')
          }
        })
      ])
    ])
  ])
}
