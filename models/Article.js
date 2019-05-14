const mongoose = require('mongoose');

// save ref to Schema constructor
const Schema = mongoose.Schema;
// 
const ArticleSchema = new Schema({
    title: {
        type: String,
        index: { unique: true },
        required: true
    },
    link: {
        type: String,
        required: true
    },
    summary: {
        type: String,
        required: true
    },
    // note is an object that stores the Note _id and ref links the ObjectId of Article to Note mode
    // to populate the Article with associated note
    note: {
        type: Schema.Types.ObjectId,
        ref: "Note"
    }
});

let Article = mongoose.model('Article', ArticleSchema);

module.exports = Article;