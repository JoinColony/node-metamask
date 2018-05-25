(async function (w) {
  if (!w.web3) {
    return showMessage('MetaMask not found!');
  }
  if (!await checkUnlocked()) {
    return showMessage('Please unlock MetaMask first and then reload this page');
  }
  const socket = new WebSocket('ws://localhost:3333');
  const reply = (action, payload) => socket.send(JSON.stringify({ action, payload }));
  socket.onmessage = msg => {
    let message;
    try {
      message = JSON.parse(msg.data);
    } catch (e) {
      return showMessage('Could not parse websocket message. Is it a proper JSON command?');
    }
    if (message.action === 'execute') {
      executeAction(message.payload, reply);
    }
  }

  async function executeAction({ method, params}, reply) {
    let result;
    showMessage(`Calling ${method} with ${JSON.stringify(params)}`);
    try {
      result = await execute(method, params);
    } catch(e) {
      return reply('executed', {
        error: e.message
      });
    }
    reply('executed', result);
  }

  function execute(method, params) {
    return new Promise((resolve, reject) => {
      const splitMethod = method.split('_');
      const scope = splitMethod[0];
      const functionName = splitMethod[1];
      params.push(function callback(err, result) {
        if (err) {
          return reject(err);
        }
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

  function showMessage(msg) {
    document.querySelector('#message').innerText = msg;
  }
})(window)
