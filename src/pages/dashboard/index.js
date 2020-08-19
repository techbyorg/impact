import { z, useContext, useMemo, useStream } from 'zorium'
import * as Rx from 'rxjs'
import * as rx from 'rxjs/operators'

import DateService from 'frontend-shared/services/date'
import useMeta from 'frontend-shared/services/use_meta'
import useCssVariables from 'frontend-shared/services/use_css_variables'

import $dashboard from '../../components/dashboard'
import context from '../../context'

if (typeof window !== 'undefined') { require('./index.styl') }

const DATE_DEBOUNCE_TIME_MS = 10

export default function $dashboardPage ({ requestsStream }) {
  const { model, router, colors, cookie } = useContext(context)

  const {
    orgStream, orgSlugStream, dashboardSlugStream, partnerStream,
    dashboardStream, isLoadingStream, startDateStreams, endDateStreams,
    timeScaleStream
  } = useMemo(() => {
    const dashboardSlugStream = requestsStream.pipe(
      rx.map(({ route }) => route.params.dashboardSlug)
    )
    const orgSlugStream = requestsStream.pipe(
      rx.map(({ route }) => {
        if (route.params.orgSlug) {
          return route.params.orgSlug
        } else if (router.getHost() === 'data.upchieve.org') {
          // FIXME: non-hardcoded
          return 'upchieve'
        } else if (router.getHost() === 'numberwang.hackclub.com') {
          return 'hackclub'
        }
      })
    )
    const partnerSlugStream = requestsStream.pipe(
      rx.map(({ route }) => route.params.partnerSlug)
    )
    const orgStream = orgSlugStream.pipe(
      rx.switchMap((orgSlug) => {
        return model.org.getBySlug(orgSlug)
      })
    )
    const orgAndPartnerSlugStream = Rx.combineLatest(
      orgStream, partnerSlugStream
    )
    const partnerStream = orgAndPartnerSlugStream.pipe(
      rx.switchMap(([org, partnerSlug]) => {
        if (partnerSlug) {
          return model.partner.getByOrgIdAndSlug(org.id, partnerSlug)
        } else {
          return Rx.of(null)
        }
      })
    )

    const timeScaleStream = new Rx.BehaviorSubject(
      cookie.get('timeScale') || 'month'
    )
    const initialPresetDateRange = cookie.get('presetDateRange') || 'last6Months'
    const presetDates = DateService.getDatesFromPresetDateRange(
      initialPresetDateRange
    )

    // TODO: get from url
    const startDateStreams = new Rx.ReplaySubject(1)
    startDateStreams.next(
      Rx.of(
        cookie.get('startDate') ||
          DateService.format(presetDates.startDate, 'yyyy-mm-dd')
      )
    )
    const endDateStreams = new Rx.ReplaySubject(1)
    endDateStreams.next(
      Rx.of(
        cookie.get('endDate') ||
          DateService.format(presetDates.endDate, 'yyyy-mm-dd')
      )
    )

    const orgAndExtrasStream = Rx.combineLatest(
      orgStream,
      dashboardSlugStream,
      partnerStream,
      startDateStreams.pipe(rx.switchAll()),
      endDateStreams.pipe(rx.switchAll()),
      timeScaleStream
    ).pipe(rx.debounceTime(DATE_DEBOUNCE_TIME_MS))

    const isLoadingStream = new Rx.BehaviorSubject(false)

    // FIXME: rm when internal dashboard
    const urlParams = new URLSearchParams(globalThis?.window?.location.search)
    const hackPw = urlParams.get('secret') || cookie.get('hackPw')
    if (hackPw) {
      cookie.set('hackPw', hackPw)
    }

    return {
      orgStream,
      orgSlugStream,
      dashboardSlugStream,
      partnerStream,
      startDateStreams,
      endDateStreams,
      timeScaleStream,
      dashboardStream: orgAndExtrasStream.pipe(
        rx.filter(([org, dashboardSlug, partner, startDate, endDate]) =>
          startDate && endDate
        ),
        rx.tap(() => { isLoadingStream.next(true) }),
        rx.switchMap((options) => {
          const [
            org, dashboardSlug, partner, startDate, endDate, timeScale
          ] = options
          console.log('get dash', options)
          return model.dashboard.getByOrgIdAndSlug(org.id, dashboardSlug, {
            segmentId: partner?.segmentId,
            startDate,
            endDate,
            timeScale,
            hackPw // FIXME: rm when we have internal dashboards
          })
        }),
        rx.tap(() => { isLoadingStream.next(false) })
      )
    }
  }, [])

  const { org, orgSlug } = useStream(() => ({
    org: orgStream,
    orgSlug: orgSlugStream
  }))

  useMeta((org) => {
    // TODO: non-hardcoded
    // FIXME: org?.slug doesn't seem to be defined
    if (org?.slug === 'upchieve' || router.getHost() === 'data.upchieve.org') {
      return {
        title: 'UPchieve Transparent Data',
        description: 'UPchieve is an EdTech nonprofit providing on-demand STEM tutoring + college counseling to underserved HS students in the U.S.'
      }
    } else {
      return {
        title: 'Hack Club Transparent Data',
        description: 'Hack Club is a global network of programming clubs where members learn to code through tinkering and building projects.'
      }
    }
  }, [org])

  useCssVariables(() => {
    if (orgSlug === 'upchieve') {
      return colors.getCssVariables({
        '--primary-50': '#E3FAF5',
        '--primary-100': '#B9F2E6',
        '--primary-200': '#8BE9D5',
        '--primary-300': '#5CE0C4',
        '--primary-400': '#39D9B7',
        '--primary-500': '#16D2AA',
        '--primary-600': '#13CDA3',
        '--primary-700': '#10C799',
        '--primary-800': '#0CC190',
        '--primary-900': '#06B67F',
        '--primary-main': '#16d2aa', // primary500
        '--primary-main-8': 'rgba(22, 210, 170, 0.08)',
        '--secondary-50': '#E6F3F9',
        '--secondary-100': '#C2E0F0',
        '--secondary-200': '#99CCE7',
        '--secondary-300': '#70B7DD',
        '--secondary-400': '#51A7D5',
        '--secondary-500': '#3298CE',
        '--secondary-600': '#2D90C9',
        '--secondary-700': '#2685C2',
        '--secondary-800': '#1F7BBC',
        '--secondary-900': '#136AB0'
      })
    } else if (orgSlug === 'hackclub') {
      return colors.getCssVariables({
        '--primary-50': '#FDE7EA',
        '--primary-100': '#F9C3CB',
        '--primary-200': '#F69BA8',
        '--primary-300': '#F27385',
        '--primary-400': '#EF556A',
        '--primary-500': '#EC3750',
        '--primary-600': '#EA3149',
        '--primary-700': '#E72A40',
        '--primary-800': '#E42337',
        '--primary-900': '#DF1627',
        '--primary-main': '#EC3750', // primary500
        '--primary-main-8': 'rgba(236, 55, 80, 0.08)',
        '--secondary-50': '#E4E6E8',
        '--secondary-100': '#BCC0C5',
        '--secondary-200': '#8F969E',
        '--secondary-300': '#626C77',
        '--secondary-400': '#414D5A',
        '--secondary-500': '#1F2D3D',
        '--secondary-600': '#1B2837',
        '--secondary-700': '#17222F',
        '--secondary-800': '#121C27',
        '--secondary-900': '#0A111A'
      })
    } else if (orgSlug === 'freeroam') {
      return colors.getCssVariables({
        '--primary-50': '#FBE9E7',
        '--primary-100': '#FFCCBC',
        '--primary-200': '#FFAB91',
        '--primary-300': '#FF8A65',
        '--primary-400': '#FF7043',
        '--primary-500': '#FF5722',
        '--primary-600': '#F4511E',
        '--primary-700': '#E64A19',
        '--primary-800': '#D84315',
        '--primary-900': '#BF360C',
        '--primary-main': '#FF5722', // primary500
        '--primary-main-8': 'rgba(255, 87, 34, 0.08)',
        '--secondary-50': '#E0F2F1',
        '--secondary-100': '#B2DFDB',
        '--secondary-200': '#80CBC4',
        '--secondary-300': '#4DB6AC',
        '--secondary-400': '#26A69A',
        '--secondary-500': '#009688',
        '--secondary-600': '#00897B',
        '--secondary-700': '#00796B',
        '--secondary-800': '#00695C',
        '--secondary-900': '#004D40'
      })
    } else {
      return colors.getCssVariables()
    }
  }, [orgSlug])

  return z('.p-dashboard',
    z($dashboard, {
      orgStream,
      dashboardSlugStream,
      partnerStream,
      dashboardStream,
      isLoadingStream,
      startDateStreams,
      endDateStreams,
      timeScaleStream
    })
  )
}
