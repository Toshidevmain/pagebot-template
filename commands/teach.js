const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');

module.exports = {
  name: 'teach',
  description: 'Teach the Sim API with a question and answer separated by "|".',
  usage: 'teach <ask> | <answer>',
  category: 'others',
  author: 'Tianji',
  async execute(senderId, args, pageAccessToken) {
    const input = args.join(' ').split('|').map(part => part.trim());
    const ask = input[0];
    const ans = input[1];

    if (!ask || !ans) {
      return sendMessage(senderId, {
        text: 'Error: Please provide a question and an answer separated by "|".\nExample: teach Hello | Hi there!'
      }, pageAccessToken);
    }

    try {
      const apiKey = '2a5a2264d2ee4f0b847cb8bd809ed34bc3309be7';
      const apiUrl = `https://simsimi.ooguy.com/teach?ask=${encodeURIComponent(ask)}&ans=${encodeURIComponent(ans)}&apikey=${apiKey}`;
      const { data } = await axios.get(apiUrl);

      if (!data || !data.message) {
        return sendMessage(senderId, {
          text: 'Error: No response from Teach API.'
        }, pageAccessToken);
      }

      return sendMessage(senderId, {
        text: `Teach Response: ${data.message}\nNote: ${data.teachResponse?.respond || 'No extra details.'}`
      }, pageAccessToken);

    } catch (error) {
      console.error('teach command error:', error.message);
      await sendMessage(senderId, {
        text: 'Error: Failed to connect to Teach API.'
      }, pageAccessToken);
    }
  }
};