require('dotenv').config(); //for .env file

/*
const express = require('express');
const app = express();
const port = 3000;

app.get('/', (req, res) => res.send('Hello World!'));

app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`));
*/
// Bot stuff below

const fetch = require('node-fetch'); // This lets me get stuff from api.
const Booru = require('booru'); // This lets me get stuff from weeb sites.
const { fs, readdirSync } = require('fs');                               // Loads the Filesystem library
const { path, join } = require("path");
const Discord = require('discord.js');                  // Loads the discord API library
const readline = require('readline');
const {google} = require('googleapis');
var cron = require('node-cron'); // run regular scheduled tasks
const config = require('./config.json');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');

const dev = config.dev; // my ID on Discord

const mongoose = require("mongoose"); // database library
const connectDB = require("./database/connectDB.js"); // local database connection
var database = config.dbName; // Database name for the local database

const botIntents = new Discord.Intents();
botIntents.add(Discord.Intents.FLAGS.GUILDS, Discord.Intents.FLAGS.GUILD_VOICE_STATES, Discord.Intents.FLAGS.GUILD_MEMBERS, Discord.Intents.FLAGS.GUILD_MESSAGES, Discord.Intents.FLAGS.GUILD_MESSAGE_REACTIONS, Discord.Intents.FLAGS.GUILD_MESSAGE_TYPING, Discord.Intents.FLAGS.DIRECT_MESSAGES, Discord.Intents.FLAGS.DIRECT_MESSAGE_REACTIONS, Discord.Intents.FLAGS.DIRECT_MESSAGE_TYPING);

const client = new Discord.Client({intents: botIntents, partials: ["CHANNEL"], allowedMentions: { parse: ['users', 'roles'], repliedUser: true}}); // Initiates the client

client.slashCommands = new Discord.Collection(); // Creates an empty list in the client object to store all commands
const getAllCommands = function (dir, cmds) {
  files = fs.readdirSync(dir, { withFileTypes: true });
  fileArray = cmds || [];
  files.forEach((file) => {
    if (file.isDirectory()) {
      const newCmds = fs.readdirSync(dir + '/' + file.name);
      fileArray = fileArray.concat(newCmds.map((f) => dir + '/' + file.name + '/' + f));
    } else if (file.name.endsWith('.js')) {
      fileArray = fileArray.concat([dir + '/' + file.name]);
    }
  });
  return fileArray;
};
const commandFiles = getAllCommands('./commands').filter(file => file.endsWith('.js')); // Loads the code for each command from the "commands" folder

const commands = [];

// Loops over each file in the command folder and sets the commands to respond to their name
for (const file of commandFiles) {
    const command = require(file);
    client.slashCommands.set(command.name, command);
    if (command.data) {
      commands.push(command.data.toJSON());
    }
}

const cooldowns = new Discord.Collection(); // Creates an empty list for storing timeouts so people can't spam with commands

const rest = new REST({ version: '9' }).setToken(process.env.TOKEN);

// Starts the bot and makes it begin listening for commands.
client.on('ready', async function() {
    client.bootTime = (new Date()).getTime();
    client.user.setPresence({ activity: { type: 'PLAYING', name: 'in a Kinky Dungeon' }, status: 'online' });
    console.log(`${client.user.username} is up and running! Launched at: ${(new Date()).toUTCString()}.`);
    cron.schedule('0 21 * * *', async () => { // remind people at 9pm
      var prune = require('./guild_auto_prune.js');
      try {
        prune(client);
      } catch (err) {
        console.error(err);
      }
    });

    cron.schedule('*/5 * * * *', async () => { // check every 5 minutes if a reminder is needed
      var bumpReminder = require('./bump_reminder.js');
      try {
        bumpReminder(client);
      } catch (err) {
        console.error(err);
      }
    });

    (async () => {
      try {
        console.log('Started refreshing application (/) commands.');

        await rest.put(
          Routes.applicationGuildCommands(client.bot.id, config.guild),
          { body: commands },
        );

        console.log('Successfully reloaded application (/) commands.');
      } catch (error) {
        console.error(error);
      }
    })();
});

/**
 * This function controls how the bot reacts to messages it receives
 */
client.on('message', async message => {
    if (message.author.bot) {return}
    if (message.author.id == dev && message.channel.type.toLowerCase() == "dm" && message.content.startsWith('$update')) {
      const command = require('./commands');
    }
});

client.on('guildMemberAdd', async member => {

  //Join message

});

client.on('guildMemberRemove', async member => {

  //leave message

});

client.on('interactionCreate', async interaction => {
  if (!interaction.isCommand()) return;
  const command = client.slashCommands.get(interaction.commandName);
  if (!command) return;

  if (!cooldowns.has(command.name)) {
    cooldowns.set(command.name, new Collection());
  }

  const now = Date.now();
  const timestamps = cooldowns.get(command.name);
  const cooldownAmount = (command.cooldown || 1) * 1000;

  if (timestamps.has(interaction.member.id)) {
    const expirationTime = timestamps.get(interaction.member.id) + cooldownAmount;

    if (now < expirationTime) {
      const timeLeft = (expirationTime - now) / 1000;
      return await interaction.reply({ content: `Whoa! You're sending commands too fast! Please wait ${timeLeft.toFixed(1)} more second(s) before running \`${command.name}\` again!`, ephemeral: true});
    }
  }

  timestamps.set(interaction.member.id, now);
  setTimeout(() => timestamps.delete(interaction.member.id), cooldownAmount);
  try {
      await command.execute(interaction,[]);
  } catch (error) {
      if (error) console.error(error);
      await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
  }
});

connectDB("mongodb://localhost:27017/"+database);

client.login(process.env.TOKEN); // Log the bot in using the token provided in the .env file
