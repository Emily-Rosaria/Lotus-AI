const fs = require('fs');

module.exports = {
    name: 'addroles', // The name of the command
    aliases: ['addrole','roleadd','rolesadd'],
    description: 'Reloads all the commands and procedures!', // The description of the command (for help text)
    perms: 'dev', //restricts to bot dev only (me)
    allowDM: false,
    usage: '<rolename1> <colour1|none>\n[rolename2] [colour2|none]\n[rolename3] [colour3|none]\n...', // Help text to explain how to use the command (if it had any arguments)
    async execute(message, args) {
      var role_args = message.content.split(/\n+/);
      if (role_args.length == 1) {
        role_args = message.content.split(/ +/);
        role_args.shift(); //remove command trigger
        var color = role_args.length > 1 ? role_args.pop() : 'none';
        role_args = [role_args.join(' '), color];
      } else {
        role_args[0] = role_args[0].split(/ +/);
        if (role_args[0].length == 1) {
          role_args.shift();
        } else {
          role_args[0].shift();
          role_args[0].join(' '); //remove command trigger
        }
        role_args.map(row => {
          var items = row.split(/ +/);
          var color = items.length > 1 ? items.pop() : 'none';
          var items = items.join(' ');
          return [items, color];
        })
      }
      for (i = 0; 2*i < role_args.length; i++) {
        var data = {
          name: role_args[2*i].trim()
        };
        if (role_args.length != 2*i + 1 && role_args[2*i+1] != 'none') {
          data.color = role_args[2*i+1].trim();
        }
        await message.guild.roles.create({data:data});
      }
      message.reply("Done!");
    },
};
