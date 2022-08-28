const mongoose = require("mongoose"); //database library
const config = require('./../../config.json'); // load bot config
const Users = require("./../../database/models/users.js"); // users model
//const Discord = require('discord.js'); // Image embed

const { MessageActionRow, MessageButton, MessageEmbed } = require('discord.js');

const { SlashCommandBuilder } = require('@discordjs/builders');

function getRankNumber(n) {
  if (isNaN(n) || !n || n<1) {
    return "unranked";
  }
  const s = ["th", "st", "nd", "rd"];
  return n + (s[n % 10] || s[0]);
}

const data = new SlashCommandBuilder()
	.setName("topbumps")
	.setDescription('Shows a list of who has bumped the discord server the most via the /bump command.')
	.addIntegerOption(option =>
		option.setName('pagenum')
			.setDescription('The page of the leaderboard to start at.')
			.setRequired(false))
module.exports = {
    name: 'topbumps', // The name of the command
		data: data,
    description: 'Shows a list of who has bumped the discord server the most via the /bump command.', // The description of the command (for help text)
    group: 'util',
    cooldown: 5,
    async execute(interaction) {

			const query = {};
      //get query field
      query["bumps"] = {"$gte":1};
      const data = await Users.find(query).select("bumps").exec();

      if (!data || data.length == 0) {
        return interaction.reply(`No data could be found.`,);
      }

			//map data so we only have what we need, and then sort it
			const leaderboard = data.map(d=>{
				const obj = {};
				obj.count = d.bumps;
				obj.userID = d._id;
				return obj;
			}).sort((a,b)=>b.count-a.count);

			var pages = [];
			const pagecount = Math.ceil(leaderboard.length/10);

			// get an array of "message" text for each leaderboard page
			for (var i = 0; i<pagecount; i++) {
				var page = "";
				let cap = 10;
				if (i+1 == pagecount) {
					cap = leaderboard.length - i*10;
				}
				for (var j = 0; j<cap; j++) {
					const usernum = (i*10)+j+1;
					page = page + "**" + usernum + ".** " + "<@" + leaderboard[(i*10)+j].userID + "> • `" + leaderboard[(i*10)+j].count + "`\n";
				}
				pages.push(page.trim());
			}

			var ranktext = `Your leaderboard rank: ${getRankNumber(-1)}`;

			const userScore = leaderboard.find((e,i)=>{
				if (e.userID == interaction.user.id) {
					ranktext = `Your leaderboard rank: ${getRankNumber(i+1)}`;
					return true;
				}
			});

			// get the guild's data
			var client = interaction.client;
			var guild = await client.guilds.resolve(config.guild);
			if (!guild || !guild.name) {
				guild = {};
				guild.name = client.user.name;
				guild.iconURL = (options) => client.user.displayAvatarURL(options);
			}

			// pagenum is one less than the actual page number, as it's the array index
			const getEmbed = (pagenum) => {
				const embed = new MessageEmbed()
				.setColor('#62c5da')
				.setAuthor({name:`${guild.name}'s Bumping Leaderboard`,iconURL:guild.iconURL({format:"png",size:64,dynamic:true})})
				.setDescription(pages[pagenum]+"\n\n*Note: Your ranking here provides nothing besides a cool factor and the knowledge that you are helping the server grow.*")
				if (pagecount == 1) {
					embed.setFooter({text:`${ranktext}`});
					return embed;
				} else {
					embed.setFooter({text:`Page ${pagenum+1}/${pagecount} • ${ranktext}`});
					return embed;
				}
			}

			// get initial page number, set to 1 unless a valid input is given, if an input is given then shift it within the bounds [1,pagecount].
			var currentPage = interaction.options.getInteger('pagenum') || 1;
			currentPage = Math.max(1,Math.min(currentPage,pagecount));
			// subtract 1 so it matches the array index
			currentPage = currentPage - 1;

			// don't add buttons or anything if there's no other pages
			if (pagecount < 2) {
				interaction.reply({embeds: [getEmbed(currentPage)]});
				return;
			}
			/*
			client.commandCache.set(interaction.id,leaderboard);

			const cacheTimeout = setTimeout(() => {client.commandCache.delete(interaction.id); client.commandCacheTimeouts.delete(interaction.id)}, 1000*300);

			client.commandCacheTimeouts.set(interaction.id,cacheTimeout);
			*/
			const buttonLeft = new MessageButton()
			.setCustomId('topbumpsleft')
			.setLabel('')
			.setStyle('PRIMARY')
      .setEmoji('⬅️')

			const buttonRight = new MessageButton()
			.setCustomId('topbumpsright')
			.setLabel('')
			.setStyle('PRIMARY')
      .setEmoji('➡️')

			if (currentPage == 0) {
				buttonLeft.setDisabled(true);
			}
			if (currentPage+1 == pagecount) {
				buttonRight.setDisabled(true);
			}

			const buttons = new MessageActionRow()
			.addComponents(
				buttonLeft,
				buttonRight
			);
			// post leaderboard embed
			await interaction.reply({embeds: [getEmbed(currentPage)],components: [buttons]});

			const filter = (i) => {
				if (i.user.id == interaction.user.id && i.customId.startsWith('topbumps')) return true //&& i.message.interaction.id == interaction.id
        i.deferUpdate();
        return false;
			};

      const msg = await interaction.fetchReply();

			const collector = msg.createMessageComponentCollector({ filter, componentType: "BUTTON", idle: 30000 });

			const right = async (pg,i) => {
				let newPage =  (((pg+1) % pagecount ) + pagecount ) % pagecount;
				embed = getEmbed(newPage);
        if (newPage == 0) {
          buttonLeft.setDisabled(true);
				} else {
          buttonLeft.setDisabled(false);
        }
				if (newPage+1 == pagecount) {
          buttonRight.setDisabled(true);
				} else {
          buttonRight.setDisabled(false);
        }
				const newButtons = new MessageActionRow()
				.addComponents(
					buttonLeft,
					buttonRight
				);
				await i.update({embeds: [getEmbed(currentPage)],components: [newButtons]});
				return newPage;
			}

			const left = async (pg,i) => {
				let newPage =  (((pg-1) % pagecount ) + pagecount ) % pagecount;
				embed = getEmbed(newPage);
        if (newPage == 0) {
          buttonLeft.setDisabled(true);
				} else {
          buttonLeft.setDisabled(false);
        }
				if (newPage+1 == pagecount) {
          buttonRight.setDisabled(true);
				} else {
          buttonRight.setDisabled(false);
        }
				const newButtons = new MessageActionRow()
				.addComponents(
					buttonLeft,
					buttonRight
				);
				await i.update({embeds: [getEmbed(currentPage)],components: [newButtons]});
				return newPage;
			}

			collector.on('collect', async (i) => {
				if (i.customId.endsWith('left')) {currentPage = await left(currentPage,i)}
				if (i.customId.endsWith('right')) {currentPage = await right(currentPage,i)}
        console.log(currentPage);
				//collector.dispose(i);
			});

			collector.on('end', collected => {
        buttonRight.setDisabled(true)
        buttonLeft.setDisabled(true)
        const noButtons = new MessageActionRow()
				.addComponents(
					buttonLeft,
					buttonRight
				);
				collected.first().message.edit({
		        components: [noButtons]
		  	});
			});
    },
};
