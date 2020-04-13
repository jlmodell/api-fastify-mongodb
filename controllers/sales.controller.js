const Sales = require('../models/sales.model')
const {DEFAULT_AGG, TRADEFEES_AGG_FOR_REDUCER, CALC_FR_OH_COMM, TRADEFEES, GP, GPM, AVG_SALE_PRICE, AVG_DISCOUNTED_PRICE, SALES_BY_QUANT_AGGREGATION} = require('../utilities/mongodb.aggregations')
// const boom = require('boom')

exports.getSalesByPeriod = async (req, reply) => {
    const start = req.query.start
    const end = req.query.end
    const freightFactor = parseFloat(req.query.ff)
    const overheadFactor = parseFloat(req.query.ohf)

    const [tf_match, tf_group] = TRADEFEES_AGG_FOR_REDUCER(start, end)
    const [match, group] = DEFAULT_AGG(start, end, item=null, cust=null)  
    const frOhCom = CALC_FR_OH_COMM(freightFactor, overheadFactor)

    const tf = await Sales.aggregate([
        tf_match,
        tf_group,
        TRADEFEES,
        {$unwind: '$sales'},
        {$sort: {sales: -1}}
    ])

    const tf_final = tf.map(function(x,_){
        return { iid: x._id.iid, tradefees: x.tradefees}
    })
    .reduce((r, {iid, tradefees}) => {
        var temp = r.find(o => iid === o.iid)
        
        if (!temp) {
            r.push(temp = { iid, tradefees: 0})
        }        
        temp.tradefees += tradefees
        
        return r
    },[])

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

    const final_sales = sales.map(({_id, quantity, sales, costs, rebates, freight, overhead, commissions, avgSalePrice, grossProfit, grossProfitMargin}) => ({
        _id, 
        quantity,
        sales,
        costs,
        rebates,
        freight,
        overhead,
        commissions,
        avgSalePrice,
        tradefees: tf_final.filter(obj => obj.iid === _id.iid).map(obj => obj.tradefees)[0],
        grossProfit: grossProfit - tf_final.filter(obj => obj.iid === _id.iid).map(obj => obj.tradefees)[0],
        grossProfitMargin: ((grossProfit - tf_final.filter(obj => obj.iid === _id.iid).map(obj => obj.tradefees)[0]) / sales) * 100
    }))

    reply.code(201).send({ data: final_sales })

}

exports.getSalesForPeriodByItem = async (req, reply) => {
    const start = req.query.start
    const end = req.query.end
    const item = req.query.item
    const freightFactor = parseFloat(req.query.ff)
    const overheadFactor = parseFloat(req.query.ohf)

    const [match, group] = DEFAULT_AGG(start, end, item, cust=null)    
    const frOhCom = CALC_FR_OH_COMM(freightFactor, overheadFactor)
    const [tf_match, tf_group] = TRADEFEES_AGG_FOR_REDUCER(start, end)

    const tf = await Sales.aggregate([
        tf_match,
        tf_group,
        TRADEFEES,
        {$unwind: '$sales'},
        {$sort: {sales: -1}}
    ])

    const tf_final = tf.map(function(x,_){
        return { iid: x._id.iid, tradefees: x.tradefees}
    })
    .reduce((r, {iid, tradefees}) => {
        var temp = r.find(o => iid === o.iid)
        
        if (!temp) {
            r.push(temp = { iid, tradefees: 0})
        }        
        temp.tradefees += tradefees
        
        return r
    },[])

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

    const final_sales = sales.map(({_id, quantity, sales, costs, rebates, freight, overhead, commissions, avgSalePrice, grossProfit}) => ({
        _id, 
        quantity,
        sales,
        costs,
        rebates,
        freight,
        overhead,
        commissions,
        avgSalePrice,
        avgSalePriceAfterDiscounts: (quantity > 0 && (sales - rebates - tf_final.filter(obj => obj.iid === _id.iid).map(obj => obj.tradefees)[0]) > 0) ? (sales - rebates - tf_final.filter(obj => obj.iid === _id.iid).map(obj => obj.tradefees)[0]) / quantity : avgSalePrice,
        tradefees: tf_final.filter(obj => obj.iid === _id.iid).map(obj => obj.tradefees)[0],
        grossProfit: (quantity > 0 && (sales - rebates - freight - overhead - commissions - tf_final.filter(obj => obj.iid === _id.iid).map(obj => obj.tradefees)[0]) > 0) ? grossProfit - tf_final.filter(obj => obj.iid === _id.iid).map(obj => obj.tradefees)[0] : 0,
        grossProfitMargin: (sales > 0) ? ((grossProfit - tf_final.filter(obj => obj.iid === _id.iid).map(obj => obj.tradefees)[0]) / sales) * 100 : 0
    }))

    if (!item) {
        reply.code(201).send({ data: final_sales })
    } else {
        reply.code(201).send({ data: sales })
    }

    
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