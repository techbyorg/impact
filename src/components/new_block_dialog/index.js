import { z, useContext, useMemo, useStream } from 'zorium'
import * as Rx from 'rxjs'
import * as rx from 'rxjs/operators'
import * as _ from 'lodash-es'

import $dialog from 'frontend-shared/components/dialog'

import $editBlockOverview from '../edit_block_overview'
import context from '../../context'

if (typeof window !== 'undefined' && window !== null) {
  require('./index.styl')
}

export default function $newBlockDialog (props) {
  const { dashboardId, blockIdStream, onClose } = props
  const { lang, model } = useContext(context)

  const { blockStream } = useMemo(() => {
    const blockStream = blockIdStream.pipe(
      rx.switchMap((blockId) =>
        blockId ? model.block.getById(blockId) : Rx.of(null)
      )
    )

    return { blockStream }
  }, [])

  return z('.z-new-block-dialog', [
    z($dialog, {
      onClose,
      isWide: true,
      $title: lang.get('newBlockDialog.title'),
      $content:
        z('.z-new-block-dialog_content', [
          z($editBlockOverview, {
            blockStream, dashboardId, onSave: onClose
          })
        ])
      // $actions:
      //   z('.z-new-block-dialog_actions', [
      //     z('.save', [
      //       z($button, {
      //         text: lang.get('general.save'),
      //         isPrimary: true,
      //         onclick: createBlock,
      //         shouldHandleLoading: true
      //       })
      //     ])
      //   ])
    })
  ])
};
