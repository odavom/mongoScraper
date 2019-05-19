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
const MONGODB_URI = process.env.MONGOLAB_TEAL_URI || 'mongodb://localhost/mongoHeadlines';
mongoose.connect(MONGODB_URI);
// mongoose.set('useFindAndModify', false);
// mongoose.set('useCreateIndex', true);


// render the index.handlebars
app.get('/', (req, res) => {
    res.render('index');
});

// scrape quillette
app.get('/scrape', (req, res) => {
    axios.get('https://quillette.com').then((response) => {

        const $ = cheerio.load(response.data);

        $("h3.entry-title").each(function(i, element) {
            // object to store the data in $
            const result = {};
            // for title this, which refers to h3.entry-title, .text() set to result.title
            result.title = $(this).text();
            // for link - a is a child of this with attr of href
            result.link = $(this).children('a').attr('href')
            // for summary - summary is class in p tag which is sibling of this
            result.summary = $(this).siblings('p.summary').text();
            // now that have title, link and summary
            // create new article using result object
            db.Article.create(result)
                .then((dbArticle) => {
                    console.log(dbArticle);
                })
                .catch((err) => res.json(err));
        });
        // if all goes to plan send message 
        // res.send("Scrape Complete");
        res.redirect('/articles');
    });
});
// route for getting articles form DB
app.get('/articles', (req, res) => {
    // grab all the articles in collection
    db.Article.find({})
        .then((dbArticle) => {
            // if found render them in in index.handlebars at dbArticle
            res.render('index', { dbArticle } )
        })
        .catch((err) => {
            // send error 
            res.json(err);
        });
});
// route for grabbing Article by id, populate with it's note
app.get('/articles/:id', (req, res) => {
    // find article through req.params.id
    db.Article.findOne({ _id: req.params.id })
    // populate with notes associated with it
    .populate('note')
    .then((dbArticle) => {
        // if find send back
        res.json(dbArticle)
    })
    .catch((err) => {
        res.json(err);
    });
});
// route for saving/updating Article's associated note
app.post('/articles/:id', (req, res) => {
    // creat note and pass the req.body to entry
    db.Note.create(req.body)
        .then((dbNote) => db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true }))
        .then((dbArticle) => {
            res.json(dbArticle)
        })
        .catch((err) => {
            res.json(err);
        })
});

app.delete('/articles/:id', (req, res) => {

    db.Note.remove().then((dbNote) => {
        res.json(dbNote);
    })
    .catch((err) => {
        res.json(err);
    })
});


// Start the server
app.listen(PORT, () => {
    console.log(`App running on port ${  PORT  }!`);
  });