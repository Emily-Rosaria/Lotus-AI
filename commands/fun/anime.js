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
    execute(message) {
        // Get image from the api.

        const tags = [message.options.getString('tag1'),message.options.getString('tag2'),message.options.getString('tag3'),message.options.getString('tag4'),message.options.getString('tag5')].filter(t => t).map(t => t.toLowerCase().replace(/ +/g,"_"))

        Booru.search('safebooru', tags, { limit: 1, random: true }).then(image =>{
          const embed = new Discord.MessageEmbed()
          .setColor('#2e51a2')
          .setImage(image[0].fileUrl)
          .setFooter({ text:'Image from safebooru: '+tags.join(', ')})
          .setTimestamp()
          return message.reply({embeds: [embed]});
        })
        .catch(error => {
          return message.reply({content:"Unable to fetch an image. Most likely, your search yielded no results or there was a connection error. Try again in a few minutes.",ephemeral: true});
        });
    },
}
