const fromExponential = require('./FromExponential');

class RemoteMetaMaskProvider {
  constructor(connector) {
    this._connector = connector;
    this._callbacks = new Map();
  }

  // Generate a request id to track callbacks from async methods
  static generateRequestId() {
    const s4 = () =>
      Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
    return `${s4()}${s4()}-${s4()}-${s4()}-${s4()}-${s4()}${s4()}${s4()}`;
  }

  // Get the associated async method for the given sync method (MetaMask does
  // not work with sync methods)
  static getAsyncMethod(method) {
    const syncMethods = [
      'version_node',
      'version_network',
      'version_ethereum',
      'version_whisper',
      'net_listening',
      'net_peerCount',
      'eth_syncing',
      'eth_coinbase',
      'eth_mining',
      'eth_hashrate',
      'eth_gasPrice',
      'eth_accounts',
      'eth_blockNumber',
    ];

    // Translate the defined sync methods
    const idx = syncMethods.indexOf(method);
    if (idx >= 0) {
      return syncMethods[idx].replace(
        /(.+)_([a-z])(.+)/,
        (str, p1, p2, p3) => `${p1}_get${p2.toUpperCase()}${p3}`,
      );
    }

    // Translate other sync methods
    const translateMethod = {
      net_version: 'version_getNetwork',
      eth_getLogs: 'eth_filter',
      eth_getTransactionByHash: 'eth_getTransaction',
    };
    if (Object.prototype.hasOwnProperty.call(translateMethod, method)) {
      return translateMethod[method];
    }

    return method;
  }

  // When connected to a remote network, the return values for "gasPrice" and
  // "value" are strings, so we will need to properly format them for ethers.
  // Ideally we would use the big number type from bn.js or bignumber.js but
  // ethers does not support any big number type other than it's own.
  static formatResult(_result) {
    const result = _result;

    // Format "gasPrice"
    if (result && typeof result.gasPrice === 'string') {
      result.gasPrice = parseInt(result.gasPrice, 10);
    }

    // Format "value"
    if (result && typeof result.value === 'string') {
      result.value = parseInt(result.value, 10);
    }

    // Format for "eth_filter"
    if (result && result.logIndex) return [result];

    // If result is a number in scientific notation, which nodeJS might automatically convert it into if it is >= 1e21,
    // then it back into a number form so that it can be used by ethers' bignumber type
    // e.g. from 9.99862115952e+21 to 9998621159520000000000
    if (result && !isNaN(result) && (typeof result === 'string') && (!result.startsWith('0x')) && (Number(result) >= 1e21)) {
     return fromExponential(result);
    } 

    return result;
  }

  // Define send method
  send(_payload, _callback) {
    if (!this._connector.ready()) {
      return _callback(
        new Error('Unable to send. Not connected to a MetaMask socket.'),
      );
    }

    // Because requests are handled across a WebSocket, their callbacks need to
    // be associated with an ID which is returned with the response.
    const requestId = this.constructor.generateRequestId();

    // Set the callback using the requestId
    this._callbacks.set(requestId, _callback);

    // Set the payload to allow reassignment
    const payload = _payload;

    // Get the async method (Metamask does not support sync methods)
    payload.method = this.constructor.getAsyncMethod(payload.method);

    return this._connector
      .send('execute', requestId, payload, 'executed')
      .then(({ requestId: responseRequestId, result }) => {
        // Exit if a response for this request was already handled
        if (!this._callbacks.has(responseRequestId)) return;

        // Get the request callback using the returned request id
        const requestCallback = this._callbacks.get(responseRequestId);

        // Throw error if send error
        if (result && result.error) {
          requestCallback(new Error(result.error));
        }

        // Format result to work with ethers
        const formattedResult = this.constructor.formatResult(result);

        // Handle request callback
        requestCallback(null, {
          id: payload.id,
          jsonrpc: '2.0',
          result: formattedResult,
        });

        // Delete the callback after the request has been handled
        this._callbacks.delete(responseRequestId);
      })
      .catch(err => _callback(err));
  }

  // Define async send method
  sendAsync(payload, callback) {
    this.send(payload, callback);
  }
}

module.exports = RemoteMetaMaskProvider;
