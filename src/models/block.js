export default class Block {
  constructor ({ auth }) {
    this.auth = auth
  }

  getAllByDashboardId = (dashboardId, options) => {
    const { segmentId, startDate, endDate, timeScale } = options

    return this.auth.stream({
      query: `
        query BlocksByDashboardId(
          $dashboardId: ID!
          $segmentId: ID
          $startDate: String
          $endDate: String
          $timeScale: String
        ) {

        }
`,
      variables: { dashboardId, segmentId, startDate, endDate, timeScale },
      pull: 'blocks'
    })
  }

  upsert = ({ name, dashboardId, metricIds, settings }) => {
    return this.auth.call({
      query: `
        mutation BlockUpsert(
          $name: String!
          $dashboardId: ID!
          $metricIds: JSON!
          $settings: JSON
        ) {
          blockUpsert(name: $name, dashboardId: $dashboardId, metricIds: $metricIds, settings: $settings) {
            name
          }
        }
`,
      variables: { name, dashboardId, metricIds, settings },
      pull: 'block'
    }, { invalidateAll: true })
  }
}
