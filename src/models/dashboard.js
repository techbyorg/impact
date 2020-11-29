export default class Dashboard {
  constructor ({ auth }) {
    this.auth = auth
  }

  getByOrgIdAndSlug = (orgId, slug, options) => {
    const {
      segmentId, startDate, endDate, timeScale
    } = options
    return this.auth.stream({
      query: `
        query DashboardByOrgIdAndSlug(
          $orgId: String
          $slug: String
          # $dashboardId: ID!
          $segmentId: ID
          $startDate: String
          $endDate: String
          $timeScale: String
        ) {
          dashboard(orgId: $orgId, slug: $slug) {
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
        orgId, slug, segmentId, startDate, endDate, timeScale
      },
      pull: 'dashboard'
    })
  }

  getAll = () => {
    console.warn('get dashboards', Date.now())
    return this.auth.stream({
      query: `
        query Dashboards {
          dashboards {
            nodes { slug, name }
          }
        }`,
      // variables: {},
      pull: 'dashboards'
    })
  }

  getById = (id) => {
    return this.auth.stream({
      query: `
        query DashboardById(
          $id: ID!
        ) {
          dashboard(id: $id) {
            id, name
          }
        }`,
      variables: { id },
      pull: 'dashboard'
    })
  }

  upsert = ({ id, name }) => {
    return this.auth.call({
      query: `
        mutation DashboardUpsert(
          $id: ID
          $name: String!
        ) {
          dashboardUpsert(id: $id, name: $name) {
            name
          }
        }
`,
      variables: { id, name },
      pull: 'dashboard'
    }, { invalidateAll: true })
  }
}
