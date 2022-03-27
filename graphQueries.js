import {ApolloClient, InMemoryCache, gql} from '@apollo/client';
import { config } from '../state/config'

const {
  GRAPH_FACTORY_API_URL,
  GRAPH_REGISTRY_API_URL,
} = config

const GET_DID = `
query GetDid($accountId: String!){
    putDIDs(first: 1, orderBy: registered, orderDirection:desc, where: {accountId_in: [$accountId]}) {
        id
        blockTime
        accountId
        did
        type
        registered
        owner
    }
}
`
const factoryClient = new ApolloClient({
    uri: GRAPH_FACTORY_API_URL,
    cache: new InMemoryCache(),
})

const registryClient = new ApolloClient({
    uri: GRAPH_REGISTRY_API_URL,
    cache: new InMemoryCache(),
})

export default class Queries {

     async getDid(accountId){
        const did = await registryClient.query({query: GET_DID, variables: {
            accountId: accountId
        }})
        return did
    }

}

export const queries = new Queries();