export default class Segment {
  constructor ({ auth }) {
    this.auth = auth
  }

  getByOrgIdAndSlug = (orgId, slug) => {
    return this.auth.stream({
      query: `
        query SegmentByOrgIdAndSlug($orgId: ID!, $slug: String) {
          segment(orgId: $orgId, slug: $slug) {
            id, slug, name
          }
        }`,
      variables: { orgId, slug },
      pull: 'segment'
    })
  }

  getAllByOrgId = (orgId) => {
    return this.auth.stream({
      query: `
        query Segments($orgId: ID!) {
          segments(orgId: $orgId) {
            nodes { slug, name }
          }
        }`,
      variables: { orgId },
      pull: 'segments'
    })
  }
}
