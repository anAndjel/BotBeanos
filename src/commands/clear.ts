import type { Command } from "../types/command.ts";
import { Message } from "discord.js";

const command: Command = {
  name: "clear",
  execute(message: Message, args: string[]) {
    if (!message.member?.permissions.has("ManageMessages")) {
      return message.reply("You don't have permission to do that!");
    }

    const channel = message.channel;

    if (channel.isTextBased() && channel.guild) {
      channel.clone().then(clone => {
        channel.delete();
        clone.send("Channel cleared!").then(msg => {
          setTimeout(() => msg.delete(), 1500);
        });
      });
    }
  },
};


export default command;
