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
      await Users.deleteMany({}).exec();
      await Messages.deleteMany({}).exec();
      return;
      if (message.author.id != "247344219809775617") {return}

      const client = message.client;
      let guild = await client.guilds.fetch(config.guild);
      const rpGroups = Object.keys(config.rpChannels);
      let channels = await guild.channels.cache.filter(c => c.parentId && rpGroups.includes(c.parentId) && rpGroups[c.parentId] != c.id);
      console.log("Scanning "+channels.size+" channels.");
      channels.forEach(async (cha, i) => {
        console.log("["+i+"] Scanning Channel: "+cha.name);
        await cha.threads.fetchActive().then(threads => {
          if (!threads || threads.size == 0) {
            return;
          }
          threads.threads.forEach(async (t,j) => {
            console.log("["+j+"] Scanning Thread: "+t.name);
            await t.messages.fetch({ limit: 100 }).then(async messages => {
              if (!messages || messages.size == 0) {
                return;
              }
              await sleep(200);
              messages.forEach(async (m,k) => {
                await sleep(200);
                let exists = await Messages.exists({ _id: m.id });
                console.log(exists);
                if (!exists) {
                  await sleep(200);
                  message.client.events.get("onRoleplay").event(message);
                  console.log("["+j+"] Message "+k+" has been scanned.");
                } else {
                  console.log("["+j+"] Message "+k+" already exists. Skipping.");
                }
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
        await cha.messages.fetch({ limit: 100 }).then(async messages => {
          if (!messages || messages.size == 0) {
            return;
          }
          await sleep(200);
          messages.forEach(async (m,j) => {
            await sleep(200);
            let exists = await Messages.exists({ _id: m.id });
            if (!exists) {
              await sleep(200);
              message.client.events.get("onRoleplay").event(message);
              console.log("["+i+"] Message "+j+" has been scanned.");
            } else {
              console.log("["+i+"] Message "+j+" already exists. Skipping.");
            }
          });
        }).catch(e => {
          console.error(e);
          return;
        });
      });
      console.log("Done?");
    },
};
