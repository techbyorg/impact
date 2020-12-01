import { z, useContext, useMemo, useStream } from 'zorium'
import * as Rx from 'rxjs'
import * as rx from 'rxjs/operators'

import $button from 'frontend-shared/components/button'
import $input from 'frontend-shared/components/input'

import context from '../../context'

if (typeof window !== 'undefined' && window !== null) {
  require('./index.styl')
}

export default function $editDashboardOverview ({ dashboardStream }) {
  const { lang, model } = useContext(context)

  const { nameStreams } = useMemo(() => {
    const nameStreams = new Rx.ReplaySubject(1)
    nameStreams.next(
      dashboardStream.pipe(rx.map((dashboard) => dashboard?.name || ''))
    )

    return {
      nameStreams
    }
  }, [])

  const { dashboard, name } = useStream(() => ({
    dashboard: dashboardStream,
    name: nameStreams.pipe(rx.switchAll())
  }))

  const createDashboard = async () => {
    await model.dashboard.upsert({
      id: dashboard?.id,
      name: name
    })
  }

  return z('.z-edit-dashboard-overview', [
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
        onclick: createDashboard,
        shouldHandleLoading: true,
        isFullWidth: false
      })
    ])
  ])
};
