const Sales = require('../models/sales.model')
const helper = require("./helpers/processing")
const {DEFAULT_AGG, TRADEFEES_AGG_FOR_REDUCER, CALC_FR_OH_COMM, TRADEFEES, GP, GPM, AVG_SALE_PRICE, AVG_DISCOUNTED_PRICE, SALES_BY_QUANT_AGGREGATION} = require('../utilities/mongodb.aggregations')
// const boom = require('boom')

const sample_data = [
	{
		_id: '5e8f45af7f3b7b39cbd86ca1',
		ID: '19092*587*4',
		SONBR: '486412',
		DATE: '2020-04-08T00:00:00.000Z',
		CUST: '1716',
		CNAME: 'MEDLINE-MUNDELEIN',
		ITEM: '280',
		INAME: 'Ster 8MM Cvd Curette/25',
		QTY: 0,
		SALE: 0,
		COST: 0,
		REBATECREDIT: -3.75
	},
	{
		_id: '5e8f45af7f3b7b39cbd86ca2',
		ID: '19090*115*11',
		SONBR: '498450',
		DATE: '2020-04-06T00:00:00.000Z',
		CUST: '2614',
		CNAME: 'CONCORDANCE-SENECA-TIFFIN-IMCO',
		ITEM: '723',
		INAME: 'Ster Suture Removal/50',
		QTY: 10,
		SALE: 912,
		COST: 346.3,
		REBATECREDIT: 0
	},
	{
		_id: '5e8f45af7f3b7b39cbd86ca3',
		ID: '19092*588*4',
		SONBR: '496539',
		DATE: '2020-04-08T00:00:00.000Z',
		CUST: '1716',
		CNAME: 'MEDLINE-MUNDELEIN',
		ITEM: '281',
		INAME: 'Ster 9MM Cvd Curette/25',
		QTY: 0,
		SALE: 0,
		COST: 0,
		REBATECREDIT: -46.75
	},
	{
		_id: '5e8f45af7f3b7b39cbd86ca4',
		ID: '19092*589*4',
		SONBR: '491979',
		DATE: '2020-04-08T00:00:00.000Z',
		CUST: '1716',
		CNAME: 'MEDLINE-MUNDELEIN',
		ITEM: '281',
		INAME: 'Ster 9MM Cvd Curette/25',
		QTY: 0,
		SALE: 0,
		COST: 0,
		REBATECREDIT: -7.48
	},
	{
		_id: '5e8f45af7f3b7b39cbd86ca5',
		ID: '19087*383*11',
		SONBR: '498353',
		DATE: '2020-04-03T00:00:00.000Z',
		CUST: '1404',
		CNAME: 'MCKESSON/RICHMOND-CORPORATE',
		ITEM: '151',
		INAME: 'Ster 1/2"Tubing&Handle/25',
		QTY: 1,
		SALE: 140.75,
		COST: 92.8,
		REBATECREDIT: 0
	},
	{
		_id: '5e8f53bb81055448ff2eed7d',
		ID: '19092*590*4',
		SONBR: '494313',
		DATE: '2020-04-08T00:00:00.000Z',
		CUST: '1716',
		CNAME: 'MEDLINE-MUNDELEIN',
		ITEM: '282',
		INAME: 'Ster 10MM Cvd Curette/25',
		QTY: 0,
		SALE: 0,
		COST: 0,
		REBATECREDIT: -46.75
	},
	{
		_id: '5e8f53bb81055448ff2eed7e',
		ID: '19091*351*27',
		SONBR: '462577',
		DATE: '2020-04-07T00:00:00.000Z',
		CUST: '2084',
		CNAME: 'O&M/CORPORATE',
		ITEM: '904',
		INAME: 'Post Mortem Kit White/10',
		QTY: 0,
		SALE: 0,
		COST: 0,
		REBATECREDIT: -2.92
	},
	{
		_id: '5e8f53bb81055448ff2eed7f',
		ID: '19092*591*4',
		SONBR: '494501',
		DATE: '2020-04-08T00:00:00.000Z',
		CUST: '1716',
		CNAME: 'MEDLINE-MUNDELEIN',
		ITEM: '282',
		INAME: 'Ster 10MM Cvd Curette/25',
		QTY: 0,
		SALE: 0,
		COST: 0,
		REBATECREDIT: -44.88
	},
	{
		_id: '5e8f53bb81055448ff2eed80',
		ID: '19092*592*4',
		SONBR: '497570',
		DATE: '2020-04-08T00:00:00.000Z',
		CUST: '1716',
		CNAME: 'MEDLINE-MUNDELEIN',
		ITEM: '283',
		INAME: 'Ster 11MM Cvd Curette/ 25',
		QTY: 0,
		SALE: 0,
		COST: 0,
		REBATECREDIT: -93.5
	},
	{
		_id: '5e8f53bb81055448ff2eed81',
		ID: '19091*85*16',
		SONBR: '498434',
		DATE: '2020-04-07T00:00:00.000Z',
		CUST: '1716',
		CNAME: 'MEDLINE-MUNDELEIN',
		ITEM: '298',
		INAME: 'Ster Yank w/o vent blb/50',
		QTY: 8,
		SALE: 736,
		COST: 127.6,
		REBATECREDIT: 0
	},
	{
		_id: '5e8f53bb81055448ff2eed82',
		ID: '19092*593*4',
		SONBR: '491746',
		DATE: '2020-04-08T00:00:00.000Z',
		CUST: '1716',
		CNAME: 'MEDLINE-MUNDELEIN',
		ITEM: '284',
		INAME: 'Ster 12MM Cvd Curette/ 25',
		QTY: 0,
		SALE: 0,
		COST: 0,
		REBATECREDIT: -140.25
	},
	{
		_id: '5e8f53bb81055448ff2eed83',
		ID: '19091*85*27',
		SONBR: '497214',
		DATE: '2020-04-07T00:00:00.000Z',
		CUST: '2084',
		CNAME: 'O&M/CORPORATE',
		ITEM: '235',
		INAME: 'BLUE GOWN/THUMBCUFF/75',
		QTY: 0,
		SALE: 0,
		COST: 0,
		REBATECREDIT: -45.8
	},
	{
		_id: '5e8f53bb81055448ff2eed84',
		ID: '19092*594*4',
		SONBR: '485705',
		DATE: '2020-04-08T00:00:00.000Z',
		CUST: '1234',
		CNAME: 'MEDLINE-MUNDELEIN',
		ITEM: '284',
		INAME: 'Ster 12MM Cvd Curette/ 25',
		QTY: 0,
		SALE: 0,
		COST: 0,
		REBATECREDIT: -44.88
	},
	{
		_id: '5e8f53bb81055448ff2eed85',
		ID: '19092*60*16',
		SONBR: '498499',
		DATE: '2020-04-08T00:00:00.000Z',
		CUST: '1300',
		CNAME: 'CARDINAL HEALTH/ACCT PAYABLE',
		ITEM: '901',
		INAME: 'Post Mortem Bag White/10',
		QTY: 1,
		SALE: 77.05,
		COST: 31.37,
		REBATECREDIT: 0
	},
	{
		_id: '5e8f53bb81055448ff2eed86',
		ID: '19092*595*4',
		SONBR: '497896',
		DATE: '2020-04-08T00:00:00.000Z',
		CUST: '1716',
		CNAME: 'MEDLINE-MUNDELEIN',
		ITEM: '285',
		INAME: 'Ster 14MM Cvd Curette/ 25',
		QTY: 0,
		SALE: 0,
		COST: 0,
		REBATECREDIT: -94.6
	},
	{
		_id: '5e8f53bb81055448ff2eed87',
		ID: '19092*596*4',
		SONBR: '497898',
		DATE: '2020-04-08T00:00:00.000Z',
		CUST: '1716',
		CNAME: 'MEDLINE-MUNDELEIN',
		ITEM: '285',
		INAME: 'Ster 14MM Cvd Curette/ 25',
		QTY: 0,
		SALE: 0,
		COST: 0,
		REBATECREDIT: -94.6
	}
];

exports.getSalesForPeriodByItem_ = async (req, reply) => {
    var {start, end, ff, ohf, item, cust} = req.query
    if (!ff) ff = 2
	if (!ohf) ohf = 1    
	
	const find_object = (start, end, item, cust) => {
		if (!item && cust) {
			return {
				DATE: { $gte: new Date(start), $lte: new Date(end)}, CUST: {$in: cust.split(",")}
			}
		} else if (item && !cust) {
			return {
				DATE: { $gte: new Date(start), $lte: new Date(end)}, ITEM: {$in: item.split(",")}
			}
		} else if (item && cust) {
			return {
				DATE: { $gte: new Date(start), $lte: new Date(end)}, ITEM: {$in: item.split(",")}, CUST: {$in: cust.split(",")}
			}
		} else {
			return {
				DATE: { $gte: new Date(start), $lte: new Date(end)}
			}
		}
	}

    const sales = await Sales.find(find_object(start,end,item,cust)).lean().exec()
        
	const data = helper.MAP_PROCESSOR(ff, ohf, sales)	

    reply
        .code(201)
        .send({data: data})
}

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