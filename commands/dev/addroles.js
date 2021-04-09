const fs = require('fs');

module.exports = {
    name: 'addroles', // The name of the command
    aliases: ['addrole','roleadd','rolesadd'],
    description: 'Reloads all the commands and procedures!', // The description of the command (for help text)
    perms: 'dev', //restricts to bot dev only (me)
    allowDM: false,
    usage: '<rolename1> <colour1|none> [rolename2] [colour2|none] ...', // Help text to explain how to use the command (if it had any arguments)
    async execute(message, args) {
      for (i = 0; 2*i < args.length; i++) {
        var data = {
          name: args[2*i]
        };
        if (args.length != 2*i + 1 && args[2*i+1] != 'none') {
          data.color = args[2*i+1];
        }
        await message.guild.roles.create({data:data});
      }
    },
};
