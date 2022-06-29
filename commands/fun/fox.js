/**
 * This class responds to anyone that types r!fix with a fox image.
 *
 */
const Discord = require('discord.js'); // Image embed
const fetch = require('node-fetch'); // This lets me get stuff from webhooks.
const { SlashCommandBuilder } = require('@discordjs/builders');

const data = new SlashCommandBuilder()
	.setName("fox")
	.setDescription('Get random fox pics!')
  .setDefaultMemberPermissions(3072) // read messages & send messages perms

module.exports = {
    name: 'fox', // The name of the command
    description: 'Get random fox pics!', // The description of the command (for help text)
    data: data,
    async execute(message) {

        // Get fox from the api.
        const { image } = await fetch('https://randomfox.ca/floof/').then(response => response.json());
        const embed = new Discord.MessageEmbed().setImage(image).setTitle('Fox').setFooter({ text:'Source: randomfox.ca'}).setTimestamp();
        message.reply({embeds: [embed]}); // Replies to the user with a random fox
    },
};
