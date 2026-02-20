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
    this.filePath = path.join(process.cwd(), "countingState.json");
    this.state = this.loadState();
    console.log("📂 CountingGame initialized, loaded state:", this.state);
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
      // Initialize state for this guild
      this.state[guild.id] = {
        channelId: channel.id,
        currentNumber: 0,
        lastUserId: "",
      };
      this.saveState();
      console.log("✅ Created new counting channel for guild:", guild.id);
    }

    return channel;
  }

  public async handleMessage(message: Message) {
    if (!message.guild || message.author.bot) return;

    // Ensure guild state exists
    let guildState = this.state[message.guild.id];
    if (!guildState) {
      // If counting game hasn't been initialized yet, ignore
      console.log("⚠️ Counting game not started in this guild");
      return;
    }

    // Ignore messages outside the counting channel
    if (message.channel.id !== guildState.channelId) return;

    const number = parseInt(message.content);

    const isInvalid =
      isNaN(number) ||
      number !== guildState.currentNumber + 1 ||
      message.author.id === guildState.lastUserId;

    if (isInvalid) {
      await message.delete().catch(() => {});
      const member = message.member as GuildMember;
      if (member) {
        member.timeout(30_000, "Broke counting rules").catch(() => {});
      }
      return;
    }

    // ✅ Valid number → update state & save
    guildState.currentNumber = number;
    guildState.lastUserId = message.author.id;
    this.saveState();
  }

  public reset(guildId: string) {
    if (!this.state[guildId]) return;
    this.state[guildId].currentNumber = 0;
    this.state[guildId].lastUserId = "";
    this.saveState();
  }
}
