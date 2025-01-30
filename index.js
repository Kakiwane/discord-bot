require('dotenv').config();
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const fs = require('fs');
const path = require('path');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages
  ],
});

// Command Handling
client.commands = new Collection();

const commandsPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(commandsPath);

for (const folder of commandFolders) {
  const folderPath = path.join(commandsPath, folder);
  const commandFiles = fs.readdirSync(folderPath).filter(file => file.endsWith('.js'));
  
  for (const file of commandFiles) {
    const filePath = path.join(folderPath, file);
    const command = require(filePath);
    
    if ('data' in command && 'execute' in command) {
      client.commands.set(command.data.name, command);
    } else {
      console.log(`⚠️ Command at ${filePath} is missing required "data" or "execute" property`);
    }
  }
}

// Events
client.on('ready', () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    await interaction.reply({
      content: '❌ An error occurred while executing this command!',
      ephemeral: true
    });
  }
});

// Welcome Messages
client.on('guildMemberAdd', async member => {
  try {
    const welcomeDM = `👋 Welcome ${member} to ${member.guild.name}!\n\n` +
      "Please read our rules and enjoy your stay!\n" +
      "Need help? Contact our mod team.";

    await member.send(welcomeDM);
    console.log(`📩 Sent DM to ${member.user.tag}`);
  } catch (error) {
    console.error(`❌ Failed to DM ${member.user.tag}:`, error.message);
  }
});

client.login(process.env.DISCORD_TOKEN);