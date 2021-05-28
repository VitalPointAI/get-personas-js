import CeramicClient from '@ceramicnetwork/http-client'
import * as nearApiJs from 'near-api-js'
import { IDX } from '@ceramicstudio/idx'

// schemas
import { profileSchema } from './schemas/profile'

import { config } from './config'

const axios = require('axios').default

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

class Persona {

    async getAppCeramic() {
        const ceramic = new CeramicClient(CERAMIC_API_URL, {docSyncEnabled: false, docSynchInterval: 30000})
        return ceramic
    }

    async initiateDidRegistryContract(accountId) {    
        
        const near = await nearApiJs.connect({
            networkId, nodeUrl, walletUrl, deps: { keyStore: new nearAPI.keyStores.BrowserLocalStorageKeyStore() },
        })

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

    async getDID(accountId, contract) {
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

    async getAppIdx(contract){
        const appClient = await this.getAppCeramic()
        const profile = this.getAlias(APP_OWNER_ACCOUNT, 'profile', contract)
        
        const done = await Promise.all([
        appDid, 
        profile, 
        ])
        
        let rootAliases = {
        profile: done[1]
        }

        const appIdx = new IDX({ ceramic: appClient, aliases: rootAliases})
    
        return appIdx
    }

}

module.exports = Persona
