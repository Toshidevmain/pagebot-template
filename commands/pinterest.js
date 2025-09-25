const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');

module.exports = {
  name: 'pinterest',
  description: 'pinterest <keyword> - <amount>',
  usage: 'pinterest <keyword> - <amount>\nExample: pinterest dog - 6',
  category: 'images',
  author: 'Tianji',
  
  async execute(senderId, args, pageAccessToken) {
    const input = args.join(' ').trim();
    if (!input.includes(' - ')) {
      await sendMessage(senderId, { 
        text: '❌ 𝗜𝗻𝘃𝗮𝗹𝗶𝗱 𝗳𝗼𝗿𝗺𝗮𝘁.\n𝗨𝘀𝗲: pinterest <keyword> - <amount>\n𝗘𝘅𝗮𝗺𝗽𝗹𝗲: pinterest dog - 6' 
      }, pageAccessToken);
      return;
    }

    const [keyword, amountText] = input.split(' - ');
    const amount = parseInt(amountText);

    if (!keyword || isNaN(amount) || amount <= 0) {
      await sendMessage(senderId, { 
        text: '❌ 𝗜𝗻𝘃𝗮𝗹𝗶𝗱 𝗸𝗲𝘆𝘄𝗼𝗿𝗱 𝗼𝗿 𝗮𝗺𝗼𝘂𝗻𝘁.\n𝗨𝘀𝗲: pinterest <keyword> - <amount>' 
      }, pageAccessToken);
      return;
    }

    if (amount > 50) {
      await sendMessage(senderId, { 
        text: '⚠️ 𝗠𝗮𝘅𝗶𝗺𝘂𝗺 𝗮𝗹𝗹𝗼𝘄𝗲𝗱 𝗶𝗺𝗮𝗴𝗲𝘀 𝗶𝘀 𝟱𝟬. 𝗣𝗹𝗲𝗮𝘀𝗲 𝘂𝘀𝗲 𝗮 𝗹𝗼𝘄𝗲𝗿 𝗮𝗺𝗼𝘂𝗻𝘁.' 
      }, pageAccessToken);
      return;
    }

    try {
      await sendMessage(senderId, { 
        text: `🔍 𝗦𝗲𝗮𝗿𝗰𝗵𝗶𝗻𝗴 𝗣𝗶𝗻𝘁𝗲𝗿𝗲𝘀𝘁 𝗳𝗼𝗿 "${keyword}" (${amount} 𝗶𝗺𝗮𝗴𝗲𝘀)…` 
      }, pageAccessToken);

      const apiUrl = `https://api-sentinels-3e5w.onrender.com/api/pinterest?q=${encodeURIComponent(keyword)}&amount=${amount}`;
      const response = await axios.get(apiUrl);
      const results = response.data?.results;

      if (!results || results.length === 0) {
        await sendMessage(senderId, { 
          text: `❌ 𝗡𝗼 𝗿𝗲𝘀𝘂𝗹𝘁𝘀 𝗳𝗼𝘂𝗻𝗱 𝗳𝗼𝗿 "${keyword}".` 
        }, pageAccessToken);
        return;
      }

      // Send each image as an attachment (Messenger accepts direct URLs)
      for (const imgUrl of results) {
        await sendMessage(senderId, {
          attachment: {
            type: 'image',
            payload: { url: imgUrl }
          }
        }, pageAccessToken);
      }

      await sendMessage(senderId, { 
        text: `📌 𝗣𝗶𝗻𝘁𝗲𝗿𝗲𝘀𝘁 𝗿𝗲𝘀𝘂𝗹𝘁𝘀 𝗳𝗼𝗿: "${keyword}" ✅` 
      }, pageAccessToken);

    } catch (error) {
      console.error('Pinterest command error:', error);
      await sendMessage(senderId, { 
        text: '❌ 𝗔𝗻 𝗲𝗿𝗿𝗼𝗿 𝗼𝗰𝗰𝘂𝗿𝗿𝗲𝗱 𝘄𝗵𝗶𝗹𝗲 𝗳𝗲𝘁𝗰𝗵𝗶𝗻𝗴 𝗣𝗶𝗻𝘁𝗲𝗿𝗲𝘀𝘁 𝗶𝗺𝗮𝗴𝗲𝘀.' 
      }, pageAccessToken);
    }
  }
};