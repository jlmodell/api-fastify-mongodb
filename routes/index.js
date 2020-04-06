// const userController = require('./user.auth.route')
const saleController = require('../controllers/sale.controller')

// const routes = [
//     {
//         method: "GET",
//         url: "/api/sale/item",
//         preHandler: [fastify.auth],
//         handler: saleController.getSalesForPeriodByItem
//     }
// ]

/*

    curl -d '{"start":"2019-01-01", "end":"2019-12-31", "item":"2914"}' -H 'Content-Type: application/json' http://localhost:9090/api/sale/item

*/

async function Router(fastify) {
    fastify.get('/api/sale/item', { preValidation: [fastify.auth], handler: saleController.getSalesForPeriodByItem })
}

module.exports = Router


