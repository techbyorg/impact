import { z } from 'zorium'

import $sourcePermissions from 'frontend-shared/components/source_permissions'

// import context from '../../context'

if (typeof window !== 'undefined' && window !== null) {
  require('./index.styl')
}

export default function $editDashboard ({ dashboardStream }) {
  // const { lang, model } = useContext(context)

  return z('.z-edit-dashboard-permissions', [
    z($sourcePermissions, {
      sourceStream: dashboardStream, sourceType: 'impact-dashboard'
    })
  ])
};
