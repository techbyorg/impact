export default class Role {
  constructor ({ auth }) {
    this.auth = auth
  }

  getAll = () => {
    return this.auth.stream({
      query: `
        query Roles {
          roles {
            nodes { id, name, slug }
          }
        }`,
      // variables: { orgId },
      pull: 'roles'
    })
  }
}
