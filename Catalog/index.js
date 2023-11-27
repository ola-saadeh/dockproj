const express = require('express');
const path = require("path")
const cors = require('cors');
const app = express();
require('dotenv').config();
app.use(cors());
app.use(express.json());
const customLogger = require("./custom-logger");
const axios = require("axios");
const knex = require("knex")({
    client: "sqlite",
    connection: {
        filename: path.join(__dirname, './books.db')
    },
    useNullAsDefault: true
});

app.get("/", (req, res) => {
    res.sendStatus(200);
});

app.get("/books/subject", async (req, res) => {
    try {
        let subject = req.headers["subject"];
        customLogger.log("Searching for books with subject: " + subject);
        let result = await knex("books").select().where("topic", subject);
        if (result.length === 0) {
            res.json({ "result": "No books found in this subject" });
        }
        customLogger.log("The result is: " + JSON.stringify(result));
        res.json(result);
    } catch (error) {
        res.status(500).send("Error processing your request on the server");
    }
});

app.get("/books/item", async (req, res) => {
    try {
        let itemNumber = req.headers["itemnumber"];
        customLogger.log("Searching for the book with item number: " + itemNumber);
        let result = await knex("books").select().where("number", itemNumber);
        if (result.length === 0) {
            res.json({ "result": "No book found with this item number" });
        }
        customLogger.log("The result is: " + JSON.stringify(result));
        res.json(result);
    } catch (error) {
        res.status(500).send("Error processing your request on the server");
    }
});

app.put("/books/update/stock", async (req, res) => {
    try {
        let operation = req.headers["operation"];
        let amount = req.headers["amount"];
        let itemNumber = req.headers["itemnumber"];
        customLogger.log(`Updating item ${itemNumber} stock by ${operation} amount to ${amount}`);
        let result = await knex("books").select().where("number", itemNumber);
        if (result.length === 0) {
            res.json({ "result": "No book found with this item number to update" });
        }
        let newVal = (operation === "increase") ? parseInt(result[0]["stock"]) + parseInt(amount) : parseInt(result[0]["stock"]) - parseInt(amount);
        customLogger.log("The new value is: " + newVal);
        await knex('books').update('stock', newVal).where("number", itemNumber);
        customLogger.log("Updated successfully");
        res.sendStatus(200);
    } catch (error) {
        res.status(500).send("Error processing your request on the server");
    }
});

app.put("/books/update/cost", async (req, res) => {
    try {
        let newCost = parseInt(req.headers["newcost"]);
        let itemNumber = req.headers["itemnumber"];
        let result = await knex("books").select().where("number", itemNumber);
        if (result.length === 0) {
            res.json({ "result": "No book found with this item number to update" });
        }
        customLogger.log(`Updating the book number ${itemNumber} cost to ${newCost}`);
        await knex('books').update('cost', newCost).where("number", itemNumber);
        customLogger.log("Updated successfully");
        res.sendStatus(200);
    } catch (error) {
        res.status(500).send("Error processing your request on the server");
    }
});

app.listen(process.env.PORT, () => {
    customLogger.myLog(`Server is running on port ${process.env.PORT}`);
});