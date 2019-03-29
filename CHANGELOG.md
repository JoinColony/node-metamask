## node-metamask changelog

### [ [>](https://github.com/JoinColony/node-metamask/tree/v1.1.2) ] 1.1.2 / 29.03.2019
* Fixes connection to MetaMask when privacy mode is enabled (thanks @monokh)

### [ [>](https://github.com/JoinColony/node-metamask/tree/v1.1.1) ] 1.1.1 / 23.08.2018
* Adds `formatResult` method to ensure results are formatted to work with `ethers.js`
* Fixes `MetaMaskConnector` to ensure the correct payload is sent to `RemoteMetaMaskProvider`

### [ [>](https://github.com/JoinColony/node-metamask/tree/v1.1.0) ] 1.1.0 / 11.08.2018
* Adds support for Web3 0.x on the node side (thanks @frods)
* Provides correct mapping of requests (also thanks @frods!)
* Fixes typos in and adds some more JSON-RPC requests (eth_blockNumber, eth_getLogs, eth_getTransactionByHash), also by @frods :)
* Add eslint checks (thanks @ryanchristo!)
* Fixes some typos in readme (thanks to @hems)

### [ [>](https://github.com/JoinColony/node-metamask/tree/v1.0.2) ] 1.0.2 / 29.05.2018
* Fix empty result error bug

### [ [>](https://github.com/JoinColony/node-metamask/tree/v1.0.1) ] 1.0.1 / 26.05.2018
* Fix memory leak bug

### [ [>](https://github.com/JoinColony/node-metamask/tree/v1.0.0) ] 1.0.0 / 26.05.2018
* Initial release
