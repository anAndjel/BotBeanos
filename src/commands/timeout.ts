import type { Command } from "../types/command.js";
import { Message } from "discord.js";

const command: Command = {
  name: "timeout",
  execute(message: Message, args: string[]) {
    if (!message.member?.permissions.has("ModerateMembers")) {
      return message.reply("You don't have permission to timeout members!");
    }

    // Grab the first mentioned member
    const member = message.mentions.members?.first();
    if (!member) return message.reply("Mention a member to timeout!");

    // Filter out mention(s) from args and find the first number
    const durationArg = args
      .filter(a => !a.startsWith("<@") && !isNaN(parseInt(a)))
      .shift();

    const duration = durationArg ? parseInt(durationArg) : 0;

    if (!duration || duration <= 0 || duration > 1440) {
      return message.reply("Specify a valid timeout duration in minutes (1–1440).");
    }

    const reasonIndex = args.indexOf(durationArg!) + 1;
    const reason = args.slice(reasonIndex).join(" ") || "No reason provided";

    member.timeout(duration * 60 * 1000, reason)
      .then(() => message.reply(`${member.user.tag} has been timed out for ${duration} minute(s). Reason: ${reason}`))
      .catch(err => {
        console.error(err);
        message.reply("I couldn't timeout that member. Check my permissions and role hierarchy.");
      });
  },
};

export default command;

