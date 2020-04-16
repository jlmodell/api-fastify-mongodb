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
        temp.rebates += cur.REBATECREDIT;        

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