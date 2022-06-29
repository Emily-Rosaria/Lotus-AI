const Discord = require('discord.js'); // Loads the discord API library
const fs = require("fs");

const guildID = '892995500180131870';
const verified_roles = ['892995500297580626'];
const rejected_role = '991489138169745458'; // role for people who submitted something and/or were rejected
const lurk_channel = '893008936381345802';
const oneDay = 24 * 60 * 60 * 1000; // one day in milliseconds

module.exports = async function (client) {
    var guild = await client.guilds.fetch(guildID);
    var channel = await guild.channels.resolve(lurk_channel);
    const now = new Date();

    // delete old reminder
    fs.readFile("prune_temp.txt", "utf-8", (err, data) => {
        if (err) { console.log(err) }
        if (data) {
          channel.fetch()
          .then(message => message.delete())
          .catch(console.error);
        }
    })

    guild.members.fetch().then((members)=>{
      var lurkers = members.filter((member)=>{
        if (!member.user.bot && (!member.roles || !member.roles.hoist || ![...member.roles.cache.keys()].some(rID=>verified_roles.includes(""+rID)))) {
          return true;
        }
        return false;
      });
      var lurkers = [];
      lurkers.each((lurker)=>{
        let dayCount = now.getTime() - lurker.joinedAt.getTime()) / oneDay;
        if (dayCount < 3 || !lurker.roles.cache.has(rejected_role)) {
          return; // joined less than three days ago or made a recent submission
        }
        if (dayCount > 7) {
          lurker.kick("Inactivity. Joined over a week ago."); // kick lurker if no recent submission attempt was made
          return; // don't remind people who made a submission that prevented them from being kicked
        }
        lurkers.push(lurker.user.id); // lurkers to warn about a kick
        return;
      });
      reminder = !lurkers || lurkers.length == 0 ? "" : lurkers.map(l=>`> <@${l}>`).join(', ') + "Hello! This is your friendly neighbourhood robot here to remind you that you may get kicked if you don't submit a character. Read the <#892995502319222787> and submit something to <#892995502319222788>. Feel free to ask if you have any questions!\n```\nTo prevent an inflated or inaccurate member count, any lurking members that haven't recently tried to submit a character are automatically kicked after about a week after joining.\n```";
      if (reminder) {
        const msg = channel.send({content: reminder});
        const data = ""+msg.id;
        fs.writeFile("prune_temp.txt", data, (err) => {
          if (err) console.log(err);
          console.log("Successfully Written to File.");
        });
      }
    }).catch((err)=>console.error(err));
};
