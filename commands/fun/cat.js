/**
 * This class responds to anyone that types r!cat with a cat image.
 *
 */
const Discord = require('discord.js'); // Image embed
const fetch = require('node-fetch'); // This lets me get stuff from api.
const { SlashCommandBuilder } = require('@discordjs/builders');

const data = new SlashCommandBuilder()
	.setName("cat")
	.setDescription('Get random cat pics!')

module.exports = {
    name: 'cat', // The name of the command
    cooldown: 5,
    description: 'Get random cat pics!', // The description of the command (for help text)
    data: data,
    async execute(interaction) {
        // Get cat from the random.cat api.
        const { file } = await fetch('https://aws.random.cat/meow').then(response => response.json());
        const embed = new Discord.MessageEmbed().setImage(file).setTitle('Cat').setFooter({ text:'Source: aws.random.cat'}).setTimestamp();
        interaction.reply({embeds: [embed]}); // Replies to the user with a random cat
    },
};
