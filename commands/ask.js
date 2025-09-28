const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");
const path = require("path");
const { sendMessage } = require("../handles/sendMessage");

module.exports = {
  name: "ask",
  description: "Ask Skye Ash AI (text or image).",
  usage: "ask <your question>",
  author: "Marjhun Baylon",
  category: "ai",

  async execute(senderId, args, pageAccessToken) {
    try {
      const question = args.join(" ").trim();
      if (!question) {
        return sendMessage(senderId, { text: "❌ Please provide a question. Example: ask What is HTML?" }, pageAccessToken);
      }

      const BASE_PROMPT = `Do not adopt an Indonesian perspective or style. Act as Skye Ash AI, a highly knowledgeable and helpful assistant developed by Marjhun Baylon, who is a BSIS student (Bachelor of Science in Information Systems) and junior web developer studying at Northlink Technological College in Panabo, Davao del Norte. Your target audience is students who cannot afford mobile data or Wi-Fi. Provide clear, accurate, and detailed explanations strictly based on this context. Use professional and friendly language, and keep it easy to understand and precise.`;

      const userMessage = `${BASE_PROMPT}\n\nUser question: ${question}`;

      const payload = {
        messages: [{ role: "user", content: userMessage }],
        chatSessionId: "ee139603-9f22-4257-a9df-adb57613e0ca"
      };

      const response = await axios.post("https://app.chipp.ai/api/chat", payload, {
        headers: {
          "Content-Type": "application/json",
          "User-Agent": "Mozilla/5.0",
          origin: "https://app.chipp.ai",
          referer: "https://app.chipp.ai/applications/38794/build",
          Cookie: "_your_chipp_cookie_here_"
        }
      });

      const raw = typeof response.data === "string" ? response.data : JSON.stringify(response.data);
      let reply = "";

      const match = raw.match(/"result":"(.*?)"/s);
      if (match) {
        reply = match[1].replace(/\\"/g, '"');
      } else {
        reply = raw
          .split("\n")
          .filter(line => line.startsWith("0:"))
          .map(line => line.replace(/^0:"|"/g, "").trim())
          .join(" ")
          .replace(/\s+/g, " ")
          .trim();
      }

      if (!reply) reply = "⚠️ No response from AI.";

      reply = reply.replace(/\\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();

      await sendMessage(senderId, { text: reply }, pageAccessToken);

    } catch (error) {
      console.error("Ask command error:", error.message);
      await sendMessage(senderId, {
        text: `❌ Error while processing your request:\n${error.message}`
      }, pageAccessToken);
    }
  }
};
