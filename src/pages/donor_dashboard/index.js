import { z } from 'zorium'

import $donorDashboard from '../../components/donor_dashboard'

if (typeof window !== 'undefined') { require('./index.styl') }

export default function $donorDashboardPage () {
  return z('.p-donor-dashboard',
    z($donorDashboard)
  )
}
