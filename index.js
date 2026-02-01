require("dotenv").config();
const { Client, GatewayIntentBits } = require("discord.js");
const OpenAI = require("openai");

// ===== CONFIG =====
const PREFIX = "!ask";

// ===== CLIENT =====
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent // ⚠️ MUST be enabled in Dev Portal
  ]
});

// ===== OPENAI =====
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// ===== READY =====
client.once("ready", () => {
  console.log(`🤖 Yap-AI logged in as ${client.user.tag}`);
});

// ===== MESSAGE HANDLER =====
client.on("messageCreate", async (message) => {
  if (message.author.bot) return;
  if (!message.content.startsWith(PREFIX)) return;

  const question = message.content.slice(PREFIX.length).trim();
  if (!question) {
    return message.reply("❓ Ask me something after `!ask`");
  }

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are Yap-AI, a helpful AI assistant for a Discord server. Keep replies clear and friendly."
        },
        {
          role: "user",
          content: question
        }
      ],
      max_tokens: 400,
      temperature: 0.6
    });

    const reply = response.choices[0].message.content;

    await message.reply(
      reply.length > 1900 ? reply.slice(0, 1900) + "…" : reply
    );
  } catch (err) {
    console.error("AI Error:", err);
    message.reply("⚠️ AI error. Try again later.");
  }
});

// ===== LOGIN =====
client.login(process.env.TOKEN);
