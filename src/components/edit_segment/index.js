import { z, useContext, useMemo, useStream } from 'zorium'
import * as rx from 'rxjs/operators'

import $button from 'frontend-shared/components/button'
import $input from 'frontend-shared/components/input'
import { streams } from 'frontend-shared/services/obs'

import context from '../../context'

if (typeof window !== 'undefined') { require('./index.styl') }

export default function $editSegment ({ segmentStreams }) {
  const { lang, model } = useContext(context)

  const { segmentStream, slugStreams } = useMemo(() => {
    const segmentStream = segmentStreams.stream

    const slugStreams = streams(segmentStream.pipe(rx.map((segment) => segment?.slug)))

    return {
      segmentStream,
      slugStreams
    }
  }, [])

  const { slug, segment } = useStream(() => ({
    slug: slugStreams.stream,
    segment: segmentStream
  }))

  const save = () => {
    return model.segment.upsert({ id: segment.id, slug: slug })
  }

  return z('.z-edit-segment', [
    z('.title', lang.get('general.segments')),
    z('.description', lang.get('editSegment.description')),
    z('.input', [
      z($input, {
        valueStreams: slugStreams,
        placeholder: lang.get('editSegment.segmentName'),
        disabled: segment?.slug === 'everyone'
      })
    ]),
    z('.actions', [
      z($button, {
        onclick: save,
        isPrimary: true,
        text: lang.get('general.save'),
        isFullWidth: false,
        shouldHandleLoading: true
      })
    ])
  ])
}
