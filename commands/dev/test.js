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
      const client = message.client;
      /*
      const now = new Date();

      var guild = await client.guilds.fetch("892995500180131870");
      var allMembers = await guild.members.fetch();
      var channel3 = await guild.channels.resolve("892995502319222789");
      var channel4 = await guild.channels.resolve("893015367994208317");
      channel3.messages.fetch({limit:100,cache:false}).then(messages => {
        const noMember = messages.filter(m => {
          if (allMembers.has(m.author.id) || m.createdTimestamp + 30*60 > now.getTime()) {
            return false
          }
          if (m.createdTimestamp + 14*24*60*60 > now.getTime()) {
            return true
          }
          //m.delete().catch(console.error)
          console.log(`Delete ${m.id} by ${m.author.tag}`)
          return false
        })
        if (noMember && noMember.size > 0) {
          console.log(`Bulk Delete messages by ${noMember.map(m => m.author.tag).join(', ')}`)
          //channel3.bulkDelete(noMember).catch(console.error)
        }
      }).catch(console.error)
      channel4.messages.fetch({limit:100,cache:false}).then(messages => {
        const noMember = messages.filter(m => {
          if (allMembers.has(m.author.id) || m.createdTimestamp + 30*60 > now.getTime()) {
            return false
          }
          if (m.createdTimestamp + 14*24*60*60 > now.getTime()) {
            return true
          }
          console.log(`Delete ${m.id} by ${m.author.tag}`)
          //m.delete().catch(console.error)
          return false
        })
        if (noMember && noMember.size > 0) {
          console.log(`Bulk Delete messages by ${noMember.map(m => m.author.tag).join(', ')}`)
          //channel4.bulkDelete(noMember).catch(console.error)
        }
      }).catch(console.error)
      return;
      */
      var prune = require('./../../guild_auto_prune.js');
      try {
        prune(message.client);
      } catch (err) {
        console.error(err);
      }
    },
};
