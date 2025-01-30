const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('members')
        .setDescription('Show server member statistics')
        .setDMPermission(false),
    async execute(interaction) {
        await interaction.deferReply();
        
        const guild = interaction.guild;
        await guild.members.fetch(); // Ensure cache is updated
        
        // Get member statistics
        const totalMembers = guild.memberCount;
        const onlineMembers = guild.members.cache.filter(m => m.presence?.status === 'online').size;
        const bots = guild.members.cache.filter(m => m.user.bot).size;
        const humans = totalMembers - bots;

        // Create embed
        const embed = new EmbedBuilder()
            .setColor('#2b2d31')
            .setTitle(`📊 ${guild.name} Member Statistics`)
            .setThumbnail(guild.iconURL())
            .addFields(
                { name: 'Total Members', value: `${totalMembers}`, inline: true },
                { name: '👥 Humans', value: `${humans}`, inline: true },
                { name: '🤖 Bots', value: `${bots}`, inline: true },
                { name: '🟢 Online', value: `${onlineMembers}`, inline: true },
                { name: '📅 Created', value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:D>`, inline: true },
                { name: '👑 Owner', value: `<@${guild.ownerId}>`, inline: true }
            )
            .setFooter({ text: 'Server Information' })
            .setTimestamp();

        await interaction.editReply({ embeds: [embed] });
    },
    category: 'Information'
};