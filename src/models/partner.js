export default class Partner {
  constructor ({ auth }) {
    this.auth = auth
  }

  getByOrgIdAndSlug = (orgId, slug) => {
    return this.auth.stream({
      query: `
        query PartnerByOrgIdAndSlug($orgId: ID!, $slug: String) {
          partner(orgId: $orgId, slug: $slug) {
            id, slug, name # , segmentId
          }
        }`,
      variables: { orgId, slug },
      pull: 'partner'
    })
  }

  getAll = () => {
    return this.auth.stream({
      query: `
        query Partners {
          partners {
            nodes { id, slug, name }
          }
        }`,
      // variables:  { orgId },
      pull: 'partners'
    })
  }

  upsert = ({ id, slug, name }) => {
    return this.auth.call({
      query: `
        mutation RoleUpsert(
          $id: ID
          $slug: String
          $name: String
        ) {
          partnerUpsert(id: $id, slug: $slug, name: $name) {
            name
          }
        }
`,
      variables: { id, slug, name },
      pull: 'partner'
    }, { invalidateAll: true })
  }
}
