const mongoose = require("mongoose"); //database library
const Users = require("./../database/models/users.js"); // users model
const Messages = require("./../database/models/messages.js"); // users model
const config = require('./../../config.json'); // load bot config

module.exports = {
    name: 'test', // The name of the command
    description: 'Runs arbitrary dev code!', // The description of the command (for help text)
    perms: 'dev', //restricts to bot dev only (me)
    group: 'dev',
    async execute(message) {
      if (message.author.id != "247344219809775617") {return}
      let guild = await client.guilds.fetch(guildID);
      const rpGroups = Object.keys(config.rpChannels);
      let channels = await guild.channels.cache(c => c.parentId && rpGroups.includes(c.parentId) && rpGroups[c.parentId] != c.id);
      channels.forEach((cha, i) => {
        console.log("["+i+"] Scanning Channel: "+cha.name);
        cha.threads.fetchActive().then(threads => {
          if (!threads || threads.size == 0) {
            return;
          }
          threads.forEach((t,j) => {
            console.log("["+j+"] Scanning Thread: "+t.name);
            t.messages.fetch({ limit: 100 }).then(messages => {
              if (!messages || messages.size == 0) {
                return;
              }
              messages.forEach((m,k) => {
                if (k % 10 == 0) {
                  console.log("["+j+"] On message "+k+" of "+t.name);
                }
                Messages.countDocuments({_id: m.id}, function (err, count){
                  if(count > 0){
                    console.log("["+j+"] Message "+k+" already exists. Skipping.");
                    return;
                  }
                  message.client.events.get("onRoleplay").event(message);
                });
              });
            }).catch(e => {
              console.error(e);
              return;
            });
          });
        }).catch(e => {
          console.error(e);
          return;
        });
        cha.messages.fetch({ limit: 200 }).then(messages => {
          if (!messages || messages.size == 0) {
            return;
          }
          messages.forEach((m,j) => {
            console.log("["+i+"] On message "+j+" of "+cha.name);
            Messages.countDocuments({_id: m.id}, function (err, count){
              if(count > 0){
                console.log("["+i+"] Message "+j+" already exists. Skipping.");
                return;
              }
              message.client.events.get("onRoleplay").event(message);
            });
          });
        }).catch(e => {
          console.error(e);
          return;
        });
      });
    },
};
