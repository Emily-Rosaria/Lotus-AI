const config = require('./../config.json'); // load bot config
const mongoose = require("mongoose"); //database library
const Characters = require("./../database/models/characters.js"); // users model

module.exports = {
  name: "onCharacter",
  async event(message) {

    approved = false;
    if (Object.keys(config.characterChannels).includes(message.channel.id) && config.characterChannels[""+message.channel.id]) {
      approved = true;
    }

    await Characters.findOneAndUpdate({
      _id: message.id,
      author: message.author.id,
      channel: message.channel.id,
      timestamp: message.createdAt.getTime(),
      approved: approved,
      introduction: (message.channel.id == config.introChannel)
    }, {upsert: true}).exec();
  },
};
