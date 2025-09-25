const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');

module.exports = {
  name: 'aniquote',
  description: 'Sends a random anime quote.',
  usage: 'aniquote',
  category: 'others',
  author: 'Tianji',

  async execute(senderId, args, pageAccessToken) {
    try {
      const res = await axios.get('https://api-sentinels-3e5w.onrender.com/api/animequotes');
      const { character, quote, creator } = res.data;

      await sendMessage(senderId, {
        text: `
𝗔𝗻𝗶𝗺𝗲 𝗤𝘂𝗼𝘁𝗲
─────────────
"${quote}"

- ${character}
─────────────
👤 𝗖𝗿𝗲𝗮𝘁𝗼𝗿: ${creator}`
      }, pageAccessToken);
    } catch (error) {
      console.error('Anime quote fetch error:', error.message);
      await sendMessage(senderId, {
        text: '𝗘𝗿𝗿𝗼𝗿: 𝗖𝗼𝘂𝗹𝗱 𝗻𝗼𝘁 𝗿𝗲𝘁𝗿𝗶𝗲𝘃𝗲 𝗮𝗻 𝗮𝗻𝗶𝗺𝗲 𝗾𝘂𝗼𝘁𝗲. 𝗧𝗿𝘆 𝗮𝗴𝗮𝗶𝗻 𝗹𝗮𝘁𝗲𝗿.'
      }, pageAccessToken);
    }
  }
};