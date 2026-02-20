import type { Command } from "../types/command.ts";

const command: Command = {
  name: "nig",
  execute(message: Message, args: string[]) {
    message.reply("ger");
  }
};

export default command;

