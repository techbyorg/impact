export default class Block {
  constructor ({ auth }) {
    this.getAllByDashboardId = this.getAllByDashboardId.bind(this)
    this.auth = auth
  }

  getAllByDashboardId (dashboardId, { startDate, endDate, timeScale }) {
    return this.auth.stream({
      query: `
        query BlocksByDashboardId($dashboardId: ID!, $startDate: String, $endDate: String, $timeScale: String) {
          blocks(dashboardId: $dashboardId) {
            nodes {
              name, settings, metrics {
                nodes {
                  name,
                  datapoints(startDate: $startDate, endDate: $endDate, timeScale: $timeScale) {
                    nodes { scaledTime, count }
                  }
                }
              }
            }
          }
        }`,
      variables: { dashboardId, startDate, endDate, timeScale },
      pull: 'blocks'
    })
  }
}
