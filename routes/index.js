const salesController = require('../controllers/sales.controller')

async function Router(fastify) {
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


/*

const variables = [
    { start: "2019-01-01", end: "2019-12-31", item: "2914", ff: "2", ohf: "2" },
    { start: "2018-01-01", end: "2018-12-31", item: "2914", ff: "2", ohf: "2" },
    { start: "2017-01-01", end: "2017-12-31", item: "2914", ff: "2", ohf: "2" },
   ]
   
for (let i=0;i<variables.length;i++) {
    fetch(`http://localhost:9090/api/sale/item?start=${variables[i].start}&end=${variables[i].end}&item=${variables[i].item}`,{
        method: "GET",
        headers: {Authorization: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Im1vZGVsbC5qZWZmQG1lLmNvbSIsImlhdCI6MTU4NjE3MTQwNCwiZXhwIjoxNTg3NDY3NDA0fQ.vfSZm7Y4mYPBMFeiXuFHvKPuvy71sx3jIjnlB4dUWgo"},
    }).then(res => res.json()).then(console.log)
}


*/