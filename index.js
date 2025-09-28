const express = require('express');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { handleMessage } = require('./handles/handleMessage');
const { handlePostback } = require('./handles/handlePostback');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const VERIFY_TOKEN = 'pagebot';
const PAGE_ACCESS_TOKEN = fs.readFileSync('token.txt', 'utf8').trim();
const COMMANDS_PATH = path.join(__dirname, 'commands');
const PORT = process.env.PORT || 5000;

const clients = new Set();
const LOG_BUFFER_MAX = 500;
const logBuffer = [];

function pushLog(type, text) {
  const time = new Date().toLocaleTimeString();
  const entry = { type, text: String(text), time };
  logBuffer.push(entry);
  if (logBuffer.length > LOG_BUFFER_MAX) logBuffer.shift();
  const payload = `data: ${JSON.stringify(entry)}\n\n`;
  for (const res of clients) {
    try { res.write(payload); } catch (e) {}
  }
}

const log = {
  info: (msg) => { console.log(`\x1b[36m[INFO ${new Date().toLocaleTimeString()}]\x1b[0m ${msg}`); pushLog('info', msg); },
  success: (msg) => { console.log(`\x1b[32m[SUCCESS ${new Date().toLocaleTimeString()}]\x1b[0m ${msg}`); pushLog('success', msg); },
  warn: (msg) => { console.warn(`\x1b[33m[WARN ${new Date().toLocaleTimeString()}]\x1b[0m ${msg}`); pushLog('warn', msg); },
  error: (msg) => { console.error(`\x1b[31m[ERROR ${new Date().toLocaleTimeString()}]\x1b[0m ${msg}`); pushLog('error', msg); }
};

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/events', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();
  res.write(`retry: 10000\n\n`);
  clients.add(res);
  for (const entry of logBuffer) {
    res.write(`data: ${JSON.stringify(entry)}\n\n`);
  }
  req.on('close', () => clients.delete(res));
});

app.get('/webhook', (req, res) => {
  const { 'hub.mode': mode, 'hub.verify_token': token, 'hub.challenge': challenge } = req.query;
  if (mode && token) {
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      log.success('Webhook verified successfully!');
      return res.status(200).send(challenge);
    }
    log.warn('Webhook verification failed. Invalid token.');
    return res.sendStatus(403);
  }
  log.warn('Webhook verification request missing parameters.');
  res.sendStatus(400);
});

app.post('/webhook', (req, res) => {
  const { body } = req;
  if (body.object === 'page') {
    body.entry?.forEach(entry => {
      entry.messaging?.forEach(event => {
        if (event.message) {
          log.info(`Incoming message event from PSID: ${event.sender?.id}`);
          handleMessage(event, PAGE_ACCESS_TOKEN);
        } else if (event.postback) {
          log.info(`Incoming postback event from PSID: ${event.sender?.id}`);
          handlePostback(event, PAGE_ACCESS_TOKEN);
        }
      });
    });
    return res.status(200).send('EVENT_RECEIVED');
  }
  log.error('Invalid webhook event received.');
  res.sendStatus(404);
});

const sendMessengerProfileRequest = async (method, url, data = null) => {
  try {
    const response = await axios({
      method,
      url: `https://graph.facebook.com/v21.0${url}?access_token=${PAGE_ACCESS_TOKEN}`,
      headers: { 'Content-Type': 'application/json' },
      data
    });
    return response.data;
  } catch (error) {
    log.error(`Messenger API ${method.toUpperCase()} ${url} failed: ${JSON.stringify(error.response?.data || error.message)}`);
    throw error;
  }
};

const loadCommands = () => {
  return fs.readdirSync(COMMANDS_PATH)
    .filter(file => file.endsWith('.js'))
    .map(file => {
      const command = require(path.join(COMMANDS_PATH, file));
      return command.name && command.description
        ? { name: command.name, description: command.description }
        : null;
    })
    .filter(Boolean);
};

const loadMenuCommands = async (isReload = false) => {
  const commands = loadCommands();
  if (isReload) {
    await sendMessengerProfileRequest('delete', '/me/messenger_profile', { fields: ['commands'] });
    log.warn('Menu commands deleted for reload.');
  }
  await sendMessengerProfileRequest('post', '/me/messenger_profile', {
    commands: [{ locale: 'default', commands }]
  });
  log.success(`Menu commands ${isReload ? 'reloaded' : 'loaded'} successfully.`);
  if (commands.length > 0) {
    log.info('Loaded commands:');
    commands.forEach(cmd => {
      log.info(`   • ${cmd.name} → ${cmd.description}`);
    });
  } else {
    log.warn('No commands found in commands folder.');
  }
};

fs.watch(COMMANDS_PATH, (eventType, filename) => {
  if (['change', 'rename'].includes(eventType) && filename && filename.endsWith('.js')) {
    log.info(`Detected change in ${filename}, reloading menu commands...`);
    loadMenuCommands(true).catch(error => {
      log.error(`Error reloading commands: ${error.message}`);
    });
  }
});

app.listen(PORT, '0.0.0.0', async () => {
  log.success(`Server is running at http://localhost:${PORT}`);
  try {
    await loadMenuCommands();
  } catch (error) {
    log.error(`Failed to load initial commands: ${error.message}`);
  }
});
