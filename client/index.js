/* global document:true */
/* global WebSocket:true */
/* global web3:true */
/* global window:true */

(async w => {
  const addLog = msg => {
    const logEntry = document.createElement('li');
    logEntry.innerText = `${new Date().toString()}\n${msg}`;
    document.querySelector('#messages').appendChild(logEntry);
  };

  const checkUnlocked = async () => {
    await window.ethereum.enable() // Ensure access to MetaMask
    return new Promise((resolve, reject) => {
      web3.eth.getAccounts((err, accounts) => {
        if (err) return reject(err);
        return resolve(accounts && !!accounts[0]);
      });
    });
  };

  const execute = (requestId, method, params) =>
    new Promise((resolve, reject) => {
      const splitMethod = method.split('_');
      const scope = splitMethod[0];
      const functionName = splitMethod[1];
      params.push((err, result) => {
        if (err) {
          return reject(err);
        }
        addLog(
          `Request ID: ${requestId}
          Result from ${method}: ${JSON.stringify(result)}`,
        );
        return resolve(result);
      });
      try {
        web3[scope][functionName](...params);
      } catch (e) {
        reject(e);
      }
    });

  async function executeAction(requestId, { method, params }, reply) {
    let result;
    addLog(
      `Request ID: ${requestId}
      Calling ${method}: ${JSON.stringify(params)}`,
    );
    try {
      result = await execute(requestId, method, params);
    } catch (e) {
      return reply('executed', requestId, {
        error: e.message,
      });
    }
    return reply('executed', requestId, result);
  }

  if (!w.web3) {
    return addLog('MetaMask not found!');
  }
  if (!(await checkUnlocked())) {
    return addLog('Please unlock MetaMask first and then reload this page');
  }
  const socket = new WebSocket('ws://localhost:3333');
  const reply = (action, requestId, payload) =>
    socket.send(JSON.stringify({ action, requestId, payload }));
  socket.onmessage = msg => {
    let message;
    try {
      message = JSON.parse(msg.data);
    } catch (e) {
      return addLog(
        'Could not parse websocket message. Is it a proper JSON command?',
      );
    }
    if (message.action === 'execute') {
      return executeAction(message.requestId, message.payload, reply);
    }
    return true;
  };

  return true;
})(window);
