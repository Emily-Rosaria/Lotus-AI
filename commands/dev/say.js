const Discord = require('discord.js'); // Image embed
const { SlashCommandBuilder } = require('@discordjs/builders');

const data = new SlashCommandBuilder()
	.setName("say")
	.setDescription('Makes the bot say something!')
  .addStringOption(option =>
		option.setName('message')
			.setDescription('The message to say')
			.setRequired(true))
	.addChannelOption(option =>
		option.setName('channel')
			.setDescription('The channel to post in')
			.setRequired(false))
	.addStringOption(option =>
		option.setName('reply')
			.setDescription('The ID of a message you wish to reply to. Must be in the same channel as the message sent.')
			.setRequired(false))
	.addStringOption(option =>
		option.setName('ping')
			.setDescription('Who can be pinged by the message.')
			.setRequired(false)
			.addChoices(
				{ name: 'none', value: 'none' },
				{ name: 'users', value: 'users' },
				{ name: 'roles', value: 'roles' },
				{ name: 'everyone', value: 'everyone' },
			));

module.exports = {
    name: 'say', // The name of the command
    data: data,
    description: 'Makes the bot say something!', // The description of the command (for help text)
    cooldown: 1,
    usage: '<message> [channel] [reply] [ping]', // Help text to explain how to use the command (if it had any arguments)
    execute(interaction) {
      const message = interaction.options.getString('message');
			let channel = interaction.options.getChannel('channel');
			channel = channel ? channel : interaction.channel;
			let cha = interaction.client.channels.resolve(channel);
			if (!cha || !cha.isText) {
				return interaction.reply({content:`I can only send messages in text channels.`,ephemeral: true});
			}
			let msg = {content: message};
			if (interaction.options.getString('reply')) {
				msg.reply = {};
				msg.reply.messageReference = ""+interaction.options.getString('reply').match(/\d+/g)[0];
				msg.reply.failIfNotExists = false;
			}
			if (interaction.options.getString('ping')) {
				let ping = interaction.options.getString('ping');
				if (ping == 'none') {
					msg.allowedMentions = { repliedUser: false };
				} else {
					msg.allowedMentions = { parse: ping };
					msg.allowedMentions = { repliedUser: true };
				}
			}
			cha.send(msg).then(m => {
				interaction.reply({content:`Message sent!`,ephemeral: true});
			}).catch(e =>{
				interaction.reply({content:`An error occured. Do I have permission to send messages in that channel?`,ephemeral: true});
			})
    },
};
