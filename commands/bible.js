const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');

module.exports = {
  name: 'bible',
  description: 'Sends a random Bible verse.',
  usage: 'bible',
  category: 'others',
  author: 'Tianji',

  async execute(senderId, args, pageAccessToken) {
    try {
      const res = await axios.get('https://api-sentinels-3e5w.onrender.com/api/bible');
      const { reference, verse } = res.data;

      await sendMessage(senderId, {
        text: `
📖 𝗕𝗶𝗯𝗹𝗲 𝗩𝗲𝗿𝘀𝗲
──────────────
"${verse.trim()}"

📌 𝗥𝗲𝗳𝗲𝗿𝗲𝗻𝗰𝗲: ${reference}`
      }, pageAccessToken);
    } catch (error) {
      console.error('Bible verse fetch error:', error.message);
      await sendMessage(senderId, {
        text: '⚠️ 𝗘𝗿𝗿𝗼𝗿: 𝗖𝗼𝘂𝗹𝗱 𝗻𝗼𝘁 𝗳𝗲𝘁𝗰𝗵 𝗮 𝗕𝗶𝗯𝗹𝗲 𝘃𝗲𝗿𝘀𝗲. 𝗣𝗹𝗲𝗮𝘀𝗲 𝘁𝗿𝘆 𝗮𝗴𝗮𝗶𝗻 𝗹𝗮𝘁𝗲𝗿.'
      }, pageAccessToken);
    }
  }
};