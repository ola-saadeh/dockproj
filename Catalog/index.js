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
        console.log("Searching for books with subject: " + subject);
        customLogger.myLog("Searching for books with subject: " + subject);
        let result = await knex("books").select().where("topic", subject);
        if (result.length == 0) {
            res.json({ "result": "No books found in this subject" });
        }
        customLogger.myLog("The result is: " + JSON.stringify(result));
        res.json(result);
    } catch (error) {
        res.status(500).send("Error processing your request on the server");
    }
});
