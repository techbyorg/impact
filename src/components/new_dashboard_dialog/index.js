import { z, useContext, useMemo, useStream } from 'zorium'
import * as Rx from 'rxjs'
import * as rx from 'rxjs/operators'
import * as _ from 'lodash'

import $button from 'frontend-shared/components/button'
import $dialog from 'frontend-shared/components/dialog'
import $input from 'frontend-shared/components/input'
// import $rolePicker from 'frontend-shared/components/role_picker'
import $toggle from 'frontend-shared/components/toggle'

import context from '../../context'

if (typeof window !== 'undefined' && window !== null) {
  require('./index.styl')
}

export default function $newDashboardDialog ({ dashboardIdStream, onClose }) {
  const { lang, model } = useContext(context)

  const { dashboardStream, nameStreams, isPrivateStreams } = useMemo(() => {
    const dashboardStream = dashboardIdStream.pipe(
      rx.switchMap((dashboardId) =>
        dashboardId ? model.dashboard.getById(dashboardId) : Rx.of(null)
      )
    )
    const nameStreams = new Rx.ReplaySubject(1)
    nameStreams.next(
      dashboardStream.pipe(rx.map((dashboard) => dashboard?.name || ''))
    )

    const isPrivateStreams = new Rx.ReplaySubject(1)
    isPrivateStreams.next(dashboardStream.pipe(
      rx.map((dashboard) => {
        console.log('dash', dashboard)
        return dashboard?.defaultPermissions ? !dashboard.defaultPermissions.view : false
      }))
    )

    const roleIdsStreams = new Rx.ReplaySubject(1)
    // FIXME: go through all roles and see which have perm for this dash
    roleIdsStreams.next(Rx.of([]))

    return {
      dashboardStream,
      nameStreams,
      roleIdsStreams,
      isPrivateStreams
    }
  }, [])

  const { dashboard, dashboardId, name, isPrivate } = useStream(() => ({
    dashboard: dashboardStream,
    dashboardId: dashboardIdStream,
    name: nameStreams.pipe(rx.switchAll()),
    isPrivate: isPrivateStreams.pipe(rx.switchAll())
  }))

  const createDashboard = async () => {
    await model.dashboard.upsert({
      id: dashboardId,
      name: name,
      defaultPermissions: _.defaults({ view: !isPrivate }, dashboard.defaultPermissions)
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
          })),
          z('.input', [
            z('label.label', [
              z('.title', lang.get('newBlockDialog.private')),
              z('.description', lang.get('newBlockDialog.privateDescription'))
            ]),
            z($toggle, { isSelectedStreams: isPrivateStreams })
          ])//,
          // z('.input', z($rolePicker, {
          //   roleIdsStreams,
          //   sourceType: 'dashboard',
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
