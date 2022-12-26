require("dotenv").config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;
const mongoose = require("mongoose");
mongoose.set('strictQuery', true);
const Message = require('./models/messageModel');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(morgan('dev'));

// connect to db
mongoose.connect(`mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASS}@msg-p1x.dtwh2vm.mongodb.net/messages?retryWrites=true&w=majority`)
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

app.get("/", (req, res) => {
  res.send("Hello World");
});


app.get("/inbox", async (req, res) => {
  try {
    const messages = await Message.find()
    res.status(200).json(messages);
  } catch (error) {
    console.log(error)
    res.status(400).send("Error")
  }
});

app.get("/thread/:id", async (req, res) => {

  const sender = req.params.id.toString();

  try {
    const messages = await Message.distinct({ sender: sender })
    res.status(200).json(messages);
  } catch (error) {
    console.log(error)
    res.status(400).send("Error")
  }
});

app.get("/number/:id", async (req, res) => {
  try {
    const messages = await Message.distinct({ sender: req.params.id })
    res.status(200).json(messages);
  } catch (error) {
    console.log(error)
    res.status(400).send("Error")
  }
});

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
    const newMessage = await Message.create(msgObj)
    console.log("inserted message", newMessage)
    res.status(200).send("OK")
  } catch (error) {
    console.log(error)
    res.status(400).send("Error")
  }
});

module.exports = app;