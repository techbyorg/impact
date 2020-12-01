import { z, useContext, useMemo, useStream } from 'zorium'
import * as Rx from 'rxjs'
import * as rx from 'rxjs/operators'

import $button from 'frontend-shared/components/button'
import $input from 'frontend-shared/components/input'

import context from '../../context'

if (typeof window !== 'undefined' && window !== null) {
  require('./index.styl')
}

export default function $editBlockOverview ({ blockStream }) {
  const { lang, model } = useContext(context)

  const { nameStreams } = useMemo(() => {
    const nameStreams = new Rx.ReplaySubject(1)
    nameStreams.next(
      blockStream.pipe(rx.map((block) => block?.name || ''))
    )

    return {
      nameStreams
    }
  }, [])

  const { block, name } = useStream(() => ({
    block: blockStream,
    name: nameStreams.pipe(rx.switchAll())
  }))

  console.log('block', block)

  const createBlock = async () => {
    await model.block.upsert({
      id: block?.id,
      name: name
    })
  }

  return z('.z-edit-block-overview', [
    z('.input', [
      z('.label', lang.get('general.name')),
      z($input, {
        valueStreams: nameStreams,
        placeholder: lang.get('general.name'),
        type: 'text'
      })
    ]),
    z('.save', [
      z($button, {
        text: lang.get('general.save'),
        isPrimary: true,
        onclick: createBlock,
        shouldHandleLoading: true,
        isFullWidth: false
      })
    ])
  ])
};
