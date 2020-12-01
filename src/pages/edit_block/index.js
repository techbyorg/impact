import { z, useContext, useMemo } from 'zorium'
import * as rx from 'rxjs/operators'

import $appBar from 'frontend-shared/components/app_bar'
import $appBarUserMenu from 'frontend-shared/components/app_bar_user_menu'

import $editBlock from '../../components/edit_block'

import context from '../../context'

if (typeof window !== 'undefined') { require('./index.styl') }

export default function $editBlockPage ({ requestsStream }) {
  const { model } = useContext(context)

  const { currentTabStream, blockStream } = useMemo(() => {
    return {
      currentTabStream: requestsStream.pipe(
        rx.map(({ route }) => route.params.tab)
      ),
      blockStream: requestsStream.pipe(
        rx.switchMap(({ route }) =>
          model.block.getById(route.params.id)
        )
      )
    }
  }, [])

  return z('.p-edit-block',
    z($appBar, {
      hasLogo: true,
      isContained: false,
      $topRightButton: z($appBarUserMenu)
    }),
    z($editBlock, { currentTabStream, blockStream })
  )
}
