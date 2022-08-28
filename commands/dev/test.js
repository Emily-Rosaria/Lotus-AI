const mongoose = require("mongoose"); //database library
const Users = require("./../../database/models/users.js"); // users model
const Messages = require("./../../database/models/messages.js"); // users model
const config = require('./../../config.json'); // load bot config

const sleep = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = {
    name: 'test', // The name of the command
    description: 'Runs arbitrary dev code!', // The description of the command (for help text)
    perms: 'dev', //restricts to bot dev only (me)
    group: 'dev',
    async execute(message) {
      if (message.author.id != "247344219809775617") {return}

      Users.findByIdAndDelete("302050872383242240").exec();

      return message.reply("Write code bitch, yeet.");

      const client = message.client;
      let guild = await client.guilds.fetch(config.guild);
      const rpGroups = Object.keys(config.rpChannels);
      let channel = await guild.channels.fetch('892995501627154450');
      let userbumps = {};
      let last = "1013223096477556817";
      let quit = false;
      for (let i = 0; i<13 && !quit; i++) {
        console.log("i = "+i);
        await channel.messages.fetch({ limit: 100, before: last }).then(async messages => {
          if (!messages || messages.size == 0) {
            console.log("No messages.");
            quit = true;
            return;
          }
          messages.forEach(async (msg,index) => {
            if (msg.author.id != "302050872383242240") {
              return;
            }
            if (last == msg.id) {
              if (index == 0) {
                return;
              }
              quit = true;
              console.log("Consecutive dupes.");
              return;
            }
            if (msg.interaction && msg.interaction.commandName && msg.interaction.commandName == "bump" && msg.interaction.user && msg.interaction.user.id) {
              last = msg.id;
              if (userbumps[msg.interaction.user.id]) {
                userbumps[msg.interaction.user.id] += 1;
              } else {
                userbumps[msg.interaction.user.id] = 1;
              }
            }
          });
        }).catch(e => {
          console.error(e);
          return;
        });
        console.log(userbumps);
      }
      for (const u in userbumps) {
        Users.findOneAndUpdate({_id: u},{
          "$inc": {
            "bumps": userbumps[u]
          }
        }, {upsert: true}).exec();
        console.log("Updated "+u+" with "+userbumps[u]+" bumps!");
      }
      console.log("Done!");
    },
};
