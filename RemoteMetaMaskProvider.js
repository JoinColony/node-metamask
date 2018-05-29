class RemoteMetaMaskProvider {
  constructor(connector) {
    this._connector = connector;
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
      'eth_blocknumber',
    ];
    const idx = syncMethods.indexOf(method);
    if (idx >= 0) {
      return syncMethods[idx].replace(/(.+)\_([a-z])(.+)/, (str, p1, p2, p3) => `${p1}_get${p2.toUpperCase()}${p3}`)
    }
    if (method === 'net_version') {
      // Special MetMask fix
      method = 'version_getNetwork';
    }
    return method;
  }
  send(payload, callback) {
    if (!this._connector.ready()) {
      return callback(new Error('Can\'t send. Not connected to a MetaMask socket.'))
    }
    payload.method = this._getAsyncMethod(payload.method);
    this._connector.send('execute', payload, 'executed').then(result => {
      if (result && result.error) return callback(new Error(result.error));
      callback(null, {
        id: payload.id,
        jsonrpc: '2.0',
        result,
      });
    }).catch(err => callback(err));
  }
}

module.exports = RemoteMetaMaskProvider;
