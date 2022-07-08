const config = require('./../config.json'); // load bot config
const mongoose = require("mongoose"); //database library
const Characters = require("./../database/models/characters.js"); // users model

module.exports = {
  name: "onLeave",
  async event(member) {
    await posts = Characters.find({author: member.user.id}).exec();
    if (!posts || posts.length == 0) {
      return;
    }
    let sortedPosts = posts.sort((a,b)=>Number(a.channel)-Number(b.channel));
    var client = member.client;
    let channel = member.guild.channels.resolve(sortedPosts[0].channel);
    sortedPosts.forEach((post, i) => {
      if (post.channel != channel.id) {
        channel = member.guild.channels.resolve(post.channel);
      }
      channel.messages.fetch(post._id).then(msg => {
        msg.delete()
      }).catch(console.error);
    });
    Characters.deleteMany({author: member.user.id}).exec();
  },
};
