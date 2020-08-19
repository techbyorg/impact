export default class Dashboard {
  constructor ({ auth }) {
    this.auth = auth
  }

  getByOrgIdAndSlug = (orgId, slug, options) => {
    const {
      hackPw, segmentId, startDate, endDate, timeScale
    } = options
    return this.auth.stream({
      query: `
        query DashboardByOrgIdAndSlug(
          $orgId: String
          $slug: String
          # $dashboardId: ID!
          $segmentId: ID
          $hackPw: String # FIXME: rm after internal dashboards
          $startDate: String
          $endDate: String
          $timeScale: String
        ) {
          dashboard(orgId: $orgId, slug: $slug, hackPw: $hackPw) {
            id, slug, name
            blocks {
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
                          segmentId: $segmentId
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
        }`,
      variables: {
        orgId, slug, hackPw, segmentId, startDate, endDate, timeScale
      },
      pull: 'dashboard'
    })
  }

  getAllByOrgId = (orgId) => {
    console.warn('get dashboards', Date.now())
    return this.auth.stream({
      query: `
        query Dashboards($orgId: String) {
          dashboards(orgId: $orgId) {
            nodes { slug, name }
          }
        }`,
      variables: { orgId },
      pull: 'dashboards'
    })
  }
}
