export default class Block {
  constructor ({ auth }) {
    this.auth = auth
  }

  getAllByDashboardId = (dashboardId, options) => {
    const { segmentId, startDate, endDate, timeScale, hackPw } = options

    return this.auth.stream({
      query: `
        query BlocksByDashboardId(
          $dashboardId: ID!
          $segmentId: ID
          $hackPw: String # FIXME: rm after internal dashboards
          $startDate: String
          $endDate: String
          $timeScale: String
        ) {

        }
`,
      variables: { dashboardId, segmentId, startDate, endDate, timeScale, hackPw },
      pull: 'blocks'
    })
  }
}
