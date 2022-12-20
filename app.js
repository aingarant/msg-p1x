require("dotenv").config();
const express = require('express');
const morgan = require('morgan');
const app = express();
const port = process.env.PORT || 3000;
const mongoose = require("mongoose");
mongoose.set('strictQuery', true);
const Message = require('./models/messageModel');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(morgan('dev'));


app.post('/', async (req, res) => {

  let msgObj = {};

  // BulkVS SMS
  if (req.body.RefId) {
    const sender = req.body.From;
    const recipient = req.body.To.toString();
    const messageId = req.body.RefId;
    const body = decodeURIComponent(req.body.Message.replace(/\+/g, '%20'));

    msgObj = {
      sender: sender,
      recipient: recipient,
      messageId: messageId,
      body: body
    };
  }

  // SignalWire SMS
  if (req.body.MessageSid) {
    const sender = req.body.From.replace("+", "");
    const recipient = req.body.To.replace("+", "");
    const messageId = req.body.MessageSid;
    const body = req.body.Body;

    msgObj = {
      sender: sender,
      recipient: recipient,
      messageId: messageId,
      body: body
    };
  }
  try {
    const message = await Message.create(msgObj)
    console.log("inserted message", message)
    res.status(200).send("OK")
  } catch (error) {
    console.log(error)
    res.status(400).send("Error")
  }
});

// connect to db
mongoose.connect(`mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASS}@msg-p1x.uh0wwox.mongodb.net/messages?retryWrites=true&w=majority`)
  .then(() => {
    console.log('connected to database')
    // listen to port
    app.listen(port, () => {
      console.log('listening for requests on port', port)
    })
  })
  .catch((err) => {
    console.log(err)
  })

module.exports = app;