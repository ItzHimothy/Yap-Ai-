require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const OpenAI = require('openai');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

client.once('ready', () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  if (!message.content.startsWith('!ask')) return;

  const question = message.content.slice(4).trim();
  if (!question) return message.reply('❗ Ask something.');

  try {
    console.log('📤 Sending to OpenAI:', question);

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: question }],
      max_tokens: 200
    });

    const reply = response.choices[0].message.content;
    await message.reply(reply);
  } catch (err) {
    console.error('❌ OPENAI FAILED:', err);
    await message.reply('⚠️ AI error. Try again later.');
  }
});

client.login(process.env.TOKEN);
