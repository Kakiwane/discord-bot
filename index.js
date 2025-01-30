require('dotenv').config();
const TOKEN = process.env.DISCORD_TOKEN;
const { Client, GatewayIntentBits, SlashCommandBuilder } = require('discord.js');
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages
  ],
});

client.on('ready', async () => {
  console.log(`Logged in as ${client.user.tag}!`);
  
  // Register the slash command
  try {
    await client.application.commands.create({
      name: 'clear',
      description: 'Delete messages in this channel',
      options: [
        {
          name: 'amount',
          type: 4, // INTEGER type
          description: 'Number of messages to delete (1-100)',
          required: true,
        },
      ],
    });
    console.log('Slash command registered!');
  } catch (error) {
    console.error('Failed to register slash command:', error);
  }
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) return;

  if (interaction.commandName === 'clear') {
    const amount = interaction.options.getInteger('amount');

    // Validate input
    if (amount < 1 || amount > 100) {
      return interaction.reply({
        content: 'Enter a number between 1 and 100!',
        ephemeral: true,
      });
    }

    // Check permissions
    if (!interaction.memberPermissions.has('ManageMessages')) {
      return interaction.reply({
        content: 'You need the "Manage Messages" permission!',
        ephemeral: true,
      });
    }

    try {
      await interaction.channel.bulkDelete(amount, true);
      await interaction.reply({
        content: `Deleted ${amount} messages!`,
        ephemeral: true,
      });
    } catch (error) {
      console.error(error);
      interaction.reply({
        content: 'Failed to delete messages (check bot permissions).',
        ephemeral: true,
      });
    }
  }
});

client.on('guildMemberAdd', async (member) => {
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
  

// Replace with your bot token
client.login(TOKEN);