export default class Dashboard {
  constructor ({ auth }) {
    this.auth = auth
  }

  getBySlugWithBlocks = (slug, options) => {
    const {
      segmentId, startDate, endDate, timeScale
    } = options
    return this.auth.stream({
      query: `
        query DashboardBySlugWithBlocks(
          $slug: String
          # $dashboardId: ID!
          $segmentId: ID
          $startDate: String
          $endDate: String
          $timeScale: String
        ) {
          dashboard(slug: $slug) {
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
        slug, segmentId, startDate, endDate, timeScale
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
            id, name, slug
          }
        }`,
      variables: { id },
      pull: 'dashboard'
    })
  }

  getBySlug = (slug) => {
    return this.auth.stream({
      query: `
        query DashboardBySlug(
          $slug: String!
        ) {
          dashboard(slug: $slug) {
            id, name, slug
          }
        }`,
      variables: { slug },
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

  deleteById = (id) => {
    return this.auth.call({
      query: `
        mutation DashboardDeleteById($id: ID) {
          dashboardDeleteById(id: $id)
        }
`,
      variables: { id },
      pull: 'dashboardDeleteById'
    }, { invalidateAll: true })
  }
}
