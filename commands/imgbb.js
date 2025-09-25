const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');

module.exports = {
  name: 'imgbb',
  description: 'Upload an image to ImgBB and get the link.',
  author: 'Tianji',
  usage: 'Send image then type imgbb',
  category: 'uploader',
  async execute(senderId, args, pageAccessToken, imageUrl) {
    if (!imageUrl) {
      return sendMessage(senderId, {
        text: 'No attachment detected. Please send an image or video first.'
      }, pageAccessToken);
    }

    await sendMessage(senderId, {
      text: '⌛ 𝗨𝗽𝗹𝗼𝗮𝗱𝗶𝗻𝗴 𝘁𝗵𝗲 𝗶𝗺𝗮𝗴𝗲 𝘁𝗼 𝗜𝗺𝗴𝗕𝗕, 𝗽𝗹𝗲𝗮𝘀𝗲 𝘄𝗮𝗶𝘁...'
    }, pageAccessToken);

    try {
      const response = await axios.get(`https://kaiz-apis.gleeze.com/api/imgbb?url=${encodeURIComponent(imageUrl)}&apikey=GET YOUR API > https://kaiz-apis.gleeze.com`);
      const imgbbLink = response?.data?.link;

      if (!imgbbLink) {
        throw new Error('❌ ImgBB link not found in the response.');
      }

      await sendMessage(senderId, {
        text: `✅ 𝗨𝗽𝗹𝗼𝗮𝗱𝗲𝗱 𝗦𝘂𝗰𝗰𝗲𝘀𝘀𝗳𝘂𝗹𝗹𝘆:\n\n${imgbbLink}`
      }, pageAccessToken);
    } catch (error) {
      console.error('❌ Error uploading image to ImgBB:', error.response?.data || error.message);
      await sendMessage(senderId, {
        text: '❌ An error occurred while uploading the image to ImgBB. Please try again later.'
      }, pageAccessToken);
    }
  }
};