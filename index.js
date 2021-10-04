import CeramicClient from '@ceramicnetwork/http-client'
import KeyDidResolver from 'key-did-resolver'
import ThreeIdResolver from '@ceramicnetwork/3id-did-resolver'
import { DID } from 'dids'
import * as nearApiJs from 'near-api-js'
import { IDX } from '@ceramicstudio/idx'

import { config } from './config'

console.log('env: ', process.env.ENV)

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
        const resolver = {
            ...KeyDidResolver.getResolver(),
            ...ThreeIdResolver.getResolver(ceramic),
          }
        const did = new DID({ resolver })
        ceramic.did = did
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

    async getPersona(accountId) {
        try{
            let contract = await this.initiateDidRegistryContract(accountId)
            let idx = await this.getAppIdx(contract)
            let did = await this.getDID(accountId, contract)
            let persona = await idx.get('profile', did)
            if(persona){
                return persona
            } else {
                return false
            }
        } catch (err) {
            console.log('error retrieving Persona', err)
            return false
        }
    }

    async getDao(accountId){
        try{
            let contract = await this.initiateDidRegistryContract(accountId)
            let idx = await this.getAppIdx(contract)
            let did = await this.getDID(accountId, contract)
            let dao = await idx.get('daoProfile', did)
            if(dao){
                return dao
            } else {
                return false
            }
        } catch (err) {
            console.log('error retrieving Dao', err)
            return false
        }
    }

    async getDonations(accountId) {
        try{
            let contract = await this.initiateDidRegistryContract(accountId)
            let idx = await this.getAppIdx(contract)
            let did = await this.getDID(accountId, contract)
            let donations = await idx.get('donations', did)
            if(donations){
                return donations
            } else {
                return false
            }
        } catch (err) {
            console.log('error retrieving donation', err)
            return false
        }
    }

    async getOpportunities(accountId) {
        try{
            let contract = await this.initiateDidRegistryContract(accountId)
            let idx = await this.getAppIdx(contract)
            let did = await this.getDID(accountId, contract)
            let opportunities = await idx.get('opportunities', did)
            if(opportunities){
                return opportunities
            } else {
                return false
            }
        } catch (err) {
            console.log('error retrieving opportunities', err)
            return false
        }
    }

    async getMemberStats(accountId) {
        try{
            let contract = await this.initiateDidRegistryContract(accountId)
            let idx = await this.getAppIdx(contract)
            let did = await this.getDID(accountId, contract)
            let data = await idx.get('memberData', did)
            if(data){
                return data
            } else {
                return false
            }
        } catch (err) {
            console.log('error retrieving member data', err)
            return false
        }
    }

    async getProposalStats(accountId) {
        try{
            let contract = await this.initiateDidRegistryContract(accountId)
            let idx = await this.getAppIdx(contract)
            let did = await this.getDID(accountId, contract)
            let data = await idx.get('proposalData', did)
            if(data){
                return data
            } else {
                return false
            }
        } catch (err) {
            console.log('error retrieving member data', err)
            return false
        }
    }

    async getVotingStats(accountId) {
        try{
            let contract = await this.initiateDidRegistryContract(accountId)
            let idx = await this.getAppIdx(contract)
            let did = await this.getDID(accountId, contract)
            let data = await idx.get('votingData', did)
            if(data){
                return data
            } else {
                return false
            }
        } catch (err) {
            console.log('error retrieving voting data', err)
            return false
        }
    }


}

module.exports = Persona
