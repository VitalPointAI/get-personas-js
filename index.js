import CeramicClient from '@ceramicnetwork/http-client'
import KeyDidResolver from 'key-did-resolver'
import ThreeIdResolver from '@ceramicnetwork/3id-did-resolver'
import { Caip10Link } from '@ceramicnetwork/stream-caip10-link'
import { NearAuthProvider } from '@ceramicnetwork/blockchain-utils-linking'
import { Ed25519Provider } from 'key-did-provider-ed25519'
import { DID } from 'dids'
import * as nearApiJs from 'near-api-js'
import { IDX } from '@ceramicstudio/idx'
import { randomBytes } from '@stablelib/random'

import { config } from './config'

export const {
    APP_OWNER_ACCOUNT,
    CERAMIC_API_URL,
    networkId, 
    nodeUrl, 
    walletUrl, 
    nameSuffix,
    contractName, 
    didRegistryContractName
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

    
    async getDID(accountId, appIdx, near){
        if(!near){
            near = await this.getNEAR()
        }
       
        let nearAuthProvider = new NearAuthProvider(near, accountId, near.connection.networkId)
        let insideAccountId = await nearAuthProvider.accountId()
        let insideAccountLink = await Caip10Link.fromAccount(appIdx.ceramic, insideAccountId)
        
        // backup check for legacy contract DID registrations
        if(!insideAccountLink.did){   
            try{
                let didExists = await contract.hasDID({accountId: accountId})
                if(didExists){
                    let did = await contract.getDID({accountId: accountId})
                    return did
                }
            } catch (err) {
                console.log('problem retrieving did', err)
                return false
            }
        }
        return insideAccountLink.did
    }


    async getAppIdx(contract){
        const appClient = await this.getAppCeramic()
        const profile = this.getAlias(APP_OWNER_ACCOUNT, 'profile', contract)
        const donations = this.getAlias(APP_OWNER_ACCOUNT, 'donations', contract)
        const daoProfile = this.getAlias(APP_OWNER_ACCOUNT, 'daoProfile', contract)
        const opportunities = this.getAlias(APP_OWNER_ACCOUNT, 'opportunities', contract)
        const memberData = this.getAlias(APP_OWNER_ACCOUNT, 'memberData', contract)
        const proposalData = this.getAlias(APP_OWNER_ACCOUNT, 'proposalData', contract)
        const votingData = this.getAlias(APP_OWNER_ACCOUNT, 'votingData', contract)

        const done = await Promise.all([
        profile,
        donations,
        daoProfile,
        opportunities,
        memberData,
        proposalData,
        votingData
        ])
        
        let rootAliases = {
        profile: done[0],
        donations: done[1],
        daoProfile: done[2],
        opportunities: done[3],
        memberData: done[4],
        proposalData: done[5],
        votingData: done[6]
        }

        const appIdx = new IDX({ ceramic: appClient, aliases: rootAliases})
        return appIdx
    }


    async getData(accountId, alias, appIdx){
       
        try{
            let contract = await this.initiateDidRegistryContract(accountId)
            if(!appIdx){
                idx = this.getAppIdx(contract)
            } else {
                idx = appIdx
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
