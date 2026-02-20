// src/commands/ban.ts
import type { Command } from "../types/command.js";
import { Message } from "discord.js";

const command: Command = {
  name: "ban",
  execute(message: Message, args: string[]) {
    // 1️⃣ Permission check
    if (!message.member?.permissions.has("BanMembers")) {
      return message.reply("You don't have permission to ban members!");
    }

    // 2️⃣ Target member check
    const member = message.mentions.members?.first();
    if (!member) return message.reply("You need to mention a member to ban!");

    // 3️⃣ Ban reason (optional)
    const reason = args.slice(1).join(" ") || "No reason provided";

    // 4️⃣ Ban action
    member.ban({ reason })
      .then(() => message.reply(`${member.user.tag} was banned. Reason: ${reason}`))
      .catch(err => {
        console.error(err);
        message.reply("I couldn't ban that member. Do I have the right permissions?");
      });
  },
};

export default command;

