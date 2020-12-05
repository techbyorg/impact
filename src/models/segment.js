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

  upsert = ({ id, slug, name }) => {
    return this.auth.call({
      query: `
        mutation SegmentUpsert(
          $id: ID
          $slug: String
          $name: String
        ) {
          segmentUpsert(id: $id, slug: $slug, name: $name) {
            slug
          }
        }
`,
      variables: { id, slug, name },
      pull: 'segment'
    }, { invalidateAll: true })
  }

  deleteById = (id) => {
    return this.auth.call({
      query: `
        mutation SegmentDeleteById($id: ID) {
          segmentDeleteById(id: $id)
        }
`,
      variables: { id },
      pull: 'segmentDeleteById'
    }, { invalidateAll: true })
  }
}
