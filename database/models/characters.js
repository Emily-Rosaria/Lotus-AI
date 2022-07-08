const mongoose = require("mongoose"); // Import mongoose library
const Schema = mongoose.Schema; // Define Schema method

// Schema
var CharacterSchema = new Schema({
  _id: {type: String, required: true}, // ID of the message that was posted
  author: {type: String, required: true}, // ID of the author that posted the message
  channel: {type: String, required: true}, // ID of the character channel the message was posted in
  timestamp: {type: String, required: true}, // timestamp of the message in unix ms
  approved: {type: Boolean}, // true if posted in an approved channel, false for submissions, blank otherwise
  introduction: {type: Boolean} // true if this is an introduction post, false if this is a character sheet
});

// Model
var characters = mongoose.model("characters", CharacterSchema); // Create collection model from schema
module.exports = characters; // export model
