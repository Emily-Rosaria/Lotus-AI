const mongoose = require("mongoose"); //database library
const config = require('./../../config.json'); // load bot config
const Users = require("./../../database/models/users.js"); // users model
const Discord = require('discord.js'); // Image embed
const { SlashCommandBuilder } = require('@discordjs/builders');

const data = new SlashCommandBuilder()
	.setName("wordcount")
	.setDescription('Rough information about a user\'s wordcount in the roleplay channels.')
  .addUserOption(option => option.setName('user').setDescription('Select a user').setRequired(false))
module.exports = {
    name: 'wordcount', // The name of the command
    description: 'Rough information about a user\'s wordcount in the roleplay channels.', // The description of the command (for help text)
    group: 'roleplay',
    cooldown: 5,
    usage: '[user]', // Help text to explain how to use the command (if it had any arguments)
    async execute(interaction) {
			let user = interaction.options.getUser('user');
			if (!user) {
				user = interaction.user;
			}
			const userID = interaction.guild.members.resolveId(user);
			Users.findById({_id: userID}, function (err, docs) {
		    if (err || !docs) {
		      return interaction.reply({content:"No roleplay data found for this user.",ephemeral: true});
		    }
				interaction.guild.members.fetch(userID).then((u) => {
					const embed = new Discord.MessageEmbed().setThumbnail(u.displayAvatarURL()).setTitle(`${u.displayName}'s Wordcounts'`).setFooter({ text:`${u.user.tag}`}).setTimestamp().displayHexColor(u.displayHexColor).setDescription(`Total Words: \`${docs.totalWords}\`\nCharacter Count: \`${docs.totalChars}\``);
					interaction.reply({embeds: [embed]});
				}).error((e) => {
					const embed = new Discord.MessageEmbed().setTitle('Unknown User\'s Wordcounts').setFooter({ text:`ID: ${userID}`}).setTimestamp().setDescription(`Total Words: \`${docs.totalWords}\`\nCharacter Count: \`${docs.totalChars}\``);
					interaction.reply({embeds: [embed]});
				})
			});
    },
};
