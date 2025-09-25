const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');

module.exports = {
  name: 'sim',
  description: 'Talk with the Simsimi.',
  usage: 'sim <text>',
  category: 'others',
  author: 'Tianji',
  async execute(senderId, args, pageAccessToken) {
    const query = args.join(' ');

    if (!query) {
      return sendMessage(senderId, {
        text: 'Error: Please provide a message.\nExample: sim Hello!'
      }, pageAccessToken);
    }

    try {
      const apiKey = '2a5a2264d2ee4f0b847cb8bd809ed34bc3309be7';
      const apiUrl = `https://simsimi.ooguy.com/sim?query=${encodeURIComponent(query)}&apikey=${apiKey}`;
      const { data } = await axios.get(apiUrl);

      if (!data || !data.respond) {
        return sendMessage(senderId, {
          text: 'Error: No response from Sim API.'
        }, pageAccessToken);
      }

      return sendMessage(senderId, {
        text: `${data.respond}`
      }, pageAccessToken);

    } catch (error) {
      console.error('sim command error:', error.message);
      await sendMessage(senderId, {
        text: 'Error: Failed to connect to Sim API.'
      }, pageAccessToken);
    }
  }
};