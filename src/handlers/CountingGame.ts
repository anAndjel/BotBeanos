import fs from "fs";
import path from "path";
import { Guild, TextChannel, Message, GuildMember } from "discord.js";

type GuildState = {
  channelId: string;
  currentNumber: number;
  lastUserId: string;
};

type CountingState = {
  [guildId: string]: GuildState;
};

export class CountingGame {
  private state: CountingState;
  private filePath: string;

  constructor() {
    // Absolute path ensures JSON always writes to workspace root
    this.filePath = path.join(process.cwd(), "countingState.json");
    this.state = this.loadState();
  }

  private loadState(): CountingState {
    if (!fs.existsSync(this.filePath)) return {};
    try {
      const data = fs.readFileSync(this.filePath, "utf8");
      return JSON.parse(data);
    } catch (err) {
      console.error("Failed to load counting state:", err);
      return {};
    }
  }

  private saveState() {
    try {
      fs.writeFileSync(this.filePath, JSON.stringify(this.state, null, 2));
      console.log("✅ Counting state saved:", this.state);
    } catch (err) {
      console.error("Failed to save counting state:", err);
    }
  }

  // Returns the counting channel, creates it if missing
  public async getChannel(guild: Guild): Promise<TextChannel> {
    let guildState = this.state[guild.id];
    let channel: TextChannel | undefined;

    if (guildState) {
      channel = guild.channels.cache.get(guildState.channelId) as TextChannel;
    }

    if (!channel) {
      channel = await guild.channels.create({
        name: "counting",
        type: 0, // GUILD_TEXT
      });
      // Initialize state for new guild
      this.state[guild.id] = {
        channelId: channel.id,
        currentNumber: 0,
        lastUserId: "",
      };
      this.saveState();
    }

    return channel;
  }

  // Main handler for messages
  public async handleMessage(message: Message) {
    if (!message.guild || message.author.bot) return;

    // Ensure guild state exists
    if (!this.state[message.guild.id]) {
      this.state[message.guild.id] = {
        channelId: message.channel.id, // fallback to current channel
        currentNumber: 0,
        lastUserId: "",
      };
      this.saveState();
    }

    const guildState = this.state[message.guild.id];

    if (message.channel.id !== guildState.channelId) return;

    const number = parseInt(message.content);

    // Invalid message conditions
    const isInvalid =
      isNaN(number) || // not a number
      number !== guildState.currentNumber + 1 || // wrong sequence
      message.author.id === guildState.lastUserId; // same user twice

    if (isInvalid) {
      await message.delete().catch(() => {});
      const member = message.member as GuildMember;
      if (member) {
        member.timeout(30_000, "Broke counting rules").catch(() => {});
      }
      return;
    }

    // ✅ Valid message → update state and save JSON
    guildState.currentNumber = number;
    guildState.lastUserId = message.author.id;
    this.saveState();
  }

  // Optional: reset counting game for a guild
  public reset(guildId: string) {
    if (!this.state[guildId]) return;
    this.state[guildId].currentNumber = 0;
    this.state[guildId].lastUserId = "";
    this.saveState();
  }
}
