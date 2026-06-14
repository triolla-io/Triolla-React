import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client'

const WORDPRESS_GRAPHQL_ENDPOINT = process.env.NEXT_PUBLIC_WORDPRESS_GRAPHQL_URL

export const client = new ApolloClient({
  link: new HttpLink({
    uri: WORDPRESS_GRAPHQL_ENDPOINT,
  }),
  cache: new InMemoryCache(),
})
