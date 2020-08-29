import gql from 'graphql-tag'

export const GET_CATEGORIES = gql`
  query Categories {
    categories {
      _id
      label
    }
  }
`