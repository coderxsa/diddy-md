process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';
process.on('uncaughtException', (e) => { 
   const error = String(e);
   if (error.includes('rate-overlimit')) return false
   else console.error(e);
});
const pino = require('pino');
const {
   makeInMemoryStore,
   useMultiFileAuthState,
   DisconnectReason
} = require('@adiwajshing/baileys');
const { Format, Connect, signalGroup } = require('utils-mf'); 
const store = makeInMemoryStore({ logger: pino().child({ level: 'silent', stream: 'store' })});
Object.assign(global, {   
   default_db: { users: {}, chats: {}, settings: {}, stores: {}, menfess: {} },   
   setting: require('./config.json'),
   mess: require('./lib/message.json'),
   Connect: Connect, Format: Format
});
require('./lib/settings.js');
require('utils-mf/index.js');
require('./lib/system.js');
require('./lib/src/mongo/mongo-info.js');
const { caller } = require('./lib/system.js');
const startWhatsApp = async () => {
   const { state, saveCreds } = await useMultiFileAuthState('./sessions');
   const conn = await signalGroup(state, store);
   conn.ev.on('connection.update', (update) => {
      const { connection, lastDisconnect } = update;
      if (connection === 'open') {
         console.log(`🟢 Online`);
      } else if (connection === 'connecting') {
         console.log(`🟡 Reconnecting`);
      } else if (connection === 'close') {
         console.log(`🔴 Disconnected`);
         if (lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut) startWhatsApp();
      }
   });
   caller(conn);   
   store.bind(conn.ev);
   conn.ev.on('creds.update', saveCreds);
};
startWhatsApp();