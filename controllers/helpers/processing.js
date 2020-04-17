const helper = require('../../utilities/processor.switch')

/**
 * ff = freight factor = query params or defaults
 * ohf = overhead factor = query params or defaults
 * data = response from Model.find().lean().exec() call 
 */
exports.Processor = (ff, ohf, data) => {

    // reduces down to unique item / customer combinations
    const processing =  data.reduce((r, cur) => {        
        // console.log(cur)
        var temp = r.find((o) => cur.ITEM === o._id.iid && cur.CUST === o._id.cid);

        if (!temp) {
            r.push(temp = { 
                _id: {iid: cur.ITEM, item: cur.INAME, cid: cur.CUST, customer: cur.CNAME}, 
                quantity: 0, 
                sales: 0, 
                costs: 0, 
                rebates: 0,
                tradefees: 0,                            
            })
        }
        
        temp.quantity += cur.QTY;
        temp.sales += cur.SALE;
        temp.costs += cur.COST;       
        temp.rebates += cur.REBATECREDIT || 0;        

        return r
    },[])

    // further reduces down to unique items
    const result = processing.reduce((r, cur) => {       

        var temp = r.find(o => cur._id.iid === o._id.iid)

        if (!temp) {
            r.push(temp = {
                _id: {iid: cur._id.iid, item: cur._id.item},
                quantity: 0, 
                sales: 0, 
                costs: 0, 
                rebates: 0,
                tradefees: 0,                            
            })
        }

        temp.quantity += cur.quantity;
        temp.sales += cur.sales;
        temp.costs += cur.costs;               
        temp.rebates += cur.rebates;        

        return r
    },[])

    // map reduced array to final response objects
    const final = result.map(i => {
        
        let freight = i.quantity * ff
        let overhead = i.quantity * ohf
        let commissions = i.sales * 0.02
        let gp = i.sales - i.costs - -i.rebates - i.tradefees - freight - overhead - commissions
        let gpm = i.sales !== 0 ? gp / i.sales : 0
        let avgPrice = i.sales !== 0 && i.quantity !== 0 ? i.sales / i.quantity : 0
        let discSales = i.sales - (i.rebates *-1) - i.tradefees
        let avgPricePostDiscount = avgPrice !== 0 ? discSales / i.quantity : 0 

        return {
            _id: i._id,
            quantity: i.quantity,
            sales: i.sales,
            costs: i.costs,
            rebates: -i.rebates,
            tradefees: i.tradefees,
            freight: freight,
            overhead: overhead,
            commissions: commissions,
            grossProfit: gp,
            grossProfitMargin: gpm,
            avgSalePrice: avgPrice,
            avgSalePriceAfterDiscounts: avgPricePostDiscount
        }
    })

    return final
}

/**
 * Reimplementation of data processing using a MAP instead of array methods.
 * using a map significantly cuts down on processing from o(n) to o(1) in terms of
 * traversing the array to find a match vs retrieving from the map.
 */

const build_hashmap = (ff, ohf, data) => {
    return new Promise((resolve, reject) => {
        const map = new Map()
        
        data.forEach((doc) => {
            if (!map.has(doc.ITEM)) {
                map.set(doc.ITEM, {
                    customers_id: [],
                    customers_name: [],
                    item_desc: doc.INAME,
                    item_id: doc.ITEM,
                    quantity: 0,
                    quantity_details: [],                
                    sales: 0,
                    sales_details: [],
                    costs: 0,
                    costs_details: [],
                    tradefees: 0,
                    tradefees_details: [],
                    freight: 0,
                    overhead: 0,
                    commissions: 0,
                    rebates: 0,
                    rebate_details: []
                })
            }

            helper.tradefees(doc)
                .then(res => {
                    return doc.SALE * res
                })
                .then(tf => {
                    temp = map.get(doc.ITEM)
                        
                    temp.customers_id.push(doc.CUST)
                    temp.customers_name.push(doc.CNAME)
                    temp.rebate_details.push(doc.REBATECREDIT)
                    temp.quantity_details.push(doc.QTY)
                    temp.sales_details.push(doc.SALE)
                    temp.costs_details.push(doc.COST)
                    temp.tradefees_details.push(tf);
                        
                    map.set(doc.ITEM, {            
                        customers_id: temp.customers_id,            
                        customers_name: temp.customers_name,
                        item_desc: temp.item_desc,
                        item_id: temp.item_id,
                        quantity: temp.quantity + doc.QTY,
                        quantity_details: temp.quantity_details,
                        sales: temp.sales + doc.SALE,
                        sales_details: temp.sales_details,
                        costs: temp.costs + doc.COST,
                        costs_details: temp.costs_details,
                        tradefees: temp.tradefees + tf,
                        tradefees_details: temp.tradefee_details,
                        freight: temp.freight + (doc.QTY * ff),
                        overhead: temp.overhead + (doc.QTY * ohf),
                        commissions: temp.commissions + (doc.SALE * 0.02),
                        rebates: temp.rebates + doc.REBATECREDIT,
                        rebate_details: temp.rebate_details
                    })

                    resolve(map)
                })
                .catch((err) => reject(err))
                        
        })        
        
    })
}

exports.HASHMAP_PROCESSOR = async (ff, ohf, data) => {
    
    try {
        const map = await build_hashmap(ff, ohf, data)
        console.log(map)

        return Array.from(map.values()).map(res => {
            const { quantity, sales, costs, tradefees, freight, overhead, commissions, rebates } = res
    
            const customer_details = res.customers_id.reduce((arr, cur, ind) => {  
                var temp = arr.find(r => cur === r._id.cid)
    
                if (!temp) {
                    arr.push(temp = {
                        _id: { cid: cur, customer: res.customers_name[ind] },
                        quantity: 0,
                        sales: 0,
                        costs: 0,
                        tradefees: 0,
                        freight: 0,
                        overhead: 0,
                        commissions: 0,    
                        rebates: 0
                    })
                }
    
                temp.quantity += res.quantity_details[ind]
                temp.sales += res.sales_details[ind]
                temp.costs += res.costs_details[ind]
                temp.tradefees += res.tradefees_details[ind]
                temp.freight += res.quantity_details[ind] * ff
                temp.overhead += res.quantity_details[ind] * ohf
                temp.commissions += res.sales_details[ind] * 0.02
                temp.rebates += -res.rebate_details[ind]
    
                return arr                      
            },[])
    
            return {
                _id: { iid: res.item_id, item: res.item_desc },
                quantity,
                sales,
                costs,
                tradefees,
                freight,
                overhead,
                commissions,
                rebates: -rebates,
                customer_details                
            }
        }).sort((a,b) => b.sales - a.sales)   

    } catch(err) {
        console.log(err)
    }

}
