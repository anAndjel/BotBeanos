import "dotenv/config";
import { Client, GatewayIntentBits, Message } from "discord.js";
import { loadCommands } from "./handlers/loadCommands.ts";
import messageEvent from "./events/messageCreate.ts";

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});

(async () => {
  const commands = await loadCommands();

  console.log("commands loaded:", Array.from(commands.keys()));

  client.once("clientReady", () => {
    console.log(`Logged in as ${client.user?.tag}`);
  });

  client.on("messageCreate", (msg: Message) => {
    messageEvent(msg, commands); // pass messages to your centralized handler
  });

  await client.login(process.env.TOKEN);
})();
