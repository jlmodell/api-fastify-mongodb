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

// test for mongo shell
aggregations = [
    {
        $match: {
            DATE: {$gte: new Date("2020-04-16"), $lte: new Date("2020-04-16")},
            ITEM: "911"
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