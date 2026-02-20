import { Message } from "discord.js";
import type { Command } from "../types/command.ts";
import { CountingGame } from "../handlers/CountingGame.ts";

const countingGame = new CountingGame();

const command: Command = {
  name: "counting",
  execute: async (message: Message, args: string[]) => {
    if (!message.guild) return;

    const subcommand = args[0]?.toLowerCase();

    if (subcommand === "start") {
      const channel = await countingGame.getChannel(message.guild);
      channel.send("Counting game started! Start with 1.");
    } else if (subcommand === "reset") {
      countingGame.reset(message.guild.id);
      message.channel.send("Counting game reset!");
    }
  },
};

export default command;
