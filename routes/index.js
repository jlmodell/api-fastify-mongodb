const salesController = require('../controllers/sales.controller')

async function Router(fastify) {
    /**
     * route => /api/sales
     */
    fastify.get('/api/sales', { preValidation: [fastify.auth], handler: salesController.getSalesByPeriod})

    /*
        route => /api/sale/q_s_pd
        test =>
            curl -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Im1vZGVsbC5qZWZmQG1lLmNvbSIsImlhdCI6MTU4NjE3MTQwNCwiZXhwIjoxNTg3NDY3NDA0fQ.vfSZm7Y4mYPBMFeiXuFHvKPuvy71sx3jIjnlB4dUWgo" "http://localhost:9090/api/sale/q_s_pd?start=2019-01-01&end=2019-12-31&item=2914"
        response =>
            {
                "data":
                    [
                        {
                            "_id":{
                                "date":"2019-10-02T04:00:00.000Z"
                            },
                            "quantity":500
                        }
                    ]
            }
    */
    fastify.get('/api/sale/q_s_pd', { preValidation: [fastify.auth], handler: salesController.getQtySoldPerDay})

    /*
        route => 
            /api/sale/item
        test =>
            curl -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Im1vZGVsbC5qZWZmQG1lLmNvbSIsImlhdCI6MTU4NjE3MTQwNCwiZXhwIjoxNTg3NDY3NDA0fQ.vfSZm7Y4mYPBMFeiXuFHvKPuvy71sx3jIjnlB4dUWgo" "http://localhost:9090/api/sale/item?start=2019-01-01&end=2019-12-31&item=2914"    
        response =>
            {
                "data":
                    [
                        {
                            "_id":{
                                "customer":"CARDINAL HEALTH",
                                "cid":"8497"
                            },
                            "quantity":500,
                            "sales":15800,
                            "costs":17720,
                            "rebates":0,
                            "tradefees":0,
                            "freight":0,
                            "overhead":0,
                            "commissions":0,
                            "grossProfit":-1920,
                            "grossProfitMargin":-12.15,
                            "avgSalePrice":31.6,
                            "avgSalePriceAfterDiscounts":31.6
                        }
                    ]
            }
    */
    fastify.get('/api/sale/item', { preValidation: [fastify.auth], handler: salesController.getSalesForPeriodByItem })
    /*
        route =>
            /api/sale/cust
        test =>
            curl -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Im1vZGVsbC5qZWZmQG1lLmNvbSIsImlhdCI6MTU4NjE3MTQwNCwiZXhwIjoxNTg3NDY3NDA0fQ.vfSZm7Y4mYPBMFeiXuFHvKPuvy71sx3jIjnlB4dUWgo" "http://localhost:9090/api/sale/cust?start=2019-01-01&end=2019-12-31&cust=8497"
        response =>
            "data":
                [
                    {
                        "_id": {
                            "item": "C/Health K73...",
                            "iid": "1644"
                        },
                        "quantity": 3769,
                        "sales": 230662.8
                        ...
                        "avgSalePriceAfterDiscounts": 61.2
                    }
                ]
    */
    fastify.get('/api/sale/cust', { preValidation: [fastify.auth], handler: salesController.getSalesForPeriodByCust })
}

module.exports = Router