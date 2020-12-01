import { z, useContext, useStream } from 'zorium'

import $sourceSettings from 'frontend-shared/components/source_settings'

import $editBlockOverview from '../edit_block_overview'
import $editBlockPermissions from '../edit_block_permissions'
import context from '../../context'

if (typeof window !== 'undefined' && window !== null) {
  require('./index.styl')
}

export default function $editBlock ({ currentTabStream, blockStream }) {
  const { lang, router } = useContext(context)

  const { block } = useStream(() => ({
    block: blockStream
  }))

  const tabs = {
    overview: {
      title: lang.get('settingsTabs.overview'),
      path: router.get('orgEditBlockWithTab', {
        id: block?.id,
        tab: 'overview'
      }),
      $el: $editBlockOverview
    },
    permissions: {
      title: lang.get('settingsTabs.permissions'),
      path: router.get('orgEditBlockWithTab', {
        id: block?.id,
        tab: 'permissions'
      }),
      $el: $editBlockPermissions
    }
  }

  console.log('tabs', tabs, block)

  return z('.z-edit-block',
    z($sourceSettings, {
      title: block?.name,
      subtitle: lang.get('editBlock.title'),
      currentTabStream,
      tabs,
      tabProps: { blockStream }
    })
  )
};
