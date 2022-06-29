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
    execute(message) {
      var status = { status: 'online' };
      var args = message.options.getString('status').trim();
      if (args && args.length > 0) {
        const gameName = args.length > 31 ? args.slice(0,30) + '...' : args;
        status.activity = { type: 'PLAYING', name: gameName };
      }
      message.client.user.setPresence(status);
      if (gameName && gameName.length > 0) {
        return interaction.reply({content:`Done! ${client.user.username}'s status has been set to \`${gameName}\`.'`,ephemeral: true});
      }
      return interaction.reply({content:`Done! ${client.user.username}'s status has been reset.`,ephemeral: true});
    },
};
