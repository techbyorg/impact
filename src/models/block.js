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
            id, name, metricIds, settings, defaultPermissions
          }
        }`,
      variables: { id },
      pull: 'block'
    })
  }

  upsert = ({ id, name, dashboardId, metricIds, settings, defaultPermissions }) => {
    return this.auth.call({
      query: `
        mutation BlockUpsert(
          $id: ID
          $name: String!
          $dashboardId: ID!
          $metricIds: JSON!
          $settings: JSON
          $defaultPermissions: JSON
        ) {
          blockUpsert(id: $id, name: $name, dashboardId: $dashboardId, metricIds: $metricIds, settings: $settings, defaultPermissions: $defaultPermissions) {
            name
          }
        }
`,
      variables: { id, name, dashboardId, metricIds, settings, defaultPermissions },
      pull: 'block'
    }, { invalidateAll: true })
  }
}
