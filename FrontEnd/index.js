const express = require('express');
const path = require("path")
const cors = require('cors');
const app = express() ;
const axios = require("axios");
const myIP = "http://" + process.env.HOST +":"
let catlogIP = "http://localhost:4000";
let orderIP = "http://localhost:5000";
console.log(process.env.HOST)
let catCur = 0
let orCur = 0
require('dotenv').config()
app.use(cors());
app.use(express.json());
const customLogger = require("./custom-logger");


app.get("/",(req,res)=>{
    res.sendStatus(200)
})
const collection = new Map();
let cashMid = (req, res, next)=>{
    
    customLogger.myLog("*************************************")
    if(collection.has(req.headers["topic"] + req.url))
    {
        customLogger.myLog("Cache lookup successful - Request found")
        res.send(collection.get(req.headers["topic"] + req.url)) 
        return
    }
    customLogger.myLog("*************************************")
    if(collection.has(req.headers["booknumber"] + req.url))
    {
        customLogger.myLog("Cache lookup successful - Request found")
        res.send(collection.get(req.headers["booknumber"] + req.url)) 
        return
    }
    else
    {
        customLogger.myLog("Cache doesn't contain the requested data")
        next()
    }

}
app.get("/search",cashMid,(req,res)=>{
    let subject = req.headers["topic"]
    customLogger.myLog("Querying books related to the topic "+subject)
    customLogger.myLog("Exploring on server :" + catlogIP )
    axios.get(catlogIP+'/books/subject',{headers:{subject}})
        .then((ress)=> {
            collection.set(req.headers["topic"] + req.url,ress.data)
            catCur = (catCur + 1) % catlogIP.length;
            customLogger.myLog("Results for the Search : " + JSON.stringify(ress.data) )
           res.send(ress.data)
           
        })
        .catch( (error) =>{
            res.sendStatus(500)
            customLogger.myLog("Error on the server occurred." + error.stack );
            res.status(500).send("Failed to process your request due to a parsing error on the server.")
        })
})


app.listen(process.env.PORT, ()=>{
    customLogger.myLog(`server is running on port ${process.env.PORT}`);
  });