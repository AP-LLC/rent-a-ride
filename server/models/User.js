const mongoose = require('mongoose');
const crypto = require('crypto')



const UserSchema = new mongoose.Schema({
    username: {
      type: String,
      required: true
    },
  password: {
      type: String,
      required: true
  }
}, { timeStamp: true })


userSchema
  .virtual


module.exports = mongoose.model("User", UserSchema)

