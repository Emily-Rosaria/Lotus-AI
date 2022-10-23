require('dotenv').config(); //for .env file


const fs = require('fs');
const config = require('./../../config.json'); // load bot config
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v10');
const Discord = require('discord.js');                  // Loads the discord API library

module.exports = {
    name: 'update', // The name of the command
    description: 'Reloads all the commands and procedures!', // The description of the command (for help text)
    perms: 'dev', //restricts to bot dev only (me)
    group: 'dev',
    execute(message) {
      if (message.author.id != "247344219809775617") {return}
      const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);
      var client = message.client;
      console.log("Updating commands and functions...");
      const getAllCommands = function(dir, cmds) {
          files = fs.readdirSync(dir,{ withFileTypes: true });
          fileArray = cmds || [];
          files.forEach((file) => {
              if (file.isDirectory()) {
                  const newCmds = fs.readdirSync(dir+'/'+file.name);
                  fileArray = fileArray.concat(newCmds.map((f) => './../' + file.name + '/' + f));
              } else {
                  fileArray = fileArray.concat(['./../'+file.name]);
              }
          });
          return fileArray;
      };
      const commandFiles = getAllCommands('./commands');
      const commands = [];
      // Loops over each file in the command folder and sets the commands to respond to their name
      for (const file of commandFiles) {
          delete require.cache[require.resolve(file)];
          if (file.endsWith('.js')) {
            const command = require(file);
            client.commands.set(command.name, command);
            if (command.data) {
              commands.push(command.data.toJSON());
            }
          }
      }

      // Deletes commands that don't exist
      const keys = Array.from(client.commands.keys());
      const validCommands = commandFiles.filter(file => file.endsWith('.js')).map(x => require(x).name);
      console.log('New valid command list:');
      console.log(validCommands);
      for (const key of keys) {
          if (!validCommands.includes(key)) {
            console.log('Removing command '+key+' from cache.');
            delete client.commands.delete(key);
            client.commands.array();
          }
      }

      // Time to reset the event stuff!
      const eventFunctions = fs.readdirSync('./events',{ withFileTypes: true }).filter((f)=>f.name.endsWith('.js'));
      eventFunctions.forEach((eventF) => {
        delete require.cache[require.resolve('./../../events/'+eventF.name)];
        const event = require('./../../events/'+eventF.name);
        client.events.set(event.name,event);
      });

      console.log('Commands updated and cleaned! Now starting on misc functions.');

      // Reset cache of misc function
      const miscFunctions = fs.readdirSync('./misc_functions',{ withFileTypes: true }).filter((f)=>f.name.endsWith('.js'));
      miscFunctions.forEach((miscF) => {
        delete require.cache[require.resolve('./../../misc_functions/'+miscF.name)];
      });

      delete require.cache[require.resolve('./../../guild_auto_prune.js')];
      delete require.cache[require.resolve('./../../bump_reminder.js')];

      console.log('Misc functions updated and cleaned! Now reloading config.');

      delete require.cache[require.resolve('./../../config.json')];

      (async () => {
        try {
          console.log('Started refreshing application (/) commands.');

          await rest.put(
            Routes.applicationGuildCommands(client.user.id, config.guild),
            { body: commands },
          );

          console.log('Successfully reloaded application (/) commands.');
        } catch (error) {
          console.error(error);
        }
      })();

      message.reply('Done! Database and core functions may require a reboot for the full changes to be pushed.');
    },
};
