const fs = require('fs');
const path = require('path');
const { sendMessage } = require('./sendMessage');

const commands = new Map();
const lastImageByUser = new Map();
const lastVideoByUser = new Map();
const prefix = '-';

fs.readdirSync(path.join(__dirname, '../commands'))
  .filter(file => file.endsWith('.js'))
  .forEach(file => {
    const command = require(`../commands/${file}`);
    commands.set(command.name.toLowerCase(), command);
  });

async function handleMessage(event, pageAccessToken) {
  const senderId = event?.sender?.id;
  if (!senderId) return console.error('Invalid event object');

  const messageText = event?.message?.text?.trim();
  const attachments = event?.message?.attachments || [];

  const imageAttachment = attachments.find(a => a.type === 'image');
  const videoAttachment = attachments.find(a => a.type === 'video');

  const imageUrl = imageAttachment?.payload?.url;
  const videoUrl = videoAttachment?.payload?.url;

  if (imageUrl) lastImageByUser.set(senderId, imageUrl);
  if (videoUrl) lastVideoByUser.set(senderId, videoUrl);

  const lastImage = imageUrl || lastImageByUser.get(senderId);
  const lastVideo = videoUrl || lastVideoByUser.get(senderId);
  const mediaToUpload = lastImage || lastVideo;


  if (!messageText) return console.log('Received message without text');

  const [rawCommand, ...args] = messageText.startsWith(prefix)
    ? messageText.slice(prefix.length).split(' ')
    : messageText.split(' ');

  const commandKey = rawCommand.toLowerCase();
  const mediaCommands = ['remini', 'catmoe', 'imgbb', 'restore', 'ocr',  'removebg', 'gemini', 'imgur', 'zombie', 'blur', 'vampire'];

  try {
    console.log(`Received command: ${commandKey}, args: ${args.join(' ')}`);

    if (mediaCommands.includes(commandKey)) {
      switch (commandKey) {
        case 'remini':
        case 'restore':
        case 'removebg':
        case 'zombie':
        case 'blur':
        case 'vampire':
          if (lastImage) {
            await commands.get(commandKey).execute(senderId, [], pageAccessToken, lastImage);
            lastImageByUser.delete(senderId);
          } else {
            await sendMessage(senderId, {
              text: `❌ 𝖯𝗅𝖾𝖺𝗌𝖾 𝗌𝖾𝗇𝖽 𝖺𝗇 𝗂𝗆𝖺𝗀𝖾 𝖿𝗂𝗋𝗌𝗍, 𝗍𝗁𝖾𝗇 𝗍𝗒𝗉𝖾 "${commandKey}".`
            }, pageAccessToken);
          }
          break;

        case 'gemini':
          await commands.get('gemini').execute(senderId, args, pageAccessToken, event, lastImage);
          lastImageByUser.delete(senderId);
          break;

        case 'imgbb':
          if (mediaToUpload) {
            await commands.get('imgbb').execute(senderId, [], pageAccessToken, mediaToUpload);
            lastImageByUser.delete(senderId);
            lastVideoByUser.delete(senderId);
          } else {
            await sendMessage(senderId, {
              text: '❌ Please send an image or video first, then type "imgbb".'
            }, pageAccessToken);
          }
          break;
  case 'imgur':
          if (mediaToUpload) {
            await commands.get('imgur').execute(senderId, [], pageAccessToken, mediaToUpload);
            lastImageByUser.delete(senderId);
            lastVideoByUser.delete(senderId);
          } else {
            await sendMessage(senderId, {
              text: '❌ Please send an image or video first, then type "imgur".'
            }, pageAccessToken);
          }
          break;
  case 'ocr':
          if (mediaToUpload) {
            await commands.get('ocr').execute(senderId, [], pageAccessToken, mediaToUpload);
            lastImageByUser.delete(senderId);
            lastVideoByUser.delete(senderId);
          } else {
            await sendMessage(senderId, {
              text: '❌ Please send an image first, then type "ocr".'
            }, pageAccessToken);
          }
          break;
  case 'catmoe':
          if (mediaToUpload) {
            await commands.get('catmoe').execute(senderId, [], pageAccessToken, mediaToUpload);
            lastImageByUser.delete(senderId);
            lastVideoByUser.delete(senderId);
          } else {
            await sendMessage(senderId, {
              text: '❌ Please send an image first, then type "ocr".'
            }, pageAccessToken);
          }
          break;
      }
      return;
    }

    // Normal command
    if (commands.has(commandKey)) {
      await commands.get(commandKey).execute(senderId, args, pageAccessToken, event, sendMessage);
    } else if (commands.has('ai')) {
      await commands.get('ai').execute(senderId, [messageText], pageAccessToken, event, sendMessage);
    } else {
      await sendMessage(senderId, {
        text: '❓ Unknown command and AI fallback is unavailable.'
      }, pageAccessToken);
    }

  } catch (error) {
    console.error(`Error executing command "${commandKey}":`, error);
    await sendMessage(senderId, {
      text: error.message || `❌ There was an error executing "${commandKey}".`
    }, pageAccessToken);
  }
}

module.exports = { handleMessage }; 