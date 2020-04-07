const Sales = require('../models/sales.model')
const {DEFAULT_AGG, CALC_FR_OH_COMM, TRADEFEES, GP, GPM, AVG_SALE_PRICE, AVG_DISCOUNTED_PRICE, SALES_BY_QUANT_AGGREGATION} = require('../utilities/mongodb.aggregations')
// const boom = require('boom')


exports.getSalesForPeriodByItem = async (req, reply) => {
    const start = req.query.start
    const end = req.query.end
    const item = req.query.item
    const freightFactor = parseFloat(req.query.ff)
    const overheadFactor = parseFloat(req.query.ohf)

    const [match, group] = DEFAULT_AGG(start, end, item, cust=null)
    const frOhCom = CALC_FR_OH_COMM(freightFactor, overheadFactor)

    const sales = await Sales.aggregate([
        match,
        group,
        frOhCom,
        TRADEFEES,
        GP,
        GPM,
        AVG_SALE_PRICE,
        AVG_DISCOUNTED_PRICE,
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

    const [match, group] = DEFAULT_AGG(start, end, item=null, cust)
    const frOhCom = CALC_FR_OH_COMM(freightFactor, overheadFactor)

    const sales = await Sales.aggregate([
        match,
        group,
        frOhCom,
        TRADEFEES,
        GP,
        GPM,
        AVG_SALE_PRICE,
        AVG_DISCOUNTED_PRICE,
        {$unwind: '$sales'},
        {$sort: {sales: -1}}
    ])        

    reply.code(201).send({ data: sales })
}

exports.getQtySoldPerDay = async (req, reply) => {
    const start = req.query.start
    const end = req.query.end
    const item = req.query.item

    const [match, group] = SALES_BY_QUANT_AGGREGATION(start, end, item)

    const sales = await Sales.aggregate([
        match,
        group,
        { $sort: {
            _id: 1
        }}   
    ])

    reply.code(201).send({ data: sales })
}