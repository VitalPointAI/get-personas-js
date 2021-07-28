// testnet / default
let config = {
    APP_OWNER_ACCOUNT: 'vitalpointai.testnet',
    CERAMIC_API_URL: 'https://ceramic-node.vitalpointai.com',
   // CERAMIC_API_URL: 'https://ceramic-clay.3boxlabs.com',
   // CERAMIC_API_URL: 'https://ceramic-node.vitalpointai.com:7007',
   // CERAMIC_API_URL: 'https://gateway-clay.ceramic.network',
    networkId: 'testnet',
    nodeUrl: 'https://rpc.testnet.near.org',
    walletUrl: 'https://wallet.testnet.near.org',
    nameSuffix: '.testnet',
    contractName: 'testnet',
    didRegistryContractName: 'dids1.vitalpointai.testnet',
}

if (process.env.REACT_APP_ENV === 'prod') {
    config = {
        ...config,
        networkId: 'mainnet',
        nodeUrl: 'https://rpc.mainnet.near.org',
        walletUrl: 'https://wallet.near.org',
        nameSuffix: '.near',
        contractName: 'near',
        didRegistryContractName: 'did.near',
    }
}

export { config }
