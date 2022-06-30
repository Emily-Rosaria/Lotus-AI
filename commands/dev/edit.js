const Discord = require('discord.js'); // Image embed
const { SlashCommandBuilder } = require('@discordjs/builders');

const data = new SlashCommandBuilder()
	.setName("edit")
	.setDescription('Edits one of the bot\'s messages!')
  .addStringOption(option =>
		option.setName('new-message')
			.setDescription('The new message text')
			.setRequired(true))
	.addStringOption(option =>
		option.setName('message-id')
			.setDescription('The ID of the message you wish to edit')
			.setRequired(true))
	.addChannelOption(option =>
		option.setName('channel')
			.setDescription('The channel the message is in')
			.setRequired(false))


module.exports = {
    name: 'edit', // The name of the command
    data: data,
    description: 'Edits one of the bot\'s messages!', // The description of the command (for help text)
    cooldown: 3,
    usage: '<new-message> <messageID> [channel]', // Help text to explain how to use the command (if it had any arguments)
    execute(interaction) {
      const message = interaction.options.getString('new-message');
			let channel = interaction.options.getChannel('channel');
			const messageID = interaction.options.getString('message-id').match(/\d+/g)[0];
			channel = channel ? channel : interaction.channel;
			let cha = interaction.client.channels.resolve(channel);
			if (!cha || !cha.isText) {
				return interaction.reply({content:`I can only send messages in text channels.`,ephemeral: true});
			}
			cha.messages.fetch(messageID).then((m => {
				m.edit({content:message}).then(m=>{
					interaction.reply({content:`Message editted!`,ephemeral: true});
				}).catch(e=> {
					interaction.reply({content:`An error occured. Do I have permission to message in that channel?`,ephemeral: true});
				})
			})).catch(e => {
				interaction.reply({content:`An error occured. Are you sure the channel and message ID were correct?`,ephemeral: true});
			})
    },
};
