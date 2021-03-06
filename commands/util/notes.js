const mongoose = require("mongoose"); //database library
const config = require('./../../config.json'); // load bot config
const Users = require("./../../database/models/users.js"); // users model
const Docs = require("./../../database/models/documents.js"); // users model
const Discord = require('discord.js'); // Image embed
const { SlashCommandBuilder } = require('@discordjs/builders');

const data = new SlashCommandBuilder()
	.setName("note")
	.setDescription('Manage custom saveable notes!')
  .addSubcommand(subcommand =>
		subcommand
			.setName('create')
			.setDescription('Creates a note and saves it into the bot.')
			.addUserOption(option => option.setName('target').setDescription('The user')))
	.addSubcommand(subcommand =>
		subcommand
			.setName('post')
			.setDescription('Info about the server'));

module.exports = {
    name: 'note', // The name of the command
    aliases: ['doc','postdoc','senddoc','saydoc','postnote','saynote','sendnote'],
    description: 'Posts a previously created text document, or note. If the user has no notes saved, posts a random note from another user with the same name (if available).', // The description of the command (for help text)
    perms: 'basic',
    allowDM: true,
    group: 'notes',
    cooldown: 5,
    args: true,
    usage: '<doc-name>', // Help text to explain how to use the command (if it had any arguments)
    async execute(message, args) {
      var userID = message.author.id;

      var title = args.join(" ").trim().toLowerCase();

      const data = await Users.findById({_id: message.author.id}).exec();

      // search database for docs from other users
      if (!data || !data.documents || !data.documents.has(title)) {
        Docs.find({name: title}, (err,docs)=>{
          if (err || !docs || docs.length == 0) {
            return message.reply(`No saved note found with that name in the database. You'll need to create your own with the \`$newnote\` command.`);
          }
          let index = Math.floor(docs.length * Math.random());
          const doc = docs[index];
          if (doc.content) {
            return message.channel.send(doc.content,{disableMentions:"all"});
          } else {
            return message.reply("Error with the database. No document content.");
          }
        });
        return;
      }

      Docs.findById({_id: data.documents.get(title)}, (err,doc)=>{
        if (err || !doc) {
          return message.reply("Error with the database. Document could not be found.");
          if (err) {console.error(err);}
        }
        if (doc.content) {
          return message.channel.send(doc.content,{disableMentions:"all"});
        } else {
          return message.reply("Error with the database. No document content.");
        }
      });
    },
};
