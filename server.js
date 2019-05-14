// dependencies
const express = require('express');
const exphbs = require('express-handlebars');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const request = require('request');
const logger = require('morgan');
// scraping tools
const axios = require('axios');
const cheerio = require('cheerio');
// require models
const db = require('./models');

const PORT = process.env.PORT || 3000;

const app = express();
// use morgan looger for logging requests
app.use(logger('dev'));
// use body-parser for handling form submission
app.use(bodyParser.urlencoded({ extended: true }));
// use express.static to serve public folder as static directory
app.use(express.static('public'));

app.engine('handlebars', exphbs({ defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

// connect to mongo db
const MONGODB_URI = process.env.MONGOLAB_URI || 'mongodb://localhost/mongoHeadlines';
mongoose.connect(MONGODB_URI);

// Start the server
app.listen(PORT, () => {
    console.log(`App running on port ${  PORT  }!`);
  });