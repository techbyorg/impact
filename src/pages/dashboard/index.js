import { z, useContext, useMemo, useStream } from 'zorium'
import * as Rx from 'rxjs'
import * as rx from 'rxjs/operators'

import DateService from 'frontend-shared/services/date'
import useMeta from 'frontend-shared/services/use_meta'
import useCssVariables from 'frontend-shared/services/use_css_variables'
import $appBar from 'frontend-shared/components/app_bar'
import $appBarUserMenu from 'frontend-shared/components/app_bar_user_menu'

import $dashboard from '../../components/dashboard'
import context from '../../context'

if (typeof window !== 'undefined') { require('./index.styl') }

const DATE_DEBOUNCE_TIME_MS = 10

export default function $dashboardPage ({ requestsStream }) {
  const { model, router, colors, cookie } = useContext(context)

  const {
    orgStream, orgSlugStream, dashboardSlugStream, segmentStream,
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
    const segmentSlugStream = requestsStream.pipe(
      rx.map(({ route }) => route.params.segmentSlug)
    )
    const orgStream = orgSlugStream.pipe(
      rx.switchMap((orgSlug) => {
        return model.org.getBySlug(orgSlug)
      })
    )
    const segmentStream = segmentSlugStream.pipe(
      rx.switchMap((slug) => {
        if (slug) {
          return model.segment.getBySlug(slug)
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
      segmentStream,
      startDateStreams.pipe(rx.switchAll()),
      endDateStreams.pipe(rx.switchAll()),
      timeScaleStream
    ).pipe(rx.debounceTime(DATE_DEBOUNCE_TIME_MS))

    const isLoadingStream = new Rx.BehaviorSubject(false)

    return {
      orgStream,
      orgSlugStream,
      dashboardSlugStream,
      segmentStream,
      startDateStreams,
      endDateStreams,
      timeScaleStream,
      dashboardStream: orgAndExtrasStream.pipe(
        rx.filter(([org, dashboardSlug, segment, startDate, endDate]) =>
          startDate && endDate
        ),
        rx.tap(() => { isLoadingStream.next(true) }),
        rx.switchMap((options) => {
          const [
            org, dashboardSlug, segment, startDate, endDate, timeScale
          ] = options
          console.log('get dash', options, segment)
          return model.dashboard.getByOrgIdAndSlug(org.id, dashboardSlug, {
            segmentId: segment?.id,
            startDate,
            endDate,
            timeScale
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
    } else if (orgSlug === 'raisedbyus') {
      return colors.getCssVariables({
        '--primary-50': '#FCEAE3',
        '--primary-100': '#F9CAB9',
        '--primary-200': '#F5A78B',
        '--primary-300': '#F0835D',
        '--primary-400': '#ED693A',
        '--primary-500': '#EA4E17',
        '--primary-600': '#E74714',
        '--primary-700': '#E43D11',
        '--primary-800': '#E1350D',
        '--primary-900': '#DB2507',
        '--primary-main': '#EA4E17', // primary500
        '--primary-main-8': 'rgba(234, 78, 23, 0.08)',
        '--secondary-50': '#F2F1F0',
        '--secondary-100': '#DFDBDA',
        '--secondary-200': '#CAC3C1',
        '--secondary-300': '#B4ABA8',
        '--secondary-400': '#A49995',
        '--secondary-500': '#948782',
        '--secondary-600': '#8C7F7A',
        '--secondary-700': '#81746F',
        '--secondary-800': '#776A65',
        '--secondary-900': '#655752'
      })
    } else {
      return colors.getCssVariables()
    }
  }, [orgSlug])

  return z('.p-dashboard', [
    z($appBar, {
      hasLogo: true,
      isContained: false,
      $topRightButton: z($appBarUserMenu)
    }),
    z($dashboard, {
      orgStream,
      dashboardSlugStream,
      segmentStream,
      dashboardStream,
      isLoadingStream,
      startDateStreams,
      endDateStreams,
      timeScaleStream
    })
  ])
}
