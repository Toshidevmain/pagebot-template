const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');

const COMMANDS_PATH = path.join(__dirname, '../commands');

const CATEGORY_MAP = {
  ai: '🤖 | 𝗔𝗜',
  music: '🎧 | 𝗠𝗨𝗦𝗜𝗖',
  images: '🖼️ | 𝗜𝗠𝗔𝗚𝗘𝗦',
  tools: '⚒️ | 𝗧𝗢𝗢𝗟𝗦',
  uploader: '📥 | 𝗨𝗣𝗟𝗢𝗔𝗗𝗘𝗥',
  others: '🗂️ | 𝗢𝗧𝗛𝗘𝗥𝗦'
};

const ALLOWED_CATEGORIES = ['ai', 'music', 'images', 'tools', 'uploader'];

module.exports = {
  name: 'help',
  description: 'Show available commands grouped by category or details for a command.',
  usage: 'help [command name]',
  author: 'Pagebot System',
  category: 'tools',

  async execute(senderId, args, pageAccessToken) {
    try {
      const files = fs.readdirSync(COMMANDS_PATH).filter(file => file.endsWith('.js'));

      const commands = files.map(file => {
        try {
          const cmd = require(path.join(COMMANDS_PATH, file));
          const category = ALLOWED_CATEGORIES.includes(cmd.category) ? cmd.category : 'others';
          return {
            name: cmd.name || 'Unnamed',
            description: cmd.description || 'No description.',
            usage: cmd.usage || 'Not specified.',
            author: cmd.author || 'Unknown',
            category
          };
        } catch {
          return null;
        }
      }).filter(Boolean);

      if (args.length > 0) {
        const input = args[0].toLowerCase();
        const cmd = commands.find(c => c.name.toLowerCase() === input);

        if (!cmd) {
          return sendMessage(senderId, {
            text: `❌ Command "${input}" not found.`
          }, pageAccessToken);
        }

        const response =
`📘 𝗖𝗼𝗺𝗺𝗮𝗻𝗱 𝗗𝗲𝘁𝗮𝗶𝗹𝘀

🔹 𝗡𝗮𝗺𝗲: ${cmd.name}
🔹 𝗗𝗲𝘀𝗰𝗿𝗶𝗽𝘁𝗶𝗼𝗻: ${cmd.description}
🔹 𝗨𝘀𝗮𝗴𝗲: ${cmd.usage}
🔹 𝗖𝗮𝘁𝗲𝗴𝗼𝗿𝘆: ${CATEGORY_MAP[cmd.category] || '🗂️ | OTHERS'}
🔹 𝗔𝘂𝘁𝗵𝗼𝗿: ${cmd.author}`;

        return sendMessage(senderId, { text: response }, pageAccessToken);
      }

      const grouped = {};
      for (const cat of Object.keys(CATEGORY_MAP)) grouped[cat] = [];
      for (const cmd of commands) grouped[cmd.category || 'others'].push(`• ${cmd.name}`);

      const totalCount = commands.length;
      let message = `📖 𝗛𝗲𝗹𝗽 𝗠𝗲𝗻𝘂  \nTotal Commands: ${totalCount}\n\n`;

      for (const cat of Object.keys(CATEGORY_MAP)) {
        if (grouped[cat].length > 0) {
          message += `${CATEGORY_MAP[cat]} [${grouped[cat].length}]\n${grouped[cat].join('\n')}\n\n`;
        }
      }

      message += "💡 𝗧𝗶𝗽: Type `help <command>` to view details of a specific command.\n\n";

      let factText = null;
      try {
        const factRes = await axios.get("https://api.popcat.xyz/v2/fact");
        if (factRes.data && factRes.data.message && factRes.data.message.fact) {
          factText = factRes.data.message.fact;
        }
      } catch {}

      if (factText) {
        message += `📌 𝗥𝗮𝗻𝗱𝗼𝗺 𝗙𝗮𝗰𝘁:\n"${factText}"`;
      }

      await sendMessage(senderId, { text: message }, pageAccessToken);

    } catch (error) {
      console.error('Help command error:', error.message);
      await sendMessage(senderId, {
        text: `❌ Error while showing help menu:\n${error.message}`
      }, pageAccessToken);
    }
  }
};
