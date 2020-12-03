import { z, useContext, useMemo, useStream } from 'zorium'
import * as Rx from 'rxjs'
import * as rx from 'rxjs/operators'

import $button from 'frontend-shared/components/button'
import $input from 'frontend-shared/components/input'

import context from '../../context'

if (typeof window !== 'undefined' && window !== null) {
  require('./index.styl')
}

export default function $editDashboardOverview ({ dashboardStream, onSave }) {
  const { lang, model, router } = useContext(context)

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
    onSave?.()
  }

  const deleteDashboard = async () => {
    if (confirm(lang.get('general.areYouSure'))) {
      await model.dashboard.deleteById(dashboard.id)
      router.go('orgHome')
    }
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
    z('.actions', [
      dashboard && z($button, {
        text: lang.get('general.delete'),
        onclick: deleteDashboard,
        shouldHandleLoading: true,
        isFullWidth: false
      }),
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
