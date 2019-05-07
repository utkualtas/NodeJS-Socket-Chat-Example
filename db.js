'use strict';
const MongoClient = require('mongodb').MongoClient;
const mongoTimeStamp = require('mongodb').Timestamp;
const uri = 'mongodb+srv://utku:test123@chatapp-tkv0c.mongodb.net/test?retryWrites=true';
const client = new MongoClient(uri, { useNewUrlParser: true });
let DB = null;

module.exports.TimeStamp = mongoTimeStamp;
module.exports.connect = () => {
    return new Promise((resolve, reject) => {
        if(DB){
            resolve(DB);
        } else {
            client.connect(err => {
                if(err){
                    console.log(err);
                    reject(err);
                } else {
                    DB = client.db("chat_app");
                    console.log("Connected to database.");
                    resolve(DB);
                    //client.close();
                }
            });
        }
    });
};


