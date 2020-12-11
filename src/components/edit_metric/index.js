import { z, useContext, useMemo, useStream } from 'zorium'
import * as Rx from 'rxjs'
import * as rx from 'rxjs/operators'
import * as _ from 'lodash'

import $input from 'frontend-shared/components/input'
import $dropdown from 'frontend-shared/components/dropdown'
import $unsavedSnackBar from 'frontend-shared/components/unsaved_snack_bar'
import { streams } from 'frontend-shared/services/obs'

import $metricsDropdown from '../metrics_dropdown'
import context from '../../context'

if (typeof window !== 'undefined') { require('./index.styl') }

// FIXME: unit, type (derived), transforms ([{opreration, metricId}])
export default function $editMetric ({ metricStreams }) {
  const { lang, model } = useContext(context)

  const UNITS = {
    custom: lang.get('unit.custom'),
    percentFraction: lang.get('unit.percentFraction'),
    cents: lang.get('unit.cents'),
    dollars: lang.get('unit.dollars'),
    float: lang.get('unit.float')
  }
  const TRANSFORM_OPERATIONS = {
    base: lang.get('operations.base'),
    '/': lang.get('operations./')
  }

  const {
    metricStream, nameStreams, unitStreams, hasTransformsChangedStream
  } = useMemo(() => {
    const metricStream = metricStreams.stream.pipe(rx.map((metric) => {
      if (!metric) {
        return metric
      }
      metric.transforms = _.map(metric.transforms, (transform) =>
        _.defaults({
          key: Math.random(),
          operationStream: new Rx.BehaviorSubject(transform.operation),
          metricStream: new Rx.BehaviorSubject(transform.metric.id)
        }, transform)
      )
      return metric
    }))

    const nameStreams = streams(metricStream.pipe(rx.map((metric) => metric?.name)))
    const unitStreams = streams(metricStream.pipe(rx.map((metric) => metric?.unit)))

    return {
      metricStream,
      nameStreams,
      unitStreams,
      hasTransformsChangedStream: new Rx.BehaviorSubject(false)
    }
  }, [])

  const { name, unit, metric, hasTransformsChanged } = useStream(() => ({
    name: nameStreams.stream,
    unit: unitStreams.stream,
    metric: metricStream,
    hasTransformsChanged: hasTransformsChangedStream
  }))

  const reset = () => {
    nameStreams.reset()
    unitStreams.reset()
    metricStreams.reset()
    hasTransformsChangedStream.next(false)
  }

  const save = async () => {
    const transforms = _.flatten(
      _.map(metric.transforms, ({ operationStream, metricStream }) => ({
        operation: operationStream.getValue(),
        metricId: metricStream.getValue()
      }))
    )
    await model.metric.upsert({ id: metric.id, name, unit, transforms })
    hasTransformsChangedStream.next(false)
  }

  const isUnsaved = nameStreams.isChanged() || unitStreams.isChanged() ||
    hasTransformsChanged

  console.log('metric', metric?.transforms)

  return z('.z-edit-metric', [
    z('.title', lang.get('general.metrics')),
    z('.description', lang.get('editMetric.description')),
    z('.input', [
      z($input, {
        valueStreams: nameStreams,
        placeholder: lang.get('editMetric.metricName')
      })
    ]),
    z('.input', [
      z($dropdown, {
        valueStreams: unitStreams,
        placeholder: lang.get('editMetric.unit'),
        options: _.map(UNITS, (text, value) => ({ value, text }))
      })
    ]),
    z('.transforms', [
      z('.title', lang.get('editMetric.transforms')),
      _.map(metric?.transforms, ({ key, operation, operationStream, metricStream }) => {
        return z('.transform', { key }, [
          z('.operation', [
            z('.input', [
              z($dropdown, {
                valueStream: operationStream,
                placeholder: lang.get('editMetric.operation'),
                options: _.map(TRANSFORM_OPERATIONS, (text, value) => ({ value, text })),
                onChange: () => hasTransformsChangedStream.next(true)
              })
            ])
          ]),
          z('.metric', [
            z($metricsDropdown, {
              metricStream,
              onChange: () => hasTransformsChangedStream.next(true)
            })
          ])
        ])
      })
    ]),
    isUnsaved && z($unsavedSnackBar, {
      onCancel: reset,
      onSave: save
    })
  ])
}
