class RemoteMetaMaskProvider {
  constructor(connector) {
    this._connector = connector;
    this._callbacks = new Map();
  }
  _getAsyncMethod(method) {
    // Sync methods don't work with MetaMask
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
    const idx = syncMethods.indexOf(method);
    if (idx >= 0) {
      return syncMethods[idx].replace(/(.+)\_([a-z])(.+)/, (str, p1, p2, p3) => `${p1}_get${p2.toUpperCase()}${p3}`)
    }
    const translateMethod = {
      net_version: 'version_getNetwork',
      eth_getLogs: 'eth_filter',
      eth_getTransactionByHash: 'eth_getTransaction'
    }
    if (translateMethod.hasOwnProperty(method)) {
      method = translateMethod[method];
    }
    return method;
  }
  _guid() {
    function s4() {
      return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
  }
  send(payload, callback) {
    if (!this._connector.ready()) {
      return callback(new Error('Can\'t send. Not connected to a MetaMask socket.'))
    }
    // Because requests are handled across a WebSocket they need to be
    // associated with their callback with an ID which is returned with the
    // response.
    const requestId = this._guid();
    this._callbacks.set(requestId, callback);
    payload.method = this._getAsyncMethod(payload.method);
    this._connector.send('execute', requestId, payload, 'executed').then(({
      requestId: responseRequestId,
      result
    }) => {
      if (!this._callbacks.has(responseRequestId)) {
        return; // A response for this request was already handled
      } else {
        this._callbacks.delete(responseRequestId);
      }
      if (result && result.error) return requestCallback(new Error(result.error));
      requestCallback(null, {
        id: payload.id,
        jsonrpc: '2.0',
        result,
      });
    }).catch(err => callback(err));
  }
  sendAsync(payload, callback) {
    this.send(payload, callback)
  }
}

module.exports = RemoteMetaMaskProvider;
