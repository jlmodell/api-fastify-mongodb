const Sales = require('../models/sales.model')
const {Aggregations, calcFrOhCom, tradefees, grossProfit, grossProfitMargin, avgSalePrice, avgSalePriceAfterDiscounts} = require('../utilities/mongodb.aggregations')
// const boom = require('boom')


exports.getSalesForPeriodByItem = async (req, reply) => {
    const start = req.query.start
    const end = req.query.end
    const item = req.query.item
    const freightFactor = parseFloat(req.query.ff)
    const overheadFactor = parseFloat(req.query.ohf)

    const [match, group] = Aggregations(start, end, item, cust=null)
    const frOhCom = calcFrOhCom(freightFactor, overheadFactor)

    const sales = await Sales.aggregate([
        match,
        group,
        frOhCom,
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
    const freightFactor = parseFloat(req.query.ff)
    const overheadFactor = parseFloat(req.query.ohf)

    const [match, group] = Aggregations(start, end, item=null, cust)
    const frOhCom = calcFrOhCom(freightFactor, overheadFactor)

    const sales = await Sales.aggregate([
        match,
        group,
        frOhCom,
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