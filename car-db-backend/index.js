const express = require('express');
const app = express();
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();
const session = require('express-session');
const cookierParser = require('cookie-parser');
const bodyParser = require('body-parser');


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookierParser());
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true
}));

mongoose.connect(process.env.MONGO_URI).then(() => {
    console.log('Connected to MongoDB');
}).catch((err) => {
    console.error('Error connecting to MongoDB', err);
});

app.listen(3000, () => {
      console.log('Server is running on port 3000');
});