import CeramicClient from '@ceramicnetwork/http-client'
import * as nearApiJs from 'near-api-js'
import { IDX } from '@ceramicstudio/idx'

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

class Persona {

    async getAppCeramic() {
        const ceramic = new CeramicClient(CERAMIC_API_URL)
        return ceramic
    }

    async initiateDidRegistryContract(accountId) {    
        
        const near = await nearApiJs.connect({
            networkId, nodeUrl, walletUrl, deps: { keyStore: new nearApiJs.keyStores.BrowserLocalStorageKeyStore() },
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
        const donations = this.getAlias(APP_OWNER_ACCOUNT, 'donations', contract)
        const daoProfile = this.getAlias(APP_OWNER_ACCOUNT, 'daoProfile', contract)

        const done = await Promise.all([
        profile,
        donations,
        daoProfile
        ])
        
        let rootAliases = {
        profile: done[0],
        donations: done[1],
        daoProfile: done[2]
        }
        
        const appIdx = new IDX({ ceramic: appClient, aliases: rootAliases})
        return appIdx
    }

    async getPersona(accountId) {
        let contract = await this.initiateDidRegistryContract(accountId)
        let idx = await this.getAppIdx(contract)
        let did = await this.getDID(accountId, contract)
        let persona = await idx.get('profile', did)
        if(persona){
            return persona
        } else {
            return false
        }
    }

    async getDao(accountId){
        let contract = await this.initiateDidRegistryContract(accountId)
        let idx = await this.getAppIdx(contract)
        let did = await this.getDID(accountId, contract)
        let dao = await idx.get('daoProfile', did)
        if(dao){
            return dao
        } else {
            return false
        }
    }

    async getDonations(accountId) {
        let contract = await this.initiateDidRegistryContract(accountId)
        let idx = await this.getAppIdx(contract)
        let did = await this.getDID(accountId, contract)
        let donations = await idx.get('donations', did)
        if(donations){
            return donations
        } else {
            return false
        }
    }

}

module.exports = Persona
