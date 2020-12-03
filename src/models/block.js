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
        ) { }`,
      variables: { dashboardId, segmentId, startDate, endDate, timeScale },
      pull: 'blocks'
    })
  }

  getById = (id) => {
    return this.auth.stream({
      query: `
        query BlockById(
          $id: ID!
        ) {
          block(id: $id) {
            id, name, metricIds, settings
          }
        }`,
      variables: { id },
      pull: 'block'
    })
  }

  upsert = ({ id, name, dashboardId, metricIds, settings }) => {
    return this.auth.call({
      query: `
        mutation BlockUpsert(
          $id: ID
          $name: String!
          $dashboardId: ID
          $metricIds: JSON!
          $settings: JSON
        ) {
          blockUpsert(id: $id, name: $name, dashboardId: $dashboardId, metricIds: $metricIds, settings: $settings) {
            name
          }
        }
`,
      variables: { id, name, dashboardId, metricIds, settings },
      pull: 'block'
    }, { invalidateAll: true })
  }

  deleteById = (id) => {
    return this.auth.call({
      query: `
        mutation BlockDeleteById($id: ID) {
          blockDeleteById(id: $id)
        }
`,
      variables: { id },
      pull: 'blockDeleteById'
    }, { invalidateAll: true })
  }
}
