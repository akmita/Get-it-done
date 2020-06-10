//---------------------------------------------------------------------------------//
// **** db.js FILE is creating connection between node.js and mongodb server **** //
//---------------------------------------------------------------------------------//

const MongoClient = require("mongodb").MongoClient;
const ObjectID = require('mongodb').ObjectID;           // https://docs.mongodb.com/manual/reference/method/ObjectId/
const dbname = "crud_mongodb";
const url = "mongodb://localhost:27017";            
const mongoOptions = {useNewUrlParser : true};          // options we could pass in    what is new url parser

const state = {
    // initialized db to null, there is no database connection yet
    db : null                        
};

const connect = (cb) => {       
    // if there is a database connection, call callback cb
    if (state.db) {                 
        cb();
    }
    // if there isn't a database connection, use the MongoClient to create one
    else {                          
        MongoClient.connect(url, mongoOptions, (err, client)=>{
            // if error, pass it back to callback
            if (err) {              
                cb(err);
            }
            // if there's no error, set state and call callback
            else {                  
                state.db = client.db(dbname);
                cb();
            }
        });
    }
}
// passes in id of the document
const getPrimaryKey = (_id)=>{
    // Returns an ObjectID object, used to query the database
    return ObjectID(_id);
}

// gets database
const getDB = ()=>{
    return state.db;
}

module.exports = {getDB,connect,getPrimaryKey};