const Item = require('../models/item.model')
const helper = require('./helpers/processing')

/**
 * getItemDescription
 * 
 * /api/item_description
 * 
 */
exports.getItemDescription = async (req, reply) => {
    var {item} = req.query
    
    var reg = new RegExp(`^${item}`,"i")

    const item_description = await Item.find({item_id: reg}).exec()

    const response = item_description.map(item => {
        return {
            item_id: item.item_id,
            item_description: item.item_description
        }
    }).sort((a,b) => a.item_id.length - b.item_id.length)
    
    reply
        .code(201)
        .send(response)
}