const Discord = require('discord.js'); // Image embed
const fetch = require('node-fetch'); // This lets me get stuff from api.
const { SlashCommandBuilder } = require('@discordjs/builders');

const data = new SlashCommandBuilder()
	.setName("setstatus")
	.setDescription('Sets the bot\'s game status!')
  .addStringOption(option =>
		option.setName('status')
			.setDescription('The new bot status.')
			.setRequired(false))

module.exports = {
    name: 'setstatus', // The name of the command
    data: data,
    description: 'Sets the bot\'s game status!', // The description of the command (for help text)
    cooldown: 10,
    usage: '[status]', // Help text to explain how to use the command (if it had any arguments)
    execute(interaction) {
      var status = { status: 'online' };
      var args = interaction.options.getString('status').trim();
      let gameName;
      if (args && args.length > 0) {
        const gameName = args.length > 31 ? args.slice(0,30) + '...' : args;
        status.activities = [{ type: 'PLAYING', name: gameName }];
      }
      interaction.client.user.setPresence(status);
      if (gameName && gameName.length > 0) {
        return interaction.reply({content:`Done! ${interaction.client.user.username}'s status has been set to \`${gameName}\`.'`,ephemeral: true});
      }
      return interaction.reply({content:`Done! ${interaction.client.user.username}'s status has been reset.`,ephemeral: true});
    },
};
