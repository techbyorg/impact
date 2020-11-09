export default class Partner {
  constructor ({ auth }) {
    this.auth = auth
  }

  getByOrgIdAndSlug = (orgId, slug) => {
    return this.auth.stream({
      query: `
        query PartnerByOrgIdAndSlug($orgId: ID!, $slug: String) {
          partner(orgId: $orgId, slug: $slug) {
            id, slug, name, segmentId
          }
        }`,
      variables: { orgId, slug },
      pull: 'partner'
    })
  }

  getAllByOrgId = (orgId) => {
    return this.auth.stream({
      query: `
        query Partners($orgId: ID!) {
          partners(orgId: $orgId) {
            nodes { slug, name }
          }
        }`,
      variables: { orgId },
      pull: 'partners'
    })
  }
}
