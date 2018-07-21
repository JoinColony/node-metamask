(async function (w) {
  if (!w.web3) {
    return addLog('MetaMask not found!');
  }
  if (!await checkUnlocked()) {
    return addLog('Please unlock MetaMask first and then reload this page');
  }
  const socket = new WebSocket('ws://localhost:3333');
  const reply = (action, request_id, payload) => socket.send(JSON.stringify({ action, request_id, payload }));
  socket.onmessage = msg => {
    let message;
    try {
      message = JSON.parse(msg.data);
    } catch (e) {
      return addLog('Could not parse websocket message. Is it a proper JSON command?');
    }
    if (message.action === 'execute') {
      executeAction(message.request_id, message.payload, reply);
    }
  }

  async function executeAction(request_id, { method, params}, reply) {
    let result;
    addLog(`Request ${request_id} Calling ${method} with ${JSON.stringify(params)}`);
    try {
      result = await execute(request_id, method, params);
    } catch(e) {
      return reply('executed', request_id, {
        error: e.message
      });
    }
    reply('executed', request_id, result);
  }

  function execute(request_id, method, params) {
    return new Promise((resolve, reject) => {
      const splitMethod = method.split('_');
      const scope = splitMethod[0];
      const functionName = splitMethod[1];
      params.push(function callback(err, result) {
        if (err) {
          return reject(err);
        }
        addLog(`Result from ${request_id} ${method}: ${JSON.stringify(result)}`);
        resolve(result);
      })
      try {
        web3[scope][functionName].apply(web3[scope], params)
      } catch (e) {
        console.error(e);
        reject(e);
      }
    })
  }

  function checkUnlocked() {
    return new Promise((resolve, reject) => {
      web3.eth.getAccounts((err, accounts) => {
        if (err) return reject(err);
        resolve(accounts && !!accounts[0]);
      });
    });
  }

  function addLog(msg) {
    const logEntry = document.createElement('li');
    logEntry.innerText = `${(new Date()).toString()} - ${msg}`;
    document.querySelector('#messages').appendChild(logEntry);
  }
})(window)
