const Sale = require('../models/user.model')
// const boom = require('boom')

exports.getSalesForPeriodByItem = async (req, reply) => {
    const start = req.query.start
    const end = req.query.end
    const item = req.query.item

    console.log(start,end,item)

    // const sale = await Sale.aggregate([
    //     {
    //         $match: {
    //             // DATE: {
    //             //     $gte: new Date(start),
    //             //     $lte: new Date(end)
    //             // },
    //             ITEM: item
    //         }
    //     }
    // ])

    const sale = await Sale.find({ DATE: { $gte: start }})

    console.log(sale)

    reply
        .code(200)
        .send({ data: sale })
}