export default `
    type CategoryId {
        id: ID!
        label: String!
    }

    extend type Query {
        categories: [CategoryId]
    }
`