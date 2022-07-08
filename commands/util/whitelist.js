/**
 * This class responds to anyone that types r!fix with a fox image.
 *
 */
const Discord = require('discord.js'); // Image embed
const fetch = require('node-fetch'); // This lets me get stuff from webhooks.
const { SlashCommandBuilder } = require('@discordjs/builders');
const oneHour = 60 * 60 * 1000; // one hour in milliseconds

const data = new SlashCommandBuilder()
	.setName("whitelist")
	.setDescription('Whitelist a new account so it doesn\'t get kicked.')
	.addStringOption(option =>
		option.setName('user')
			.setDescription('The id or full usertag of the user to allow.')
			.setRequired(true))

module.exports = {
    name: 'whitelist', // The name of the command
    description: 'Whitelist a new account so it doesn\'t get kicked.', // The description of the command (for help text)
    data: data,
    async execute(interaction) {
				let user = interaction.options.getString('user').trim();
				let id = true;
				const test = user.match(/#/g);
				if (test && test[0]) {
					id = false;
				} else if (isNaN(user)) {
					return interaction.reply({content: `Invalid usertag or ID. Either put in a full ID (e.g. 01234567890123456) or a full tag (e.g. \`newuser#0123\`).`,ephemeral: true});
				}
				interaction.client.automods.set(user,(new Date()).getTime()+oneHour*36);
				setTimeout(() => interaction.client.automods.delete(user), oneHour*36);
				const userStr = id ? `with the ID of ${user}` : `with the tag ${user}`;
        interaction.reply({content: `The user ${userStr} has been whitelisted for the next 36 hours. Note that this will not persist through reboots or crashes.`,ephemeral: true});
    },
};
