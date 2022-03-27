// testnet / default
let config = {
    APP_OWNER_ACCOUNT: 'vitalpointai.testnet',
    CERAMIC_API_URL: 'https://ceramic-node.vitalpointai.com',
    networkId: 'testnet',
    nodeUrl: 'https://rpc.testnet.near.org',
    walletUrl: 'https://wallet.testnet.near.org',
    nameSuffix: '.testnet',
    contractName: 'testnet',
    factoryContractName: 'factory2.vitalpointai.testnet',
    didRegistryContractName: 'dids2.vitalpointai.testnet',
    GRAPH_FACTORY_API_URL: 'https://api.thegraph.com/subgraphs/name/vitalpointai/catalyst-factory-tnet',
    GRAPH_REGISTRY_API_URL: 'https://api.thegraph.com/subgraphs/name/vitalpointai/registry-near-tnet'
}

if(process.env.ENV === 'localhost'){
    config = {
        ...config
    }
}

if(process.env.ENV === 'test'){
    config = {
        ...config
    }
}

if (process.env.ENV === 'prod') {
    config = {
        ...config,
        APP_OWNER_ACCOUNT: 'vitalpointai.near',
        CERAMIC_API_URL: 'https://ceramic-node.vitalpointai.com',
        networkId: 'mainnet',
        nodeUrl: 'https://rpc.mainnet.near.org',
        walletUrl: 'https://wallet.near.org',
        nameSuffix: '.near',
        contractName: 'near',
        factoryContractName: 'cdao.near',
        didRegistryContractName: 'did.near',
        GRAPH_FACTORY_API_URL: 'https://api.thegraph.com/subgraphs/name/vitalpointai/catalyst-factory-mnet',
        GRAPH_REGISTRY_API_URL: 'https://api.thegraph.com/subgraphs/name/vitalpointai/registry-near-mnet'
    }
}

export { config }
