/**
 * This class responds to anyone that types r!dog with a dog image.
 *
 */
const Discord = require('discord.js'); // Image embed
const fetch = require('node-fetch'); // This lets me get stuff from api.
const { SlashCommandBuilder } = require('@discordjs/builders');

const data = new SlashCommandBuilder()
	.setName("dog")
	.setDescription('Get random dog pics!')

module.exports = {
    name: 'dog', // The name of the command
    cooldown: 5,
    description: 'Get random dog pics!', // The description of the command (for help text)
    data: data,
    async execute(interaction) {

      // Get dog from the api.
      const fetched = await fetch('https://dog.ceo/api/breeds/image/random').then(response => response.json());
      var url = false;
      if (fetched.status && fetched.status == "success") {
        url = fetched.message;
      }
      if (url) {
        const embed = new Discord.MessageEmbed().setImage(url).setTitle('Woof').setFooter({ text:'Source: dog.ceo/api'}).setTimestamp();
        interaction.reply({embeds: [embed]}); // Replies to the user with a random dog
      } else {
        interaction.reply({content:"I'm having trouble fetching images from the `dog.ceo` API right now. Try again in a moment.",ephemeral: true});
      }
    },
};
