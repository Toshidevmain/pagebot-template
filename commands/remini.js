const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');

module.exports = {
  name: 'remini',
  description: 'Enhance or upscale an image using the Remini API.',
  usage: 'Send image and type remini',
  category: 'images',
  author: 'Tianji',

  async execute(senderId, args, pageAccessToken, imageUrl) {
    if (!imageUrl) {
      return sendMessage(senderId, {
        text: `❌ 𝗣𝗹𝗲𝗮𝘀𝗲 𝘀𝗲𝗻𝗱 𝗮𝗻 𝗶𝗺𝗮𝗴𝗲 𝗳𝗶𝗿𝘀𝘁, 𝘁𝗵𝗲𝗻 𝘁𝘆𝗽𝗲 "𝗿𝗲𝗺𝗶𝗻𝗶" 𝘁𝗼 𝗲𝗻𝗵𝗮𝗻𝗰𝗲 𝗶𝘁.`
      }, pageAccessToken);
    }

    await sendMessage(senderId, { text: '🔄 𝗨𝗽𝘀𝗰𝗮𝗹𝗶𝗻𝗴 𝘁𝗵𝗲 𝗶𝗺𝗮𝗴𝗲, 𝗽𝗹𝗲𝗮𝘀𝗲 𝘄𝗮𝗶𝘁...' }, pageAccessToken);

    try {
      const apiUrl = `https://rapido.zetsu.xyz/api/upscale-image?imageUrl=${encodeURIComponent(imageUrl)}`;
      const { data } = await axios.get(apiUrl);

      if (!data.resultImageUrl) {
        return sendMessage(senderId, {
          text: '❌ Upscale failed. No result from API.'
        }, pageAccessToken);
      }

      await sendMessage(senderId, {
        attachment: {
          type: 'image',
          payload: {
            url: data.resultImageUrl
          }
        }
      }, pageAccessToken);

    } catch (error) {
      console.error('Remini Error:', error?.response?.data || error.message);
      await sendMessage(senderId, {
        text: '❌ An error occurred while enhancing the image. Please try again later.'
      }, pageAccessToken);
    }
  }
};