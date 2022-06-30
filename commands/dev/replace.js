const Discord = require('discord.js'); // Image embed
const { SlashCommandBuilder } = require('@discordjs/builders');

const data = new SlashCommandBuilder()
	.setName("replace")
	.setDescription('Edits a bot message to replace part of it.')
	.addStringOption(option =>
		option.setName('old-text')
			.setDescription('The text you want to edit.')
			.setRequired(true))
  .addStringOption(option =>
		option.setName('new-text')
			.setDescription('The new text. Use \\n for line breaks.')
			.setRequired(true))
	.addStringOption(option =>
		option.setName('message-id')
			.setDescription('The ID of the message you wish to edit')
			.setRequired(true))
	.addChannelOption(option =>
		option.setName('channel')
			.setDescription('The channel the message is in')
			.setRequired(false))
	.addBooleanOption(option =>
		option.setName('regex')
			.setDescription('Whether or not to use a regex query.')
			.setRequired(false))

module.exports = {
    name: 'replace', // The name of the command
    data: data,
    description: 'Edits a bot message to replace part of it.', // The description of the command (for help text)
    cooldown: 3,
    usage: '<old-text> <new-text> <message-id> [channel]', // Help text to explain how to use the command (if it had any arguments)
    execute(interaction) {
      let find = interaction.options.getString('old-text');
			if (interaction.options.getBoolean('regex')) {
				find = new RegExp(find,'i');
			}
			const replace = interaction.options.getString('new-text');
			let channel = interaction.options.getChannel('channel');
			const messageID = interaction.options.getString('message-id').match(/\d+/g)[0];
			channel = channel ? channel : interaction.channel;
			let cha = interaction.client.channels.resolve(channel);
			if (!cha || !cha.isText) {
				return interaction.reply({content:`I can only send messages in text channels.`,ephemeral: true});
			}
			cha.messages.fetch(messageID).then((m => {
				let oldContent = m.content;
				let newContent = m.replace(find,replace);
				m.edit({content:newContent}).then(m=>{
					interaction.reply({content:`Message editted!`,ephemeral: true});
				}).catch(e=> {
					interaction.reply({content:`An error occured. Do I have permission to message in that channel?`,ephemeral: true});
				})
			})).catch(e => {
				interaction.reply({content:`An error occured. Are you sure the channel and message ID were correct?`,ephemeral: true});
			})
    },
};
