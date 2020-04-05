const mongoose = require('mongoose')

const saleSchema =  new mongoose.Schema({
    ID: String,
    YEAR: String,
    DATE: Date,
    QTR: String,
    CUST: String,
    CNAME: String,
    ITEM: String,
    INAME: String,
    TYPE: String,
    STER: String,
    QTY: Number,
    SALE: Number,
    COST: Number,
    REP: String,
    COMMISSIONS: Number
})

module.exports = mongoose.model('Sale', saleSchema)