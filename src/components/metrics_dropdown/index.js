// TODO: settings page might be better in frontend-shared
import { z, useContext, useMemo, useStream } from 'zorium'
import _ from 'lodash-es'

import $dropdown from 'frontend-shared/components/dropdown'

import context from '../../context'

if (typeof window !== 'undefined') { require('./index.styl') }

export default function $metricsDropdown ({ metricStream, onChange }) {
  const { model, lang } = useContext(context)

  const { metricsStream } = useMemo(() => {
    return {
      metricsStream: model.metric.getAll()
    }
  }, [])

  const { metrics } = useStream(() => ({
    metrics: metricsStream
  }))

  return !_.isEmpty(metrics?.nodes) && z('.z-metrics-dropdown', [
    z($dropdown, {
      placeholder: lang.get('metricDropdown.placeholder'),
      valueStream: metricStream,
      onChange,
      options: [{
        value: 'all', text: lang.get('general.all')
      }].concat(_.map(metrics.nodes, ({ id, name }) => ({
        value: id,
        text: name
      })))
    })
  ])
}
