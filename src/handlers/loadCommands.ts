import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import type { Command } from "../types/command.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function loadCommands(): Promise<Map<string, Command>> {
  const commands = new Map<string, Command>();
  const commandFiles = fs.readdirSync(path.join(__dirname, "../commands"));

  for (const file of commandFiles) {
    if (!file.endsWith(".ts")) continue;

    const module = await import(`../commands/${file}`);
    const cmd: Command = module.default;
    commands.set(cmd.name, cmd);
  }

  return commands;
}


