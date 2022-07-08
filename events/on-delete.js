const config = require('./../config.json'); // load bot config
const mongoose = require("mongoose"); //database library
const Users = require("./../database/models/users.js"); // users model
const Messages = require("./../database/models/messages.js"); // messages model
const Characters = require("./../database/models/characters.js"); // users model

module.exports = {
  name: "onDelete",
  async event(message) {

    let c = message.channel;
    if (c) {
      if (c.isThread()) {
        c = c.parent
      }
      if (!c.parentId || !Object.keys(config.rpChannels).includes(""+c.parentId) || config.rpChannels[""+c.parentId] == c.id) {
        if (c.id == config.introChannel || Object.keys(config.characterChannels).includes(""+c.id)) {
          await Characters.deleteOne({_id:(""+message.id)}).exec();
        }
        return;
      }
    }

    const oldMessageData = await Messages.findByIdAndDelete(message.id).exec(); // return message data if it existed, delete if it does

    if (!oldMessageData) {
      if (!c) {
        await Characters.deleteOne({_id:(""+message.id)}).exec();
      }
      return; // return if no message data
    }

    const userData = await Users.findById(oldMessageData.author).exec();

    if (!userData) {
      return; // don't do anything if there's no user data or if the message was for a past quest that's no longer in progress
    }

    const wordChange = -oldMessageData.wordCount;
    const charChange = -oldMessageData.charCount;

    await Users.updateOne({_id: oldMessageData.author},{
      "$inc": {
        "totalChars": charChange,
        "totalWords": wordChange
      }
    }).exec();
  },
};
