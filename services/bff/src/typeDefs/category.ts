export default `
    type Category {
        _id: ID!
        label: String!
    }

    extend type Query {
        categories: [Category]
    }
`
