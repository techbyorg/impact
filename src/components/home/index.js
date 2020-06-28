import { z, useContext, useMemo, useStream } from 'zorium'
import * as _ from 'lodash'
import * as Rx from 'rxjs'
import * as rx from 'rxjs/operators'

import $inputDateRange from 'frontend-shared/components/input_date_range'
import DateService from 'frontend-shared/services/date'

import $metricChart from '../metric_chart'
import context from '../../context'

if (typeof window !== 'undefined') { require('./index.styl') }

const ONE_WEEK_MS = 3600 * 24 * 7 * 1000
const UPCHIEVE_COLOR = '#16d2aa' // FIXME

export default function $home ({ org }) {
  const { model } = useContext(context)

  const { startDateStream, endDateStream, metricsStream } = useMemo(() => {
    // TODO: get from url. broken with preact (rerender suspense bug)
    // https://github.com/preactjs/preact/pull/2570
    // const startDateStreams = new Rx.ReplaySubject(1)
    // startDateStreams.next(Rx.of(Date.now()))
    // const endDateStreams = new Rx.ReplaySubject(1)
    // endDateStreams.next(Rx.of(Date.now()))

    const startDateStream = new Rx.BehaviorSubject(
      DateService.format(new Date(Date.now() - ONE_WEEK_MS), 'yyyy-mm-dd')
    )
    const endDateStream = new Rx.BehaviorSubject(
      DateService.format(new Date(), 'yyyy-mm-dd')
    )

    // const datesAndOrg = Rx.combineLatest(
    //   startDateStreams.pipe(rx.switchAll()),
    //   endDateStreams.pipe(rx.switchAll()),
    //   org
    // )
    const datesAndOrg = Rx.combineLatest(
      startDateStream,
      endDateStream,
      org,
      (...vals) => vals
    )

    return {
      startDateStream,
      endDateStream,
      metricsStream: datesAndOrg.pipe(
        rx.filter(([startDate, endDate, org]) => startDate && endDate),
        rx.switchMap(([startDate, endDate, org]) => {
          org = { id: 'abc' } // FIXME
          console.log('get', org, startDate, endDate)
          return model.metric.getAllByOrgId(org.id, { startDate, endDate })
        })
      )
    }
  }, [])

  const { metrics } = useStream(() => ({
    metrics: metricsStream
  }))

  console.log('m', metrics)

  return z('.z-home', [
    z('.top', [
      // select
      z('.calendar', z($inputDateRange, { startDateStream, endDateStream }))
    ]),
    z('.metrics',
      _.map(metrics?.nodes, (metric) => {
        return z('.metric', [
          z($metricChart, { metric, colors: [UPCHIEVE_COLOR] })
        ])
      })
    )
  ])
}
