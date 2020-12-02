import { z, useContext, useMemo } from 'zorium'
import * as Rx from 'rxjs'

import $dialog from 'frontend-shared/components/dialog'

import $editDashboardOverview from '../edit_dashboard_overview'
import context from '../../context'

if (typeof window !== 'undefined' && window !== null) {
  require('./index.styl')
}

export default function $newDashboardDialog ({ dashboardIdStream, onClose }) {
  const { lang } = useContext(context)

  const { dashboardStream } = useMemo(() => {
    return { dashboardStream: Rx.of(null) }
  }, [])

  return z('.z-new-dashboard-dialog', [
    z($dialog, {
      onClose,
      $title: lang.get('newDashboardDialog.title'),
      $content:
        z('.z-dashboard-dialog_content', [
          z($editDashboardOverview, {
            dashboardStream,
            onSave: onClose
          })
        ])
    })
  ])
};
