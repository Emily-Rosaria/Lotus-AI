const mongoose = require("mongoose"); //database library
const config = require('./../../config.json'); // load bot config
const Users = require("./../../database/models/users.js"); // users model
const Discord = require('discord.js'); // Image embed
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
				const embed = new Discord.MessageEmbed()
				.setColor('#62c5da')
				.setAuthor(`${guild.name}'s Bumping Leaderboard`,guild.iconURL({format:"png",size:64,dynamic:true}))
				.setDescription(pages[pagenum]+"\n\n*Note: Your ranking here provides nothing besides a cool factor and the knowledge that you are helping the server grow.*")
				if (pagecount == 1) {
					embed.setFooter(`${ranktext}`);
					return embed;
				} else {
					embed.setFooter(`Page ${pagenum+1}/${pagecount} • ${ranktext}`);
					return embed;
				}
			}

			// get initial page number, set to 1 unless a valid input is given, if an input is given then shift it within the bounds [1,pagecount].
			var currentPage = args.length > 1 && !isNaN(args[1]) ? Math.floor(args[1]) : 1;
			currentPage = Math.max(1,Math.min(currentPage,pagecount));

			// subtract 1 so it matches the array index
			currentPage = currentPage - 1;

			// post leaderboard embed
			var msg = await interaction.reply({embeds: [getEmbed(currentPage)]});

			// don't add reacts or anything if there's no other pages
			if (pagecount < 2) {
				return;
			}

			await msg.react('⬅️').then(()=>msg.react('➡️')).catch(()=>msg.reply("Failed to post the full leaderboard. Do I have permission to add reactions and post embeds in this channel?"));

			let cooldown = 0;

			const filter = (r, u) => {
				if (!(['⬅️', '➡️'].includes(r.emoji.name) && u.id === interaction.user.id)) {return false}
				if (cooldown + 400 > (new Date()).getTime()) {return false}
				if (r.message.id != msg.id) {return false;}
				cooldown = (new Date()).getTime();
				return true;
			};

			const collector = msg.createReactionCollector({filter, idle: 300000, dispose: true });

			const right = async (pg) => {
				let newPage =  (((pg+1) % pagecount ) + pagecount ) % pagecount;
				embed = getEmbed(newPage);
				msg.edit({embeds: [embed]});
				return newPage;
			}

			const left = async (pg) => {
				let newPage =  (((pg-1) % pagecount ) + pagecount ) % pagecount;
				embed = getEmbed(newPage);
				msg.edit({embeds: [embed]});
				return newPage;
			}

			collector.on('collect', async (r, u) => {
				if (['⬅️'].includes(r.emoji.name)) {currentPage = await left(currentPage)}
				if (['➡️'].includes(r.emoji.name)) {currentPage = await right(currentPage)}
			});

			collector.on('remove', async (r) => {
				if (['⬅️'].includes(r.emoji.name)) {currentPage = await left(currentPage)}
				if (['➡️'].includes(r.emoji.name)) {currentPage = await right(currentPage)}
			});
    },
};
