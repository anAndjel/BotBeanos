import "dotenv/config";
import { Client, GatewayIntentBits, Message } from "discord.js";
import { loadCommands } from "./handlers/loadCommands.ts";
import messageEvent from "./events/messageCreate.ts";

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});

(async () => {
  const commands = await loadCommands(); // <- MUST await

  console.log("commands loaded:", Array.from(commands.keys())); // debug

  client.once("clientReady", () => {
    console.log(`Logged in as ${client.user?.tag}`);
  });

  client.on("messageCreate", (msg: Message) => {
    //console.log("msg received:", msg.content);
    await countingGame.handleMessage(msg);

    if (!msg.content.startsWith("!")) return;

    const args = msg.content.slice(1).split(" ");
    const cmdName = args.shift()?.toLowerCase();

    const command = commands.get(cmdName!); // Map.get
    if (!command) {
      console.log("no command found for:", cmdName);
      return;
    }

    command.execute(msg, args);
  });

  await client.login(process.env.TOKEN);
})();

