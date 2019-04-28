<div align="center">
  <img src="/docs/img/nodeMetamask_fullColor.svg" width="600" />
</div>
<div align="center">
  <a href="https://build.colony.io/">
    <img src="https://img.shields.io/discourse/https/build.colony.io/status.svg" />
  </a>
</div>

# node-metamask

Connect Node.js to MetaMask.

"Why would I ever want to do that?" - Sometimes you might have scripts or libraries that run in Node and require signed transactions that you would like to use MetaMask for (instead of dealing with private keys). This tool functions as a web3 provider that can be used with pretty much any MetaMask instance remotely. Please, only use this package locally to prevent PITM attacks (if you're brave enough to try it on mainnet).

Sounds crazy? It probably is. Also highly experimental. Please use with caution.

## Install

```
yarn add node-metamask
```

## Usage

```js

const MetaMaskConnector = require('node-metamask');
const connector = new MetaMaskConnector({
  port: 3333, // this is the default port
  onConnect() { console.log('MetaMask client connected') }, // Function to run when MetaMask is connected (optional)
});

connector.start().then(() => {
  // Now go to http://localhost:3333 in your MetaMask enabled web browser.
  const web3 = new Web3(connector.getProvider());
  // Use web3 as you would normally do. Sign transactions in the browser.
});

```

When you're done with your MetaMask business, run the following code to clean up:

```js

connector.stop();

```

## Disclaimer

As I said, this is highly experimental. Tested only with web3 v1.0 (in node) and web3 0.20.3 (MetaMask, in the browser). Also it might not work with all functions supported by web3.

## Contribute

Please report any bugs you find so we can improve this.

- [Contributing](https://github.com/JoinColony/node-metamask/blob/master/.github/CONTRIBUTING.md)
