const axios = require("axios");
const { sendMessage } = require("../handles/sendMessage");

const API_KEY = "GET YOUR APIKEY https://kaiz-apis.gleeze.com";
const BASE_URL = "https://kaiz-apis.gleeze.com/api";

module.exports = {
  name: "tempmail",
  description: "Generate a temporary email and fetch inbox messages.",
  usage: "tempmail gen or tempmail inbox <token>",
  category: 'others',
  author: "Tianji",
  async execute(senderId, args, pageAccessToken) {
    if (!args[0]) {
      return sendMessage(
        senderId,
        { text: "𝗨𝘀𝗮𝗴𝗲: tempmail gen or tempmail inbox <token>." },
        pageAccessToken
      );
    }

    const command = args[0].toLowerCase();

    if (command === "gen") {
      try {
        const { data } = await axios.get(`${BASE_URL}/tempmail-create`, {
          params: { apikey: API_KEY }
        });

        if (!data?.token || !data?.address) {
          return sendMessage(
            senderId,
            { text: "⚠️ Failed to generate email. Please try again later." },
            pageAccessToken
          );
        }

        const { token, address: email } = data;

        return sendMessage(
          senderId,
          {
            text: `✉️: ${email}\n\n🔑: \n${token}\n\n🔔: Check inbox \ntempmail inbox ${token}`
          },
          pageAccessToken
        );
      } catch (error) {
        console.error("Error generating email:", error.message);
        return sendMessage(
          senderId,
          { text: "⚠️ An error occurred while generating the email.\n\nReason: down server :(" },
          pageAccessToken
        );
      }
    }

    if (command === "inbox" && args[1]) {
      const token = args[1];
      try {
        const { data } = await axios.get(`${BASE_URL}/tempmail-inbox`, {
          params: {
            apikey: API_KEY,
            token
          }
        });

        const inbox = data.emails;

        if (!inbox || inbox.length === 0) {
          return sendMessage(
            senderId,
            { text: "📭 No messages found in your inbox." },
            pageAccessToken
          );
        }

        const { from = "Unknown Sender", subject = "No Subject" } = inbox[0];

        return sendMessage(
          senderId,
          {
            text: `📬 | 𝗜𝗡𝗕𝗢𝗫\n─────────────\n👤 𝗙𝗿𝗼𝗺: ${from}\n🔖 𝗦𝘂𝗯𝗷𝗲𝗰𝘁: ${subject}\n─────────────`
          },
          pageAccessToken
        );
      } catch (error) {
        console.error("Error fetching inbox:", error.message);
        return sendMessage(
          senderId,
          { text: "⚠️ An error occurred while fetching the inbox.\n\nReason: expired email please generate new email -_-" },
          pageAccessToken
        );
      }
    }

    return sendMessage(
      senderId,
      { text: "𝗨𝘀𝗮𝗴𝗲: tempmail gen or tempmail inbox <token>." },
      pageAccessToken
    );
  }
};