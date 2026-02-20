import fs from "fs";
import { Guild, TextChannel, Message } from "discord.js";

const STATE_FILE = "./countingState.json";

interface GameState {
  channelId: string;
  currentNumber: number;
  lastUserId: string;
}

export class CountingGame {
  private state: Record<string, GameState>;

  constructor() {
    // Load JSON into memory
    this.state = JSON.parse(fs.readFileSync(STATE_FILE, "utf8"));
  }

  // Save memory back to JSON
  private save() {
    fs.writeFileSync(STATE_FILE, JSON.stringify(this.state, null, 2));
  }

  // Get or create the counting channel
  public async getChannel(guild: Guild): Promise<TextChannel> {
    let game = this.state.guilds[guild.id];
    
    if (game) {
      return guild.channels.cache.get(game.channelId) as TextChannel;
    } else {
      // Create new channel
      const channel = await guild.channels.create({
        name: "counting",
        type: 0 // GUILD_TEXT
      });
      this.state.guilds[guild.id] = {
        channelId: channel.id,
        currentNumber: 0,
        lastUserId: ""
      };
      this.save();
      return channel;
    }
  }

  // Handle incoming message in counting channel
  public async handleMessage(message: Message) {
    if (!message.guild) return;
    const guildId = message.guild.id;
    const game = this.state.guilds[guildId];
    if (!game) return;

    // Ignore bot messages
    if (message.author.bot) return;

    const expected = game.currentNumber + 1;
    const number = parseInt(message.content);

    if (number === expected && message.author.id !== game.lastUserId) {
      game.currentNumber++;
      game.lastUserId = message.author.id;
      this.save();
      // optionally react or confirm
    } else {
      game.currentNumber = 0;
      game.lastUserId = "";
      this.save();
      message.channel.send("Wrong number! Counting reset to 0.");
    }
  }
}
