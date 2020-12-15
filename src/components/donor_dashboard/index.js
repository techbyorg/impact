import { z, useContext, useMemo, useStream } from 'zorium'
import * as _ from 'lodash'

import context from '../../context'

if (typeof window !== 'undefined') { require('./index.styl') }

export default function $donorDashboard () {
  const { model } = useContext(context)

  const { orgsStream } = useMemo(() => {
    return {
      orgsStream: model.org.getAll()
    }
  })

  const { orgs } = useStream(() => ({
    orgs: orgsStream
  }))

  console.log('orgs', orgs)

  return z('.z-donor-dashboard', [
    z('.orgs', _.map(orgs?.nodes, (org) => {
      return z('.org', [
        org.name
      ])
    }))
  ])
}
