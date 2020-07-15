export default class Dashboard {
  constructor ({ auth }) {
    this.getAllByOrgId = this.getAllByOrgId.bind(this)
    this.auth = auth
  }

  getByOrgIdAndSlug (orgId, slug) {
    return this.auth.stream({
      query: `
        query DashboardByOrgIdAndSlug($orgId: String, $slug: String) {
          dashboard(orgId: $orgId, slug: $slug) {
            id, slug, name
          }
        }`,
      variables: { orgId, slug },
      pull: 'dashboard'
    })
  }

  getAllByOrgId (orgId) {
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
