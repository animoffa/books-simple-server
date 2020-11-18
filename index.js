const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const express = require("express");
const MongoClient = require("mongodb").MongoClient;
const app = express();
const objectId = require("mongodb").ObjectID;
const jsonParser = express.json();
require('dotenv').config()

app.use(cors());
app.use(bodyParser.json());

const mongoClient = new MongoClient("mongodb://localhost:27017/", {useNewUrlParser: true});
let dbClient;
;

mongoClient.connect(function (err, client) {
    if (err) return console.log(err);
    dbClient = client;
    const db = client.db('Books');
    app.locals.BooksCollection = db.collection('books');


    app.listen(3000, function () {
        console.log("Сервер ожидает подключения...");
    });
});


app.get("/books", cors(), function (req, res) {
    const BooksCollection = req.app.locals.BooksCollection;
    BooksCollection.find({}).toArray(function (err, books) {
        if (err) return res.json({success: false, msg: "Книги не найдены"});
        res.send(books)
    });
});
app.post("/books/add", cors(),jsonParser, function (req, res) {
    if (!req.body) return res.sendStatus(400);
    console.log(req.body)
    let title, author;
    if (req.body.title) {
        title = req.body.title;
    } else {
        title = "Без названия";
    }
    if (req.body.author) {
        author = req.body.author;
    } else {
        author = "Автор не указан";
    }
    const mark = req.body.mark;
    const quotes = req.body.quotes;

    const book = {title: title, author: author, mark: mark, quotes: quotes};
    const BooksCollection = req.app.locals.BooksCollection;
    BooksCollection.insertOne(book, function (err, result) {

        if (err) return res.json({success: false, msg: "Категория не была добавлена"});
        res.send(book);
        console.log(book);
    });
});
app.delete("/books/:id", function (req, res) {
    const id = new objectId(req.params.id);
    const BooksCollection = req.app.locals.BooksCollection;
    BooksCollection.findOneAndDelete({_id: id}, function (err, result) {

        if (err) return res.json({success: false, msg: "Категория не удалена"});
        let book = result.value;
        res.send(book);
    });
});
app.put("/books/:id", jsonParser, function (req, res) {

    if (!req.body) return res.sendStatus(400);
    console.log(req.body);
    const id = new objectId(req.body._id);
    const title = req.body.title;
    const author = req.body.author;
    const mark = req.body.mark;
    const quotes = req.body.quotes;

    const BooksCollection = req.app.locals.BooksCollection;
    BooksCollection.findOneAndUpdate({_id: id}, {$set: {title: title, author: author, mark: mark, quotes: quotes}},
        {returnOriginal: false}, function (err, result) {
            if (err) return res.json({success: false, msg: "Категория не обновлена"});
            const book = result.value;
            res.send(book);
            console.log(result,book);
        });
});

process.on("SIGINT", () => {
    dbClient.close();
    process.exit();
});