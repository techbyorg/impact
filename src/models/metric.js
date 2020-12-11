export default class Metric {
  constructor ({ auth }) {
    this.auth = auth
  }

  getAll = () => {
    return this.auth.stream({
      query: `
        query MetricsByOrgId {
          metrics { nodes { id, slug, name, unit, transforms { operation, metric { id, name, slug } } } }
      }`,
      // variables: {},
      pull: 'metrics'
    })
  }

  upsert = ({ id, name, unit, transforms }) => {
    return this.auth.call({
      query: `
        mutation MetricUpsert(
          $id: ID
          $name: String!
          $unit: String
          $transforms: JSON
        ) {
          metricUpsert(id: $id, name: $name, unit: $unit, transforms: $transforms) {
            id, name
          }
        }
`,
      variables: { id, name, unit, transforms },
      pull: 'metricUpsert'
    }, { invalidateAll: true })
  }

  deleteById = (id) => {
    return this.auth.call({
      query: `
        mutation MetricDeleteById($id: ID) {
          metricDeleteById(id: $id)
        }
`,
      variables: { id },
      pull: 'metricDeleteById'
    }, { invalidateAll: true })
  }
}
