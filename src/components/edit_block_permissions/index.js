import { z } from 'zorium'

import $sourcePermissions from 'frontend-shared/components/source_permissions'

// import context from '../../context'

if (typeof window !== 'undefined' && window !== null) {
  require('./index.styl')
}

export default function $editBlock ({ blockStream }) {
  // const { lang, model } = useContext(context)

  return z('.z-edit-block-permissions', [
    z($sourcePermissions, {
      sourceStream: blockStream, sourceType: 'impact-block'
    })
  ])
};
