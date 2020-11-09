export default class Metric {
  constructor ({ auth }) {
    this.auth = auth
  }

  getAll = () => {
    return this.auth.stream({
      query: `
        query MetricsByOrgId {
          metrics { nodes { id, name } }
      }`,
      // variables: {},
      pull: 'metrics'
    })
  }
}
