# node-metamask

Connect to MetaMask from node.js.

"Why would I ever want to do that?" - Sometimes you might have scripts / libraries that run in node and require signed transactions that you'd like to use MetaMask for (instead of dealing with private keys). This tool functions as a web3 Provider and can be used with pretty much any MetaMask instance remotely. Please, only use locally to prevent PITM attacks (if you're brave enough to try it on mainnet).

Sounds crazy? It probably is. Also highly experimental. Please use with caution.

## Install

```shell
yarn add node-metamask
```

## Usage

```js
const MetaMaskConnector = require('node-metamask');
const Connector = new MetaMaskConnector({
  port: 3333 // this is the default port
  onConnect() { console.log('MetaMask client connected') }, // Function to run when MetaMask is connected (optional)
});

connector.start().then(() => {
  // Now go to http://localhost:3333 in your MetaMask enabled web browser.
  const web3 = new Web3(connector.getProvider());
  // Use web3 as you would normally do. Sign transactions in the browser.
});
```

When you're don with your MetaMask business run

```js
connector.stop();
```

to clean up.

## Disclaimer

As I said, this is highly experimental. Tested only with web3 v1.0 (in node) and web3 0.20.3 (MetaMask, in the browser). Also it might not work with all functions supported by web3. Please report any bugs you find so we can improve this.

## License

MIT
