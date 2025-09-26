const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');

module.exports = {
  name: 'history',
  description: 'Fetches a historical extract about a given topic.',
  usage: 'history <topic>',
  category: 'others',
  author: 'Tianji',

  async execute(senderId, args, pageAccessToken) {
    try {
      if (!args || args.length === 0) {
        return sendMessage(senderId, {
          text: '⚠️ Please provide a topic. Example: history Philippines'
        }, pageAccessToken);
      }

      const query = args.join(' ');
      const res = await axios.get(`https://api-sentinels-3e5w.onrender.com/api/history?search=${encodeURIComponent(query)}`);
      const { title, extract } = res.data;

      await sendMessage(senderId, {
        text: `
📜 𝗛𝗶𝘀𝘁𝗼𝗿𝘆 𝗙𝗮𝗰𝘁
──────────────
📌 𝗧𝗶𝘁𝗹𝗲: ${title}

${extract.trim()}`
      }, pageAccessToken);
    } catch (error) {
      console.error('History fetch error:', error.message);
      await sendMessage(senderId, {
        text: '⚠️ 𝗘𝗿𝗿𝗼𝗿: 𝗖𝗼𝘂𝗹𝗱 𝗻𝗼𝘁 𝗿𝗲𝘁𝗿𝗶𝗲𝘃𝗲 𝗵𝗶𝘀𝘁𝗼𝗿𝘆 𝗱𝗮𝘁𝗮. 𝗣𝗹𝗲𝗮𝘀𝗲 𝘁𝗿𝘆 𝗮𝗴𝗮𝗶𝗻 𝗹𝗮𝘁𝗲𝗿.'
      }, pageAccessToken);
    }
  }
};