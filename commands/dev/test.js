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
      console.log(await Users.findById(message.author.id).exec());
    },
};
