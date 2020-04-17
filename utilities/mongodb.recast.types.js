// bulk edit to convert types 
var bulk = db.sales.initializeUnorderedBulkOp(),
    count = 0;

db.sales.find({"COST": { "$type": 16 }}).forEach(function(doc) {  // 1
    bulk.find({ "_id": doc._id })
        .updateOne({ 
            "$set": { "b": doc.COST.valueOf() } ,     // 2
            "$unset": { "COST": 1 }  // 3
        });
    bulk.find({ "_id": doc._id })
        .updateOne({ "$rename": { "b": "COST" } });  // 4
    count++;
    if ( count % 7500 == 0 ) {
        bulk.execute()
        bulk = db.sales.initializeUnOrderedBulkOp();
    }
})

if ( count % 7500 != 0 ) bulk.execute();



var tf_obj = {
    '1300': 0.075,
    '1200': 0.02,
    '2250': 0.02,
    '2772': 0.02,
    '8497': 0.02,
    '2091': 0.03,
    '1716': 0.05,
    '1719': 0.02,
    '9988': 0.1,
    '1402': 0.07,
    '1404': 0.07,
    '2084': 0.04308,
    '2614': 0.01,
    '5214': 0.02,
    '1070': 0.01
};

db.sales.find({
    TRADEFEE: {$exists: false}
}).forEach(doc => {
    doc.FREIGHT = doc.QTY * 2;
    doc.OVERHEAD = doc.QTY;

    if (doc.QTY !== 0 && doc.SALE > 0 && tf_obj[doc.CUST]) {
        doc.TRADEFEE = tf_obj[doc.CUST] * doc.SALE
    } else {
        doc.TRADEFEE = 0
    }

    if (doc.QTY !== 0) {
        doc.COMMISSION = doc.SALE * 0.02
    } else {
        doc.COMMISSION = 0
    }
    
    if (doc.QTY === 0 && doc.SALE < 0) {
        doc.REBATECREDIT = doc.SALE
        doc.SALE = 0
    } else {
        doc.REBATECREDIT = 0
    }
    printjson(doc)
    db.sales.save(doc)
})








// test for mongo shell
aggregations = [
    {
        $match: {
            DATE: {$gte: new Date("2020-04-15"), $lte: new Date("2020-04-15")},
            ITEM: "9665R1"
        }
    },
    {
        $group: {
            _id: null,
            qty: {$sum: "$QTY"},
            sale: {$sum: "$SALE"},
            cost: {$sum: "$COST"},
            rebate: {$sum: "$REBATECREDIT"},
        }
    }
]

db.sales.aggregate([
    {
        $match: {
            DATE: {$gte: new Date("2018-04-16"), $lte: new Date("2020-04-15")},
            ITEM: "723"
        }
    },
    {
        $group: {
            _id: null,
            qty: {$sum: "$QTY"},
            sale: {$sum: "$SALE"},
            cost: {$sum: "$COST"},
            rebate: {$sum: "$REBATECREDIT"},
        }
    }
])



