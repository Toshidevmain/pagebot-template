const axios = require("axios");
const { sendMessage } = require("../handles/sendMessage");

module.exports = {
  name: "restore",
  description: "Restore an old or blurry image",
  author: "Tianji",
  category: 'images',
  usage: "Send any picture first then reply restore",

  async execute(senderId, args, pageAccessToken, imageUrl) {
    if (!imageUrl) {
      return sendMessage(senderId, {
        text: `❌ 𝗣𝗹𝗲𝗮𝘀𝗲 𝘀𝗲𝗻𝗱 𝗮𝗻 𝗶𝗺𝗮𝗴𝗲 𝗳𝗶𝗿𝘀𝘁, 𝘁𝗵𝗲𝗻 𝘁𝘆𝗽𝗲 "𝗿𝗲𝘀𝘁𝗼𝗿𝗲" 𝘁𝗼 𝗿𝗲𝘀𝘁𝗼𝗿𝗲 𝗶𝘁.`
      }, pageAccessToken);
    }

    sendMessage(senderId, { text: "⌛ 𝗥𝗲𝘀𝘁𝗼𝗿𝗶𝗻𝗴 𝗶𝗺𝗮𝗴𝗲, 𝗽𝗹𝗲𝗮𝘀𝗲 𝘄𝗮𝗶𝘁..." }, pageAccessToken);

    try {
      const url = `https://rapido.zetsu.xyz/api/restore?imageUrl=${encodeURIComponent(imageUrl)}`;
      const res = await axios.get(url);

      if (res.data && typeof res.data === 'string' && res.data.startsWith('http')) {
        await sendMessage(senderId, {
          attachment: {
            type: "image",
            payload: {
              url: res.data
            }
          }
        }, pageAccessToken);
      } else {
        await sendMessage(senderId, {
          text: `❌ Failed to restore image. Invalid response from API.`
        }, pageAccessToken);
      }

    } catch (error) {
      console.error("❌ Error restoring image:", error);
      await sendMessage(senderId, {
        text: `❌ An error occurred while restoring the image. Please try again later.`
      }, pageAccessToken);
    }
  }
};