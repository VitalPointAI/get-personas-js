import CeramicClient from '@ceramicnetwork/http-client'
import KeyDidResolver from 'key-did-resolver'
import ThreeIdResolver from '@ceramicnetwork/3id-did-resolver'
import { Ed25519Provider } from 'key-did-provider-ed25519'
import { DID } from 'dids'
import * as nearApiJs from 'near-api-js'
import { IDX } from '@ceramicstudio/idx'
import { randomBytes } from '@stablelib/random'
import { queries } from './graphQueries'

import { config } from './config'

export const {
    APP_OWNER_ACCOUNT,
    CERAMIC_API_URL,
    networkId, 
    nodeUrl, 
    walletUrl, 
    nameSuffix,
    contractName, 
    didRegistryContractName,
    factoryContractName,
} = config

const seed = randomBytes(32)

class Persona {

    async getNEAR(){
        const near = await nearApiJs.connect({
            networkId, nodeUrl, walletUrl, deps: { keyStore: new nearApiJs.keyStores.BrowserLocalStorageKeyStore() },
        })
        return near
    }

    async getAppCeramic() {
        const ceramic = new CeramicClient(CERAMIC_API_URL)
        const resolver = {
            ...KeyDidResolver.getResolver(),
            ...ThreeIdResolver.getResolver(ceramic),
          }
        const did = new DID({ resolver })
        ceramic.setDID(did)
        const provider = new Ed25519Provider(seed)
        ceramic.did.setProvider(provider)
        await ceramic.did.authenticate()
        return ceramic
    }

    async initiateDidRegistryContract(accountId, near) {    
       
        if(!near){
            near = await this.getNEAR()
        }
        const account = new nearApiJs.Account(near.connection, accountId)

        // initiate the contract so its associated with this current account and exposing all the view methods
        let didRegistryContract = new nearApiJs.Contract(account, didRegistryContractName, {
        viewMethods: [
            'getDID',
            'hasDID',
            'retrieveAlias',
            'hasAlias'
        ],
    })
        return didRegistryContract
    }

    async factoryContract(accountId, near) {    
       
        if(!near){
            near = await this.getNEAR()
        }
        const account = new nearApiJs.Account(near.connection, accountId)

        // initiate the contract so its associated with this current account and exposing all the view methods
        let factoryContract = new nearApiJs.Contract(account, factoryContractName, {
        viewMethods: [
            'getDaoByAccount'
        ],
    })
        return factoryContract
    }


    async getAlias(accountId, aliasName, contract) {
        try {
        let aliasExists = await contract.hasAlias({alias: accountId+':'+aliasName})
        if(aliasExists){
            let alias = await contract.retrieveAlias({alias: accountId+':'+aliasName})
            return alias
        }
        } catch (err) {
        console.log('problem retrieving alias', err)
        return false
        }
    }

    
    async getDID(accountId, near){
       
        let dao
        let did = false

        did = await queries.getDid(accountId)
        console.log('did check graph', did)
        if(did){
            return did
        }

        if(!near){
            near = await this.getNEAR()
        }

        let factoryContract = await this.factoryContract(accountId, near)
        let registryContract = await this.registryContract(accountId, near)

        try{
        did = await registryContract.getDID({accountId: accountId})
        console.log('did check registry', did)
        if(did){
            return did
        }
        } catch (err) {
        console.log('error retrieving did from legacy', err)
        }
    
        if (!did){
        try {
        dao = await factoryContract.getDaoByAccount({accountId: accountId})
        console.log('did check factory', did)
        did = dao.did
        } catch (err) {
            console.log('error retrieving did', err)
        }
        }
        return did
    }


    async getAppIdx(contract){
        const appClient = await this.getAppCeramic()
        const profile = this.getAlias(APP_OWNER_ACCOUNT, 'profile', contract)
        const daoProfile = this.getAlias(APP_OWNER_ACCOUNT, 'daoProfile', contract)

        const done = await Promise.all([
        profile,
        daoProfile
        ])
        
        let rootAliases = {
        profile: done[0],
        daoProfile: done[2],
        }

        const appIdx = new IDX({ ceramic: appClient, aliases: rootAliases})
        return appIdx
    }


    async getData(alias, accountId, idx){
       
        try{
            let contract = await this.initiateDidRegistryContract(accountId)
            if(!idx){
                idx = await this.getAppIdx(contract)
            }
            let did = await this.getDID(accountId, idx)
            let data = await idx.get(alias, did)
            if(data){
                return data
            } else {
                return false
            }
        } catch (err) {
            console.log('error retrieving data for:'+alias, err)
            return false
        }
    }
}

module.exports = Persona
