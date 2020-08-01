export default class Block {
  constructor ({ auth }) {
    this.auth = auth
  }

  getAllByDashboardId = (dashboardId, { startDate, endDate, timeScale, hackPw }) => {
    return this.auth.stream({
      query: `
        query BlocksByDashboardId(
          $dashboardId: ID!
          $hackPw: String # FIXME: rm after internal dashboards
          $startDate: String
          $endDate: String
          $timeScale: String
        ) {
          blocks(dashboardId: $dashboardId, hackPw: $hackPw) {
            nodes {
              id
              name
              settings
              metrics {
                nodes {
                  name
                  unit
                  dimensions {
                    nodes {
                      slug
                      datapoints(
                        startDate: $startDate
                        endDate: $endDate
                        timeScale: $timeScale
                      ) {
                        nodes {
                          scaledTime
                          dimensionValue
                          count
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
`,
      variables: { dashboardId, startDate, endDate, timeScale, hackPw },
      pull: 'blocks'
    })
  }
}
