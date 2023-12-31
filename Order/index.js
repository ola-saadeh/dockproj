const express = require('express');
const path = require("path")

const app = express() ;
const axios = require("axios")

const cors = require('cors');
app.use(cors());
app.use(express.json());
require('dotenv').config()


const knex = require("knex")({
    client: "sqlite",
    connection: {
        filename: path.join(__dirname, './orders.db')
    },
    useNullAsDefault: true
});
const customLogger = require("./custom-logger");


app.get("/",(req,res)=>{
    res.sendStatus(200)
})

const otherIP = "http://" + process.env.otherIP +":"
const myIP = "http://" + process.env.HOST +":"


app.post("/purchase/:itemnumber",async(req,res)=>{

    let itemNumber = req.params.itemnumber;
    let data = []
    
    customLogger.myLog("new order to buy item: " + itemNumber)
   
    
    axios.get(otherIP+"4000"+'/books/item',{headers:{"booknumber":itemNumber}})
        .then((ress)=> {
            customLogger.myLog("item data is: " + JSON.stringify(ress.data))
            let itemData = ress.data
            if(ress.data.result)
            {
                res.json({"result":"there is no book with this item number"})
            }
            if(itemData != {})
            {
                customLogger.myLog("the number of books is now " + (parseInt(itemData[0].stock)) + " and its decreased to " + (parseInt(itemData[0].stock) - 1) );
                

                if(parseInt(itemData[0].stock) - 1 < 0)
                {
                    res.send("there is no items in the stock")
                }
                else
                {
                    axios.put(myIP+"4000"+'/books/update/stock',data,{headers:{"opration":"decrease","booknumber":itemNumber,"amount":1}})
                    .then(async(resp)=>{
                        axios.put(otherIP+"4000"+'/books/update/stock',data,{headers:{"opration":"decrease","itemnumber":itemNumber,"amount":1}}).then(async(resss11)=>{

                            customLogger.myLog("update the stock of the item")
                            let result = await knex("orders").insert({"date":new Date(),"itemNumber":itemNumber})
                            customLogger.myLog("result of update: " + resp.data)
                            res.sendStatus(200)
                        
                        })
             
                    })
                }
            
            }
        })
        .catch( (error) =>{
            customLogger.myError("error in finding the item")
        })
})

app.listen(process.env.PORT, ()=>{
    customLogger.myLog(`server is running on port ${process.env.PORT}`);
  });









  