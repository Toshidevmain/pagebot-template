const axios = require('axios');
const { sendMessage } = require('./sendMessage');

const handlePostback = async (event, pageAccessToken) => {
  const { id: senderId } = event.sender || {};
  const { payload } = event.postback || {};

  if (!senderId || !payload) return console.error('Invalid postback event object');

  try {
    // Send updated Terms of Service & Privacy Policy text
    await sendMessage(senderId, {
      text: `𝗧𝗘𝗥𝗠𝗦 𝗢𝗙 𝗦𝗘𝗥𝗩𝗜𝗖𝗘 & 𝗣𝗥𝗜𝗩𝗔𝗖𝗬 𝗣𝗢𝗟𝗜𝗖𝗬

By using this bot, you agree to:
1. 𝗜𝗻𝘁𝗲𝗿𝗮𝗰𝘁𝗶𝗼𝗻: Automated responses may log interactions to improve service.
2. 𝗗𝗮𝘁𝗮: We collect data to enhance functionality without sharing it.
3. 𝗦𝗲𝗰𝘂𝗿𝗶𝘁𝘆: Your data is protected.
4. 𝗖𝗼𝗺𝗽𝗹𝗶𝗮𝗻𝗰𝗲: Follow Facebook's terms or risk access restrictions.
5. 𝗨𝗽𝗱𝗮𝘁𝗲𝘀: Terms may change, and continued use implies acceptance.

Failure to comply may result in access restrictions.

𝗧𝗶𝗽: type “help” to see available commands.`
    }, pageAccessToken);

  } catch (err) {
    console.error('Error handling postback:', err.message || err);
  }
};

module.exports = { handlePostback }; 