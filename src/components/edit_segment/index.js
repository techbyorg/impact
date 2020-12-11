import { z, useContext, useMemo, useStream } from 'zorium'
import * as rx from 'rxjs/operators'
import * as _ from 'lodash-es'

import $input from 'frontend-shared/components/input'
import $unsavedSnackBar from 'frontend-shared/components/unsaved_snack_bar'
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

  const reset = () => {
    slugStreams.reset()
  }

  const save = () => {
    return model.segment.upsert({ id: segment.id, slug: slug })
  }

  const isUnsaved = slugStreams.isChanged()

  return z('.z-edit-segment', [
    z('.title', lang.get('general.segments')),
    z('.description', lang.get('editSegment.description')),
    z('.input', [
      z($input, {
        valueStreams: slugStreams,
        placeholder: lang.get('editSegment.segmentName')
      })
    ]),
    isUnsaved && z($unsavedSnackBar, {
      onCancel: reset,
      onSave: save
    })
  ])
}
