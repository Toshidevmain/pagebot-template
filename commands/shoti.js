const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');

module.exports = {
  name: 'waifu',
  description: 'Get a random waifu image.',
  usage: 'waifu',
  author: 'Marjhun Baylon',
  category: 'images',

  async execute(senderId, args, pageAccessToken) {
    try {
      const apiUrl = 'https://kaiz-apis.gleeze.com/api/waifu?apikey=4eb61ecf-4ec4-4b50-a10a-9e81a4b8f37a';
      const { data } = await axios.get(apiUrl);

      if (!data || !data.imageUrl) {
        return sendMessage(senderId, {
          text: '❌ Failed to fetch waifu image. Please try again later.'
        }, pageAccessToken);
      }

      console.log("🖼️ New Waifu Image Fetched:");
      console.log(`Author (API): ${data.author}`);
      console.log(`Image URL: ${data.imageUrl}`);

      await sendMessage(senderId, {
        attachment: {
          type: 'image',
          payload: { url: data.imageUrl }
        }
      }, pageAccessToken);

    } catch (error) {
      console.error('Waifu command error:', error.message);
      await sendMessage(senderId, {
        text: `❌ Error while fetching waifu image:\n${error.message}`
      }, pageAccessToken);
    }
  }
};
