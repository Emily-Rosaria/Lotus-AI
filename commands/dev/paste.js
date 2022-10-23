const Discord = require('discord.js'); // Image embed
const { SlashCommandBuilder } = require('@discordjs/builders');
const fetch = require('node-fetch');

const data = new SlashCommandBuilder()
	.setName("paste")
	.setDescription('Makes the bot say text from pastebin.')
  .addStringOption(option =>
		option.setName('url')
			.setDescription('Link to the pastebin document.')
			.setRequired(true))
	.addChannelOption(option =>
		option.setName('channel')
			.setDescription('The channel to post in')
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
			))
	.addStringOption(option =>
		option.setName('message-id')
			.setDescription('Add a message ID here to edit a message instead.')
			.setRequired(false))

module.exports = {
    name: 'paste', // The name of the command
    data: data,
    description: 'Makes the bot say text from pastebin.', // The description of the command (for help text)
    cooldown: 1,
    usage: '<url> [channel] [ping] [message-id]', // Help text to explain how to use the command (if it had any arguments)
    execute(interaction) {
      const url = interaction.options.getString('url');

			const pastelink = 'https://pastebin.com/raw/' + url.replace(/#/g,'').split('/').slice(-1)[0]

			fetch(pastelink).then(async (t) => {
				const text = await t.text();
				console.log(t);
				console.log(text);
				let channel = interaction.options.getChannel('channel');
				channel = channel ? channel : interaction.channel;
				let cha = interaction.client.channels.resolve(channel);
				if (!cha || cha.type != Discord.ChannelType.GuildText) {
					return interaction.reply({content:`I can only send messages in text channels.`,ephemeral: true});
				}
				let msg = {content: text};
				if (interaction.options.getString('ping')) {
					let ping = interaction.options.getString('ping');
					if (ping == 'none') {
						msg.allowedMentions = { repliedUser: false };
					} else {
						msg.allowedMentions = { parse: ping };
						msg.allowedMentions = { repliedUser: true };
					}
				}
				const messageID = interaction.options.getString('message-id') ? interaction.options.getString('message-id').match(/\d+/g)[0] : "";
				if (messageID) {
					cha.messages.fetch(messageID).then((m => {
						m.edit({content:text}).then(m=>{
							interaction.reply({content:`Message editted!`,ephemeral: true});
						}).catch(e=> {
							interaction.reply({content:`An error occured. Do I have permission to message in that channel?`,ephemeral: true});
						})
					})).catch(e => {
						interaction.reply({content:`An error occured. Are you sure the channel and message ID were correct?`,ephemeral: true});
					})
					return;
				}
				cha.send(msg).then(m => {
					interaction.reply({content:`Message sent!`,ephemeral: true});
				}).catch(e =>{
					interaction.reply({content:`An error occured. Do I have permission to send messages in that channel?`,ephemeral: true});
					console.error(e);
				})
			}).catch((e)=> {
				console.error(e);
				interaction.reply({content:`Couldn't fetch from pastebin!`,ephemeral: true});
			});
    },
};
