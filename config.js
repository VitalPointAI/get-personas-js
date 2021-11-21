// testnet / default
let config = {
    APP_OWNER_ACCOUNT: 'vitalpointai.testnet',
    CERAMIC_API_URL: 'https://ceramic-node.vitalpointai.com',
    networkId: 'testnet',
    nodeUrl: 'https://rpc.testnet.near.org',
    walletUrl: 'https://wallet.testnet.near.org',
    nameSuffix: '.testnet',
    contractName: 'testnet',
    didRegistryContractName: 'dids1.vitalpointai.testnet',
}

if(process.env.ENV === 'localhost'){
    config = {
        ...config
    }
}

if (process.env.ENV === 'prod') {
    config = {
        ...config,
        APP_OWNER_ACCOUNT: 'aaron.near',
        CERAMIC_API_URL: 'https://ceramic-node.vitalpointai.com',
        networkId: 'mainnet',
        nodeUrl: 'https://rpc.mainnet.near.org',
        walletUrl: 'https://wallet.near.org',
        nameSuffix: '.near',
        contractName: 'near',
        didRegistryContractName: 'did.near',
    }
}

export { config }
