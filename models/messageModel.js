const mongoose = require('mongoose')

const Schema = mongoose.Schema

const messageSchema = new Schema({
  body: {
    type: String,
    required: true
  },
  sender: {
    type: Number,
    required: true
  },
  recipient: {
    type: Number,
    required: true
  },
  messageId: {
    type: String,
    required: true
  },
}, { timestamps: true })

module.exports = mongoose.model('Message', messageSchema)