const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');

module.exports = {
  name: 'weather',
  description: 'Get current weather information!',
  usage: ' weather <location>',
  category: 'others',
  author: 'Tianji',
  async execute(senderId, args, pageAccessToken) {
    if (args.length === 0) {
      await sendMessage(senderId, {
        text: "⚠️ 𝗣𝗹𝗲𝗮𝘀𝗲 𝗽𝗿𝗼𝘃𝗶𝗱𝗲 𝗮 𝗹𝗼𝗰𝗮𝘁𝗶𝗼𝗻.\n\nExample: weather Manila"
      }, pageAccessToken);
      return;
    }

    const location = args.join(" ");

    await sendMessage(senderId, {
      text: `🌦️ 𝗙𝗲𝘁𝗰𝗵𝗶𝗻𝗴 𝘄𝗲𝗮𝘁𝗵𝗲𝗿 𝗳𝗼𝗿: ${location}...`
    }, pageAccessToken);

    try {
      const response = await axios.get(`https://kaiz-apis.gleeze.com/api/weather?q=${encodeURIComponent(location)}&apikey=4eb61ecf-4ec4-4b50-a10a-9e81a4b8f37a`);
      const data = response.data["0"];

      if (!data || !data.current) {
        await sendMessage(senderId, {
          text: `🥺 𝗦𝗼𝗿𝗿𝘆, 𝗜 𝗰𝗼𝘂𝗹𝗱𝗻'𝘁 𝗳𝗶𝗻𝗱 𝘁𝗵𝗲 𝘄𝗲𝗮𝘁𝗵𝗲𝗿 𝗳𝗼𝗿 "${location}".`
        }, pageAccessToken);
        return;
      }

      const { location: loc, current, forecast } = data;

      let forecastText = forecast
        .slice(0, 3) // show 3-day forecast
        .map(f => `📅 ${f.day} (${f.date})\n☁️ ${f.skytextday}\n🌡️ ${f.low}°C - ${f.high}°C\n💧 ${f.precip}% chance\n`)
        .join("\n");

      const message = 
        `📍 𝗪𝗲𝗮𝘁𝗵𝗲𝗿 𝗶𝗻 ${loc.name}\n\n` +
        `🌡️ 𝗧𝗲𝗺𝗽: ${current.temperature}°C (Feels like ${current.feelslike}°C)\n` +
        `☁️ 𝗖𝗼𝗻𝗱𝗶𝘁𝗶𝗼𝗻: ${current.skytext}\n` +
        `💧 𝗛𝘂𝗺𝗶𝗱𝗶𝘁𝘆: ${current.humidity}%\n` +
        `🌬️ 𝗪𝗶𝗻𝗱: ${current.winddisplay}\n\n` +
        `🔮 𝗙𝗼𝗿𝗲𝗰𝗮𝘀𝘁:\n${forecastText}`;

      await sendMessage(senderId, { text: message }, pageAccessToken);

    } catch (error) {
      console.error('Weather command error:', error.message);
      await sendMessage(senderId, {
        text: `❌ 𝗔𝗻 𝗲𝗿𝗿𝗼𝗿 𝗼𝗰𝗰𝘂𝗿𝗿𝗲𝗱: ${error.message}`
      }, pageAccessToken);
    }
  }
};
