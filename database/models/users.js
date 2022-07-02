const mongoose = require("mongoose"); // Import mongoose library
const Schema = mongoose.Schema; // Define Schema method

var UserSchema = new Schema({ // Create Schema
  _id: {type: String, required: true}, // ID of user on Discord
  bumps: {type: Number, default: 0},
  documents: {
    type: Map,  // documents "names" - like the name of a copypasta.
    of: String // document "keys (for use with a document model)"
  },
  totalWords: {type: Number, default: 0}, // total words written by this users
  totalChars: {type: Number, default: 0} // character count - as in total letters written by this user
});

// Model
var users = mongoose.model("users", UserSchema); // Create collection model from schema
module.exports = users; // export model
