import { z, useContext, useMemo, useStream } from 'zorium'
import * as Rx from 'rxjs'

import $button from 'frontend-shared/components/button'
import $dialog from 'frontend-shared/components/dialog'
import $input from 'frontend-shared/components/input'

import context from '../../context'

if (typeof window !== 'undefined' && window !== null) {
  require('./index.styl')
}

export default function $newDashboardDialog ({ dashboardId, onClose }) {
  const { lang, model } = useContext(context)

  const { nameStream } = useMemo(() => {
    return {
      nameStream: new Rx.BehaviorSubject('')
    }
  }, [])

  const { name } = useStream(() => ({
    name: nameStream
  }))

  const createDashboard = async () => {
    await model.dashboard.upsert({
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
          z('.content', [
            z($input, {
              valueStream: nameStream,
              placeholder: lang.get('general.name'),
              type: 'text'
            })
          ])
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
