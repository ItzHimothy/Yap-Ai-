require("dotenv").config();

const {
  Client,
  GatewayIntentBits,
  EmbedBuilder
} = require("discord.js");

const OpenAI = require("openai");

/* ================= CONFIG ================= */

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

// Cooldown map (userId -> timestamp)
const cooldown = new Map();
const COOLDOWN_TIME = 10 * 1000; // 10 seconds

/* ================= READY ================= */

client.once("ready", () => {
  console.log(`🤖 AI Bot online as ${client.user.tag}`);
});

/* ================= MESSAGE HANDLER ================= */

client.on("messageCreate", async (message) => {
  try {
    // Ignore bots
    if (message.author.bot) return;

    // OPTIONAL: require bot mention
    if (!message.mentions.has(client.user)) return;

    // Cooldown check
    const now = Date.now();
    const lastUsed = cooldown.get(message.author.id) || 0;
    if (now - lastUsed < COOLDOWN_TIME) {
      return message.reply("⏳ Please wait a few seconds before asking again.");
    }
    cooldown.set(message.author.id, now);

    // Remove bot mention from message
    const userMessage = message.content
      .replace(`<@${client.user.id}>`, "")
      .replace(`<@!${client.user.id}>`, "")
      .trim();

    if (!userMessage) {
      return message.reply("❓ Ask me something.");
    }

    // Thinking indicator
    await message.channel.sendTyping();

    // OpenAI request
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a helpful AI assistant for a Discord server called Yap Sites. Be friendly, clear, and concise."
        },
        {
          role: "user",
          content: userMessage
        }
      ]
    });

    const reply =
      response.choices[0]?.message?.content ||
      "⚠️ I couldn’t generate a response.";

    // Embed reply
    const embed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setAuthor({
        name: message.author.username,
        iconURL: message.author.displayAvatarURL({ dynamic: true })
      })
      .setDescription(reply)
      .setFooter({ text: "Yap Sites AI Assistant" })
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  } catch (err) {
    console.error(err);
    message.reply("❌ Something went wrong. Try again later.");
  }
});

/* ================= LOGIN ================= */

client.login(process.env.TOKEN);
