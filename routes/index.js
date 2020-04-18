const salesController = require('../controllers/sales.controller')
const itemController = require("../controllers/items.name.controller")

async function Router(fastify) {
    /**
     * TODO: build opposite endpoint -> customer_
     * 
     * route => /api/sales/item_
     * 
     * params: start, end, item, cust
     * 
     * requires token? yes
     * 
     * response = data: [] of items with general sales data with customer as a child array; filtered if item or cust or both are supplied
     * 
     */
    fastify.get('/api/sales/item_', { preValidation: [fastify.auth], handler: salesController.getSalesForPeriodByItem_})

    /**
     * TODO: optimize
     * 
     * /api/sale/q_s_pd   [quantity sold per day]
     * 
     * params: start, end, item
     * 
     * requires token? yes
     * 
     * response = data: [] of dates with total quantity sold per day of "x" item
     * 
     */
    fastify.get('/api/sale/q_s_pd', { preValidation: [fastify.auth], handler: salesController.getQtySoldPerDay})

    /**
     * TODO: optimize
     * 
     * /api/item_description
     * 
     * require token? no
     * 
     */
    fastify.get('/api/item_description', {handler: itemController.getItemDescription})

    /**
     * RETIRED ENDPOINT
     * 
     * /api/sale/item
     * 
     * params: start, end, item
     * 
     * requires token? yes
     * 
     * response = "data": [] of customers who purchased "x" item with general sales data for the time period
     * 
     */
    fastify.get('/api/sale/item', { preValidation: [fastify.auth], handler: salesController.getSalesForPeriodByItem })
    
    /**
     * REITRED ENDPOINT
     * 
     * /api/sale/cust
     * 
     * params: start, end, cust
     * 
     * requires token? yes
     * 
     * response = "data": [] of items who were purchased by "x" customer with general sales data for the time period
     * 
     */
    fastify.get('/api/sale/cust', { preValidation: [fastify.auth], handler: salesController.getSalesForPeriodByCust })
}

module.exports = Router