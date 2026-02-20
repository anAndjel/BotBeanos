// src/commands/kick.ts
import type { Command } from "../types/command.js";
import { Message } from "discord.js";

const command: Command = {
  name: "kick",
  execute(message: Message, args: string[]) {
    // 1️⃣ Permission check
    if (!message.member?.permissions.has("KickMembers")) {
      return message.reply("You don't have permission to kick members!");
    }

    // 2️⃣ Target member check
    const member = message.mentions.members?.first();
    if (!member) return message.reply("Mention a member to kick!");

    // 3️⃣ Reason (optional)
    const reasonIndex = args.findIndex(a => !a.startsWith("<@"));
    const reason = reasonIndex !== -1 ? args.slice(reasonIndex + 1).join(" ") : "No reason provided";

    // 4️⃣ Kick action
    member.kick(reason)
      .then(() => {
        message.reply(`${member.user.tag} has been kicked. Reason: ${reason}`);
      })
      .catch(err => {
        console.error(err);
        message.reply("I couldn't kick that member. Check my permissions and role hierarchy.");
      });
  },
};

export default command;

