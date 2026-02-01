require("dotenv").config();
const { Client, GatewayIntentBits } = require("discord.js");
const OpenAI = require("openai");

/* ================= CONFIG ================= */

const PREFIX = "!ask";
const ALLOWED_GUILD_ID = "1465718425765679135";

/* ========================================== */

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

/* ================= READY ================= */

client.once("ready", () => {
  console.log(`🤖 Yap-AI logged in as ${client.user.tag}`);
});

/* ================= MESSAGE HANDLER ================= */

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;
  if (!message.guild) return;
  if (message.guild.id !== ALLOWED_GUILD_ID) return;

  if (!message.content.toLowerCase().startsWith(PREFIX)) return;

  const question = message.content.slice(PREFIX.length).trim();
  if (!question) {
    return message.reply("❌ Ask me something after `!ask`");
  }

  await message.channel.sendTyping();

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are Yap AI, a friendly assistant for the Yap Sites Discord server. Help with websites, Discord bots, pricing, and ideas."
        },
        {
          role: "user",
          content: question
        }
      ],
      temperature: 0.6,
      max_tokens: 400
    });

    const reply = response.choices[0].message.content;

    await message.reply(
      reply.length > 1900 ? reply.slice(0, 1900) + "…" : reply
    );
  } catch (err) {
    console.error("OPENAI ERROR:", err);
    message.reply("⚠️ AI error. Try again later.");
  }
});

/* ================= LOGIN ================= */

client.login(process.env.TOKEN);
