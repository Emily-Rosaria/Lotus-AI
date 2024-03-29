/**
 * Runs the help command, explaining each available command to the user.
 */

module.exports = {
    name: 'help',
    description: 'List all available commands, or info about a specific command.',
    aliases: ['commands','info'],
    perms: 'dev', //no user-based restrictions
    usage: '<command name>',
    cooldown: 5,
    allowDM: true,
    async execute(message, args) {
        let gID = "dm";
        const config = require('./../../config.json');
        const prefix = config.prefix[0];
        const { commands } = message.client;
        data = [];
        // Send help data about ALL commands
        if(!args.length) {
            data.push('Here\'s a list of all my commands:');
            data.push(commands.filter(command=>!command.perms || command.perms != "dev").map(command => command.name).join(', '));
            data.push(`\nYou can send \`${prefix}help [command name]\` to get info on a specific command!`);

            return message.author.send(data, { split: true })
                .then(() => {
                    if (message.channel.type === Discord.ChannelType.GuildText) return;
                    message.reply('I\'ve sent you a DM with all my commands!');
                })
                .catch(error => {
                    console.error(`Could not send help DM to ${message.author.tag}.\n`, error);
                    message.reply('it seems like I can\'t DM you! Do you have DMs disabled?');
                });
        }

        // Send help data about the specific command
        const name = args[0].toLowerCase();
        const command = commands.get(name) || commands.find(c => c.aliases && c.aliases.includes(name));

        if (!command) {
            return message.reply('that\'s not a valid command!');
        }

        data.push(`**Name:** ${command.name}`);

        if (command.aliases) data.push(`**Aliases:** ${command.aliases.join(', ')}`);
        if (command.description) data.push(`**Description:** ${command.description}`);
        if (command.usage) data.push(`**Usage:** ${prefix}${command.name} ${command.usage}`);

        data.push(`**Cooldown:** ${command.cooldown || 3} second(s)`);

        message.channel.send(data, { split: true });
    },
};
