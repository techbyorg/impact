import { z, useContext, useMemo, useStream } from 'zorium'
import * as Rx from 'rxjs'
import * as rx from 'rxjs/operators'

import $button from 'frontend-shared/components/button'
import $dialog from 'frontend-shared/components/dialog'
import $input from 'frontend-shared/components/input'
// import $rolePicker from 'frontend-shared/components/role_picker'

import context from '../../context'

if (typeof window !== 'undefined' && window !== null) {
  require('./index.styl')
}

export default function $newDashboardDialog ({ dashboardIdStream, onClose }) {
  const { lang, model } = useContext(context)

  const { nameStreams } = useMemo(() => {
    const dashboardStream = dashboardIdStream.pipe(
      rx.switchMap((dashboardId) =>
        dashboardId ? model.dashboard.getById(dashboardId) : Rx.of(null)
      )
    )
    const nameStreams = new Rx.ReplaySubject(1)
    nameStreams.next(
      dashboardStream.pipe(rx.map((dashboard) => dashboard?.name || ''))
    )

    const roleIdsStreams = new Rx.ReplaySubject(1)
    // FIXME: go through all roles and see which have perm for this dash
    roleIdsStreams.next(Rx.of([]))

    return {
      nameStreams,
      roleIdsStreams
    }
  }, [])

  const { dashboardId, name } = useStream(() => ({
    dashboardId: dashboardIdStream,
    name: nameStreams.pipe(rx.switchAll())
  }))

  const createDashboard = async () => {
    await model.dashboard.upsert({
      id: dashboardId,
      name: name
    })
    onClose()
  }

  return z('.z-new-dashboard-dialog', [
    z($dialog, {
      onClose,
      $title: lang.get('newDashboardDialog.title'),
      $content:
        z('.z-new-dashboard-dialog_content', [
          z('.input', z($input, {
            valueStreams: nameStreams,
            placeholder: lang.get('general.name'),
            type: 'text'
          }))//,
          // z('.input', z($rolePicker, {
          //   roleIdsStreams,
          //   sourceType: 'impact-dashboard',
          //   sourceIdStream: dashboardIdStream
          // }))
        ]),
      $actions:
        z('.z-dashboard-dialog_actions', [
          z('.save', [
            z($button, {
              text: lang.get('general.save'),
              isPrimary: true,
              onclick: createDashboard,
              shouldHandleLoading: true
            })
          ])
        ])
    })
  ])
};
