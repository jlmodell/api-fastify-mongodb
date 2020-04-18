const mongoose = require('mongoose')

const itemSchema = new mongoose.Schema({
    item_id: String,
    item_description: String
})

module.exports = mongoose.model('Item', itemSchema)