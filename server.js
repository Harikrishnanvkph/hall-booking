//importing express, mongodb
const express = require("express");
const {MongoClient} = require("mongodb");
const dotenv = require('dotenv');
dotenv.config();


const port = process.env.PORT || 3000;

//creating database client
const client = new MongoClient(process.env.MONGO_URL);

// creating express server application
const server = express();

async function dbInitialization(){
    try{
        await client.connect();
        console.log("Initializing Database...");
    }catch(err){
        console.log(err);
    }
}

async function serverInitialization(){
    try{
        server.listen(port,()=>{
            console.log("Initializing Server...http://localhost:3000")
        })
        server.use(express.json());
        server.use("/",require("./dbOperation.js"));
    }catch(err){
        console.log(err);
    }
}

async function init(){
    await dbInitialization();
    await serverInitialization();
}

init();

module.exports = client;

