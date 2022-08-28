const mongoose = require("mongoose"); //database library
const config = require('./../../config.json'); // load bot config
const Users = require("./../../database/models/users.js"); // users model
const Discord = require('discord.js'); // Image embed
const { SlashCommandBuilder } = require('@discordjs/builders');

const data = new SlashCommandBuilder()
	.setName("dbumpcount")
	.setDescription('Displays how many times a user has bumped the server on disboard via the /bump command.')
  .addUserOption(option => option.setName('user').setDescription('Select a user').setRequired(false))
module.exports = {
    name: 'dbumpcount', // The name of the command
		data: data,
    description: 'Displays how many times a user has bumped the server on disboard via the /bump command.', // The description of the command (for help text)
    group: 'util',
    cooldown: 5,
    async execute(interaction) {
			Users.findById({_id: userID}, function (err, docs) {
		    if (err || !docs) {
		      return interaction.reply({content:"No data found for this user.",ephemeral: true});
		    }
				interaction.guild.members.fetch(userID).then((u) => {
					const embed = new Discord.MessageEmbed().setThumbnail(u.displayAvatarURL()).setTitle(`${u.displayName}'s Bump Count`).setFooter({ text:`${u.user.tag}`}).setTimestamp().setColor(u.displayHexColor).setDescription(`Total Bumps: \`${docs.bumps}\``);
					interaction.reply({embeds: [embed]});
				}).catch((e) => {
					console.error(e);
					const embed = new Discord.MessageEmbed().setTitle('Unknown User\'s Bump Count').setFooter({ text:`ID: ${userID}`}).setTimestamp().setDescription(`Total Bumps: \`${docs.bumps}\``);
					interaction.reply({embeds: [embed]});
				})
			});
    },
};
