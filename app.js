let socket = null;
let botAtivo = false;

// App ID padrão da Deriv
const APP_ID = '1089';

function conectarAPI() {
  const accountInput = document.getElementById('accountId');
  const tokenInput = document.getElementById('apiToken');

  const accountId = accountInput ? accountInput.value.trim() : '';
  const token = tokenInput ? tokenInput.value.trim() : '';

  const statusPill = document.getElementById('statusConexao');
  const statusTexto = document.getElementById('statusTexto');

  if (!token) {
    alert('Por favor, insira o seu Token PAT (Deriv)!');
    return;
  }

  if (statusPill) {
    statusPill.className = 'status-pill';
    statusPill.style.borderColor = '#00d9ff';
  }
  if (statusTexto) {
    statusTexto.innerText = 'AUTENTICANDO...';
  }

  if (socket) {
    try {
      socket.close();
    } catch (e) {}
  }

  console.log('[DERIV] Conectando ao gateway WebSocket...');

  try {
    const wsUrl = 'wss://ws.derivws.com/websockets/v3?app_id=1089&l=PT';
  } catch (err) {
    console.error('[DERIV] Erro na criação do WebSocket:', err);
    if (statusTexto) statusTexto.innerText = 'ERRO DE CONEXÃO';
    return;
  }

  socket.onopen = () => {
    console.log('[DERIV] Conexão aberta. Autorizando com token...');
    socket.send(JSON.stringify({ authorize: token }));
  };

  socket.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);

      if (data.msg_type === 'authorize') {
        if (data.error) {
          console.error('[DERIV Erro]:', data.error.message);
          if (statusPill) statusPill.className = 'status-pill status-off';
          if (statusTexto) statusTexto.innerText = 'ERRO DE AUTENTICAÇÃO';
          alert('Erro ao autenticar Token: ' + data.error.message);
        } else {
          console.log('[DERIV] Conta Conectada:', data.authorize.email);
          
          if (statusPill) statusPill.className = 'status-pill status-on';
          
          const loginId = data.authorize.loginid || accountId;
          if (statusTexto) {
            statusTexto.innerText = `ONLINE: ${loginId}`;
          }

          if (accountInput && !accountInput.value) {
            accountInput.value = loginId;
          }

          inscreverTicks();
        }
      }

      if (data.msg_type === 'tick' && data.tick) {
        const price = data.tick.quote.toFixed(data.tick.pip_size);
        const ultimoDigito = price.slice(-1);

        const digitBox = document.getElementById('lastDigit');
        if (digitBox) {
          digitBox.innerText = ultimoDigito;
        }
      }
    } catch (e) {
      console.error('[DERIV Error] Falha de processamento:', e);
    }
  };

  socket.onerror = (err) => {
    console.error('[DERIV Error] Erro de rede no WebSocket:', err);
    if (statusPill) statusPill.className = 'status-pill status-off';
    if (statusTexto) statusTexto.innerText = 'ERRO DE CONEXÃO';
  };

  socket.onclose = () => {
    console.log('[DERIV] Conexão encerrada.');
  };
}

function inscreverTicks() {
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify({ ticks: '1HZ100V' }));
  }
}

function iniciarBotUnder7() {
  if (!socket || socket.readyState !== WebSocket.OPEN) {
    alert('Conecte a sua conta com o Token API primeiro!');
    return;
  }
  botAtivo = true;
  alert('Algoritmo WIN (Under 7) ativado com sucesso!');
}

function iniciarBotEvenOdd() {
  if (!socket || socket.readyState !== WebSocket.OPEN) {
    alert('Conecte a sua conta com o Token API primeiro!');
    return;
  }
  botAtivo = true;
  alert('Algoritmo Par / Ímpar ativado com sucesso!');
}
