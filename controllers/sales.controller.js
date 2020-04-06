const Sales = require('../models/sales.model')
const {Aggregations, tradefees, grossProfit, grossProfitMargin, avgSalePrice, avgSalePriceAfterDiscounts} = require('../utilities/mongodb.aggregations')
// const boom = require('boom')


exports.getSalesForPeriodByItem = async (req, reply) => {
    const start = req.query.start
    const end = req.query.end
    const item = req.query.item    

    const [match, group] = Aggregations(start, end, item, cust=null)  

    const sales = await Sales.aggregate([
        match,
        group,
        tradefees,
        grossProfit,
        grossProfitMargin,
        avgSalePrice,
        avgSalePriceAfterDiscounts,
        {$unwind: '$sales'},
        {$sort: {sales: -1}}
    ])        

    reply.code(201).send({ data: sales })
}

exports.getSalesForPeriodByCust = async (req, reply) => {
    const start = req.query.start
    const end = req.query.end
    const cust = req.query.cust

    console.log(start,end,cust)

    const [match, group] = Aggregations(start, end, item=null, cust)
    console.log(match,group)
    if (!match || !group) reply.code(400).send(new Error("Missing query parameters"))

    const sales = await Sales.aggregate([
        match,
        group,
        grossProfit,
        grossProfitMargin,
        avgSalePrice,
        avgSalePriceAfterDiscounts,
        {$unwind: '$sales'},
        {$sort: {sales: -1}}
    ])        

    reply.code(201).send({ data: sales })
}