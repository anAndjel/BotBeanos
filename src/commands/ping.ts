import type { Command } from "../types/command.ts";

const command: Command = {
  name: "ping",
  execute(message: Message, args: string[]) {
    message.reply("pong");
  }
};

export default command;

