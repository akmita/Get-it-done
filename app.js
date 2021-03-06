const express = require('express');
const bodyParser = require("body-parser");
const Joi = require('joi');
const app = express();
app.use(bodyParser.json());              // middleware, so we can recieve JSON into our put, post... functions
const path = require('path');
const db = require("./db");
const port = process.env.PORT || 3000;   // global object "process" has field that stores environment varaible


// MONGODB DATABASE CONNECTION
db.connect((err)=> {
    if (err) {
        console.log("unable to connnect to database");
        process.exit(1);
    }
    else {
        app.listen(port, ()=>{
            console.log("connected to database, app listening on port " + port);
        });
    }
});

app.use(express.static('public')); // for css files

// --------------------Express Routes--------------------------------- //

// PUT route - updates existing list item - Whatever goes after the '/' is the primary key of the document we want to update
// app.put("/:id", (req, res)=>{
//     const todoID = req.params.id;   // Gets the ID from the URL path entered
//     const userInput = req.body;     // Get user input from the request body in JSON
//                                                                 console.log("req.params.id: ", todoID);
//                                                                 console.log("req.body: ", userInput);
//                                                                 console.log("put request called in node JS");
//     db.getDB().collection(collection).findOneAndUpdate( { _id : db.getPrimaryKey(todoID) },   // IDENTIFIES OLD DATA | Pass in object ID object instead of just the string "todoID"     
//                                                         { $set : {todo : userInput.todo} },   // ADDS NEW DATA | After "$set:", Specifies what new data will be, in this case a JS object
//                                                         { returnOriginal : false},            // Do not return original 
//                                                         ( err, result)=>{                     // Callback 
//                                                             if (err) { console.log(err); }    
//                                                             else     {                        // Send json 
//                                                                 console.log("Update successful");
//                                                                 res.json(result); 
//                                                             }    
//                                                         }
//                                                       )        
// });

// generic put route - this route will handle all database updates -- DEPRECATED
// app.put("/:id", (req, res)=>{
//     console.log("  generic PUT method called.. body: ");
//     console.log(req.body);
//     elementID = req.params.id;

//     db.getDB().collection("todo").findOneAndUpdate(
//         { _id : db.getPrimaryKey(elementID)},
//         { $set : req.body },
//         { returnOriginal : false },
//         (err, result)=>{
//             if (err) { console.log(err); }
//             else {
//                 console.log("update successful");
//                 res.json(result);
//             }
//         }
//     )
// })

// put route will handle database updates
app.put("/api/:id", (req, res)=>{
    console.log("API PUT method called... id: " + req.params.id);
    console.log("body: ");
    console.log(req.body);    
    elementID = req.params.id;
    
    db.getDB().collection("goals").findOneAndUpdate(
        { _id : db.getPrimaryKey(elementID)},
        { $set : req.body },
        { returnOriginal : false },
        (err, result)=>{
            if (err) { console.log(err); }
            else {
                console.log("update successful");
                res.json(result);
            }
        }
    )
})

// will post new goal to database
app.post('/api/addGoal', (req, res)=>{
    const schema = Joi.object({                                // validation schema
        name: Joi.string().min(1).required()
    });
    const result = schema.validate(req.body);      
    if (result.error) {
        res.status(400).send(result.error.details[0].message);
        return;
    }   


    db.getDB().collection("goals").insertOne(
        req.body,
        (err, result)=>{
            if  (err) console.log(err);
            else { 
                res.json(result);
            }
        }    
    )
})


// POST route - handles document insertion
app.post('/', ( req, res)=> {
    const userInput = req.body;  

    console.log(userInput);

    db.getDB().collection("todo").insertOne( 
        userInput,         // document we want to insert
        (err, result)=>{   // Callback | Result is the result document from mongoDB
            if (err) { console.log(err); }
            else {
                res.json({ result : result, document : result.ops[0]});  // Ops contains the documents inserted with added _id fields
                console.log("Succesfully inserted following item into database: ");
                console.log(result.ops[0]);
            }
        }
    )
}); 


// DELETE route - removes document - 'id' is the primary key of the document to delete
app.delete('/:id', (req,res)=>{
    const todoID = req.params.id;

    db.getDB().collection("todo").findOneAndDelete( {_id : db.getPrimaryKey(todoID)}, (err, result)=>{
        if (err) { console.log(err); }
        else     { res.json(result); } 
    });
})


// GET route 1 - main page?
app.get('/', (req, res)=> {
    res.sendFile(path.join(__dirname, 'index.html'));
})

// GET menu option 2 - goals page
app.get('/goals', (req, res)=> {
    res.sendFile(path.join(__dirname, 'goals.html'));
})

// GET route 2 - query the database for all todos
app.get('/getTodos', (req, res)=>{
    db.getDB().collection("todo").find({}).toArray((err, documents)=>{
        if (err) {
            console.log(err);
        }
        else {
            res.json(documents);           
        }
    })        
});

// gets goals from database
app.get("/getGoals", (req, res)=> {
    console.log("called get goals");
    db.getDB().collection("goals").find({}).toArray((err, documents)=>{
        if (err) {
            console.log(err);
        }
        else {
            res.json(documents);
        }
    })
})
