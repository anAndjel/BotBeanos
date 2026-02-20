import type { Command } from "../types/command.ts";
import { Message } from "discord.js";
import { CountingGame } from "../handlers/CountingGame.ts";

const countingGame = new CountingGame();

const command: Command = {
  name: "counting",
  execute: async (message: Message, args: string[]) => {
    const channel = await countingGame.getChannel(message.guild!);
    channel.send("Counting game started! Start with 1.");
  }
};

export default command;
