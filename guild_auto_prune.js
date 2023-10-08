const Discord = require('discord.js'); // Loads the discord API library
const fs = require("fs");

const guildID = '892995500180131870';
const verified_roles = ['892995500297580626','992413959330218005','1004544638713086092'];
const unapproved_role = '992059872218714112';
const rejected_role = '991489138169745458'; // role for people who submitted something and/or were rejected
const lurk_channel = '993660499470331990';
const oneDay = 24 * 60 * 60 * 1000; // one day in milliseconds
const submission_channel = '892995502319222788'
const approved1 = "892995502319222789"
const approved2 = "893015367994208317"
const intros = "992487101083959506"

module.exports = async function (client) {
    var guild = await client.guilds.fetch(guildID);
    var channel = await guild.channels.resolve(lurk_channel);
    var channel2 = await guild.channels.resolve(submission_channel);
    var allMembers = await guild.members.fetch()
    const now = new Date();

    // delete old reminder
    await fs.readFile("prune_temp.txt", "utf-8", (err, data) => {
      if (err) { console.error(err) }
      if (data) {
        channel.messages.fetch(data.trim())
        .then(message => {if (message) {message.delete()}})
        .catch(console.error);
      }
    });
    guild.members.fetch().then(async (members)=>{
      var lurkers = members.filter((member)=>{
        if (!member.user.bot && (!member.roles || !member.roles.hoist || ![...member.roles.cache.keys()].some(rID=>verified_roles.includes(""+rID)))) {
          return true;
        }
        return false;
      });
      var lurkersArr = [];
      lurkers.each((lurker)=>{
        let dayCount = (now.getTime() - lurker.joinedAt.getTime()) / oneDay;
        if (dayCount > 1 && (!lurker.roles || !lurker.roles.hoist || !lurker.roles.cache.has(unapproved_role))) {
          lurker.kick("Didn't give age after one day."); // kick lurker if they haven't given their age yet
          return;
        }
        if (dayCount < 3 || lurker.roles.cache.has(rejected_role)) {
          return; // joined less than three days ago or made a recent submission
        }
        if (dayCount > 7) {
          lurker.kick("Inactivity. Joined over a week ago."); // kick lurker if no recent submission attempt was made
          return;
        }
        lurkersArr.push(lurker.user.id); // lurkers to warn about a kick, those who submitted something recently aren't warned
        return;
      });
      reminder = !lurkersArr || lurkersArr.length == 0 ? "" : "> " + lurkersArr.map(l=>`<@${l}>`).join(', ') + "\nHello! This is your friendly neighbourhood robot here to remind you that you may get kicked if you don't submit a character. Read the <#892995502319222787> and submit something to <#892995502319222788>. Feel free to ask if you have any questions!\n```\nTo prevent an inflated or inaccurate member count, any lurking members that haven't recently tried to submit a character are automatically kicked after about a week after joining.\n```";
      if (reminder) {
        channel.send({content: reminder}).then(msg => {
          const data = ""+msg.id;
          fs.writeFile("prune_temp.txt", data, (err) => {
            if (err) console.error(err);
          });
        }).catch(console.error)
      } else {
        fs.writeFile("prune_temp.txt", "", (err) => {
          if (err) console.error(err);
        });
      }
    }).catch(console.error);
    // delete old reminder

    await fs.readFile("prune_temp2.txt", "utf-8", (err, data) => {
      if (err) { console.error(err) }
      if (data) {
        channel2.messages.fetch(data.trim())
        .then(message => {if (message) {message.delete()}})
        .catch(console.error);
      }
    });
    channel2.messages.fetch({limit:100, cache: false}).then(async (messages) => {
      var subMessages = messages.filter(m => {
        if (m.createdTimestamp + 30*60 > now.getTime()) {
          return false;
        }
        if (!allMembers.has(m.author.id) && allMembers.size+10 > guild.memberCount && guild.memberCount) {
          m.delete().catch(console.error)
          return false;
        }
        if (m.reactions.cache.find(r => r.emoji.name == '☑️') && m.author.id != client.user.id) {
          return true;
        }
        return false;
      })
      const users = [...new Set([...subMessages.map(m => m.author.id).values()])]
      reminder = !users || users.length == 0 ? "" : "> " + users.map(u=>`<@${u}>`).join(', ') + "\nWarning! You have an old submission left in this channel. Please repost your approved characters to <#892995502319222789> or <#893015367994208317> as appropriate. If you've already done this, you should delete your old submissions in this channel to avoid being pinged. After an extended time, **we will delete old submissions on our own and users who ignore this message may be kicked for inactivity.**";
      if (reminder) {
        channel2.send({content: reminder}).then(msg => {
          const data = ""+msg.id;
          fs.writeFile("prune_temp2.txt", data, (err) => {
            if (err) console.error(err);
          });
        }).catch(console.error)
      } else {
        fs.writeFile("prune_temp2.txt", "", (err) => {
          if (err) console.error(err);
        });
      }
    })

    if (!guild.memberCount || allMembers.size+10 < guild.memberCount) {
      return
    }
    var channel3 = await guild.channels.resolve(approved1);
    var channel4 = await guild.channels.resolve(approved2);
    var channel5 = await guild.channels.resolve(intros);
    channel3.messages.fetch({limit:100,cache:false}).then(messages => {
      const noMember = messages.filter(m => {
        if (allMembers.has(m.author.id) || m.createdTimestamp + 30*60 > now.getTime()) {
          return false
        }
        if (m.createdTimestamp + 14*24*60*60 > now.getTime()) {
          return true
        }
        m.delete().catch(console.error)
        return false
      })
      if (noMember && noMember.size > 0) {
        channel3.bulkDelete(noMember).catch(console.error)
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
        m.delete().catch(console.error)
        return false
      })
      if (noMember && noMember.size > 0) {
        channel4.bulkDelete(noMember).catch(console.error)
      }
    }).catch(console.error)
    channel5.messages.fetch({limit:100,cache:false}).then(messages => {
      const noMember = messages.filter(m => {
        if (allMembers.has(m.author.id) || m.createdTimestamp + 30*60 > now.getTime()) {
          return false
        }
        if (m.createdTimestamp + 14*24*60*60 > now.getTime()) {
          return true
        }
        m.delete().catch(console.error)
        return false
      })
      if (noMember && noMember.size > 0) {
        channel5.bulkDelete(noMember).catch(console.error)
      }
    }).catch(console.error)
};
