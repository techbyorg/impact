export default class Metric {
  constructor ({ auth }) {
    this.getAllByOrgId = this.getAllByOrgId.bind(this)
    this.auth = auth
  }

  getAllByOrgId (orgId, { startDate, endDate }) {
    console.log('stream', orgId, startDate, endDate)
    return this.auth.stream({
      query: `
        query Metrics($orgId: String, $startDate: String, $endDate: String) {
          metrics(orgId: $orgId, startDate: $startDate, endDate: $endDate) {
            nodes { slug, name, datapoints }
          }
        }`,
      variables: { orgId, startDate, endDate },
      pull: 'metrics'
    })
  }
}
