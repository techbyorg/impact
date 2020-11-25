export default class Segment {
  constructor ({ auth }) {
    this.auth = auth
  }

  getBySlug = (slug) => {
    return this.auth.stream({
      query: `
        query SegmentBySlug($slug: String!) {
          segment(slug: $slug) {
            id, slug, name
          }
        }`,
      variables: { slug },
      pull: 'segment'
    })
  }

  getAll = () => {
    return this.auth.stream({
      query: `
        query Segments {
          segments {
            nodes { id, slug, name }
          }
        }`,
      // variables: {},
      pull: 'segments'
    })
  }
}
