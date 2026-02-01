import 'dotenv/config';
import { Client, GatewayIntentBits } from 'discord.js';
import OpenAI from 'openai';

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

client.once('ready', () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  if (!message.content.startsWith('!ask')) return;

  const question = message.content.replace('!ask', '').trim();
  if (!question) {
    return message.reply('❗ Please ask a question.');
  }

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are Yap AI, a helpful Discord assistant.' },
        { role: 'user', content: question },
      ],
      max_tokens: 300,
    });

    const reply = response.choices[0].message.content;
    await message.reply(reply);
  } catch (err) {
    console.error('❌ OpenAI Error:', err);
    await message.reply('⚠️ AI error. Try again later.');
  }
});

client.login(process.env.TOKEN);
