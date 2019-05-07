'use strict';
const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require("socket.io")(server);
const mongo = require('./db');
const config = require('./config');
const path = require('path');
const bodyParser = require('body-parser');

app.use(express.static(path.join(__dirname, '/public')));
app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.sendFile('./public/index.html');
});

io.on('connection', (client) => {
    console.log('Client connected...' + client.handshake.address);
    getMessages(30, 0).then(result => {
        client.emit('messages', result);
    });
    client.on('newMessage', (data) => {
        newMessageWorks(data);
    });

    client.on('messages', (page) => {
        console.log("İstek geldi looo!!");
        getMessages(10, page).then(result => {
            client.emit('messages', result);
        });
    });
    client.on('disconnect', () => {
        console.log("Client disconnected!");
    });
});

/**
 * Handle new message. Which means:
 * Calls insert to database function.
 * Sends the new message to all connected clients.
 * @param {object} data
 */
let newMessageWorks = (data) => {
    data = JSON.parse(data);
    let schema = {
        name: data.name,
        message: data.message,
        time: new Date()
    };
    insertMessageToDb(schema);
    io.sockets.emit('broadcast', schema);
};

/**
 * Insert message to database with date.
 * @param {object} schema
 */
let insertMessageToDb = (schema) => {
    mongo.connect().then(db => {
        db.collection('messages').insertOne(schema, (err, response) => {
            if(err)
                return err;
            return response
        });
    });
};

/**
 * Gets limited messages from database.
 * @param {number} limit
 * @param {number} page
 * @returns {Promise<T | never>}
 */
let getMessages = (limit, page) => {
  return mongo.connect().then(db => {
      return db.collection('messages').countDocuments().then( count => {
          io.sockets.emit('maxPage', count/limit);
          return count;
      }).then(count => {
          if(page * limit > count){
              return [];
          } else {
              return new Promise((resolve, reject) =>  {
                  db.collection('messages').find().sort({_id: -1}).skip(limit * page).limit(limit).toArray((err, response) => {
                      if(err)
                          reject(err);
                      resolve(response);
                  });
              });

          }
      });
  });
};

server.listen(config.port, () => {console.log('Server is listening on ' + config.port)});