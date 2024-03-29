/**
 * This class responds to anyone that types r!anime with an anime image.
 *
 */
const Discord = require('discord.js'); // Image embed
const Booru = require('booru'); // This lets me get stuff from weeb sites.
const { SlashCommandBuilder } = require('@discordjs/builders');

const data = new SlashCommandBuilder()
	.setName("anime")
	.setDescription('Get random anime pics from safebooru!')
  .addStringOption(option =>
		option.setName('tag1')
			.setDescription('The first image tag to look for.')
			.setRequired(false))
  .addStringOption(option =>
		option.setName('tag2')
			.setDescription('The second image tag to look for.')
			.setRequired(false))
  .addStringOption(option =>
		option.setName('tag3')
			.setDescription('The third image tag to look for.')
			.setRequired(false))
  .addStringOption(option =>
		option.setName('tag4')
			.setDescription('The fourth image tag to look for.')
			.setRequired(false))
  .addStringOption(option =>
    option.setName('tag5')
      .setDescription('The fifth image tag to look for.')
      .setRequired(false))

module.exports = {
    name: 'anime', // The name of the command
    data: data,
    cooldown: 5,
    description: 'Get random anime pics from safebooru!', // The description of the command (for help text)
    execute(interaction) {
        // Get image from the api.

        const tags = [interaction.options.getString('tag1'),interaction.options.getString('tag2'),interaction.options.getString('tag3'),interaction.options.getString('tag4'),interaction.options.getString('tag5')].filter(t => t).map(t => t.toLowerCase().replace(/ +/g,"_"))

        Booru.search('safebooru', tags, { limit: 1, random: true }).then(image =>{
          const embed = new Discord.EmbedBuilder()
          .setColor('#2e51a2')
          .setImage(image[0].fileUrl)
          .setFooter({ text:'Image from safebooru: '+tags.join(', ')})
          .setTimestamp()
          return interaction.reply({embeds: [embed]});
        })
        .catch(error => {
          return interaction.reply({content:"Unable to fetch an image. Most likely, your search yielded no results or there was a connection error. Try again in a few minutes.",ephemeral: true});
        });
    },
}
