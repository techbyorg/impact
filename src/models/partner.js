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

  getAllByOrgId = (orgId, hackPw) => { // FIXME: rm hackPw when internal dash
    return this.auth.stream({
      query: `
        query Partners($orgId: ID!, $hackPw: String) {
          partners(orgId: $orgId, hackPw: $hackPw) {
            nodes { slug, name }
          }
        }`,
      variables: { orgId, hackPw },
      pull: 'partners'
    })
  }
}
