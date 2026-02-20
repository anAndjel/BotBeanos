import { Message } from "discord.js";
import type { Command } from "../types/command.ts";
import { countingGame } from "../handlers/CountingGame.ts"; // import the singleton

export default (message: Message, commands: Map<string, Command>) => {
  countingGame.handleMessage(message);

  if (!message.content.startsWith("!")) return;

  const args = message.content.slice(1).split(" ");
  const cmdName = args.shift()?.toLowerCase();

  const command = commands.get(cmdName!);
  if (command) command.execute(message, args);
};
