require("dotenv").config();
const { Client, GatewayIntentBits } = require("discord.js");
const OpenAI = require("openai");

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

client.once("ready", () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;
  if (!message.content.startsWith("!ask")) return;

  const question = message.content.replace("!ask", "").trim();
  if (!question) {
    return message.reply("Ask something after `!ask`.");
  }

  try {
    const response = await openai.responses.create({
      model: "gpt-4.1-mini",
      input: question
    });

    const reply = response.output_text || "No response.";
    await message.reply(reply.slice(0, 1900));
  } catch (err) {
    console.error("OPENAI ERROR:", err);
    await message.reply("⚠️ AI error. Check logs.");
  }
});

client.login(process.env.TOKEN);
