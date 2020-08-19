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

  getAllByOrgId = (orgId, hackPw) => { // FIXME: rm hackPw when internal dash
    return this.auth.stream({
      query: `
        query Segments($orgId: ID!, $hackPw: String) {
          segments(orgId: $orgId, hackPw: $hackPw) {
            nodes { slug, name }
          }
        }`,
      variables: { orgId, hackPw },
      pull: 'segments'
    })
  }
}
