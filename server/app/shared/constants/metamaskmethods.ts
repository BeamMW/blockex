export enum MetaMaskMethodList {
  EthChainD = "eth_chainId", // Returns the current network ID.

  NetVersion = "net_version", // The net_version endpoint in MetaMask is used to retrieve the network ID of the current Ethereum network the user is connected to.

  EthBlockNumber = "eth_blockNumber", // The eth_blockNumber endpoint in Ethereum JSON-RPC API is used to retrieve the current block number of the Ethereum network the client is connected to.

  EthGasPrice = "eth_gasPrice", // Returns the current gas price.

  EthEstimateGas = "eth_estimateGas", // endpoint in the Ethereum JSON-RPC API is used to estimate the gas required to perform a certain operation on the Ethereum network.

  EthGetCode = "eth_getCode", //  is used to retrieve the bytecode of a smart contract deployed on the Ethereum network.

  EthGetBalance = "eth_getBalance", // Returns the balance of a given Ethereum address.

  EthGetTransactionCount = "eth_getTransactionCount", // Returns the number of transactions made by a given Ethereum address.

  EthSendRawTransaction = "eth_sendRawTransaction", //  Accepts a signed Ethereum transaction and broadcasts it to the network.

  EthGetTransactionReceipt = "eth_getTransactionReceipt", // Returns the receipt of a given transaction.

  EthGetBlockByNumber = "eth_getBlockByNumber", //Returns the block with a given block number.

  EthCall = "eth_call", //used to call (invoke) a specific function of a smart contract deployed on the Ethereum network, without actually modifying the state of the blockchain. This is useful for retrieving information from a smart contract, such as its current balance o
}
