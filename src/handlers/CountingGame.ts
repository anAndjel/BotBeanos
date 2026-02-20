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
    console.log("📂 CountingGame initialized with file:", this.filePath);
    this.state = this.loadState();
    console.log("📝 Loaded state on init:", this.state);
  }

  private loadState(): CountingState {
    if (!fs.existsSync(this.filePath)) {
      console.log("⚠️ JSON file not found, starting with empty state");
      return {};
    }
    try {
      const data = fs.readFileSync(this.filePath, "utf8");
      console.log("📖 JSON loaded:", data);
      return JSON.parse(data);
    } catch (err) {
      console.error("❌ Failed to load counting state:", err);
      return {};
    }
  }

  private saveState() {
    try {
      fs.writeFileSync(this.filePath, JSON.stringify(this.state, null, 2));
      console.log("✅ Counting state saved:", this.state);
    } catch (err) {
      console.error("❌ Failed to save counting state:", err);
    }
  }

  public async getChannel(guild: Guild): Promise<TextChannel> {
    let guildState = this.state[guild.id];
    let channel: TextChannel | undefined;

    if (guildState) {
      channel = guild.channels.cache.get(guildState.channelId) as TextChannel;
      console.log("🔍 Found existing channel in cache:", channel?.id);
    }

    if (!channel) {
      console.log("➕ Creating new counting channel for guild:", guild.id);
      channel = await guild.channels.create({
        name: "counting",
        type: 0,
      });
      this.state[guild.id] = {
        channelId: channel.id,
        currentNumber: 0,
        lastUserId: "",
      };
      this.saveState();
      console.log("✅ New guild state initialized:", this.state[guild.id]);
    }

    return channel;
  }

  public async handleMessage(message: Message) {
    if (!message.guild || message.author.bot) {
      console.log("⛔ Ignored message from bot or missing guild");
      return;
    }

    if (!this.state[message.guild.id]) {
      console.log("⚠️ No state for guild, initializing with channel:", message.channel.id);
      this.state[message.guild.id] = {
        channelId: message.channel.id,
        currentNumber: 0,
        lastUserId: "",
      };
      this.saveState();
    }

    const guildState = this.state[message.guild.id];
    console.log("💬 Message received:", message.content, "Guild state before:", guildState);

    if (message.channel.id !== guildState.channelId) {
      console.log("⏭ Message ignored, not in counting channel:", message.channel.id);
      return;
    }

    const number = parseInt(message.content);
    const isInvalid =
      isNaN(number) ||
      number !== guildState.currentNumber + 1 ||
      message.author.id === guildState.lastUserId;

    if (isInvalid) {
      console.log("❌ Invalid message:", message.content);
      await message.delete().catch(() => {});
      const member = message.member as GuildMember;
      if (member) {
        member.timeout(30_000, "Broke counting rules").catch(() => {});
        console.log("⏱ Timed out user:", member.id);
      }
      return;
    }

    // Valid message → update state
    guildState.currentNumber = number;
    guildState.lastUserId = message.author.id;
    console.log("✅ Valid number, updating state:", guildState);
    this.saveState();
  }

  public reset(guildId: string) {
    if (!this.state[guildId]) {
      console.log("⚠️ Cannot reset, guild state not found:", guildId);
      return;
    }
    this.state[guildId].currentNumber = 0;
    this.state[guildId].lastUserId = "";
    console.log("🔄 Guild state reset:", this.state[guildId]);
    this.saveState();
  }
}
