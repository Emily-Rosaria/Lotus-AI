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
      var prune = require('./../../guild_auto_prune.js');
      try {
        prune(message.client);
      } catch (err) {
        console.error(err);
      }
    },
};
