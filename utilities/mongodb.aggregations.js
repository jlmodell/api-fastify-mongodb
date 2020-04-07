exports.DEFAULT_AGG = (start, end, item, cust) => {
	let aggregation;

	if (item && !cust) {
		aggregation = [
			{
				$match: {
					DATE: { $gte: new Date(start), $lte: new Date(end) },
					ITEM: item
				}
			},
			{
				$group: {
					_id: {
						customer: '$CNAME',
						cid: '$CUST'
					},
					quantity: { $sum: '$QTY' },
					sales: { $sum: { $round: [ '$SALE', 2 ] } },
					costs: { $sum: { $round: [ '$COST', 2 ] } },
					rebates: { $sum: { $round: [ { $multiply: [ '$REBATECREDIT', -1 ] }, 2 ] } },
                    // tradefees: { $sum: { $round: [ '$TRADEFEES', 2 ] } },
                    // freight: { $sum: { $round: [ '$FREIGHT', 2 ] } },
                    // overhead: { $sum: { $round: [ '$OVERHEAD', 2 ] } },
                    // commissions: { $sum: { $round: [ '$COMMISSIONS', 2 ] } },
				}
			}
		];
	} else if (cust && !item) {
		aggregation = [
			{
				$match: {
					DATE: { $gte: new Date(start), $lte: new Date(end) },
					CUST: cust
				}
			},
			{
				$group: {
					_id: {
						item: '$INAME',
						iid: '$ITEM'
					},
					quantity: { $sum: '$QTY' },
					sales: { $sum: { $round: [ '$SALE', 2 ] } },
					costs: { $sum: { $round: [ '$COST', 2 ] } },
                    rebates: { $sum: { $round: [ { $multiply: [ '$REBATECREDIT', -1 ] }, 2 ] } },
                    // // tradefees: { $sum: { $round: [ '$TRADEFEES', 2 ] } },
                    // freight: { $sum: { $round: [ '$FREIGHT', 2 ] } },
                    // overhead: { $sum: { $round: [ '$OVERHEAD', 2 ] } },
                    // commissions: { $sum: { $round: [ '$COMMISSIONS', 2 ] } },
				}
			}
		];
	} else if (item && cust) {
		aggregation = [
			{
				$match: {
					DATE: { $gte: new Date(start), $lte: new Date(end) },
					CUST: cust,
					ITEM: item
				}
			},
			{
				$group: {
					_id: {
						customer: '$CNAME',
						cid: '$CUST',
						item: '$INAME',
						iid: '$ITEM'
					},
					quantity: { $sum: '$QTY' },
					sales: { $sum: { $round: [ '$SALE', 2 ] } },
					costs: { $sum: { $round: [ '$COST', 2 ] } },
					rebates: { $sum: { $round: [ { $multiply: [ '$REBATECREDIT', -1 ] }, 2 ] } },
                    // tradefees: { $sum: { $round: [ '$TRADEFEES', 2 ] } },
                    // freight: { $sum: { $round: [ '$FREIGHT', 2 ] } },
                    // overhead: { $sum: { $round: [ '$OVERHEAD', 2 ] } },
                    // commissions: { $sum: { $round: [ '$COMMISSIONS', 2 ] } },
				}
			}
		];
	} else {
        aggregation = [
			{
				$match: {
					DATE: { $gte: new Date(start), $lte: new Date(end) },
				}
			},
			{
				$group: {
					_id: {
						sterility: "$STER",
					},
					quantity: { $sum: '$QTY' },
					sales: { $sum: { $round: [ '$SALE', 2 ] } },
					costs: { $sum: { $round: [ '$COST', 2 ] } },
					rebates: { $sum: { $round: [ { $multiply: [ '$REBATECREDIT', -1 ] }, 2 ] } },
                    // tradefees: { $sum: { $round: [ '$TRADEFEES', 2 ] } },
                    // freight: { $sum: { $round: [ '$FREIGHT', 2 ] } },
                    // overhead: { $sum: { $round: [ '$OVERHEAD', 2 ] } },
                    // commissions: { $sum: { $round: [ '$COMMISSIONS', 2 ] } },
				}
			}
		];
    }

	return aggregation;
};

exports.CALC_FR_OH_COMM = function(freightFactor, overheadFactor) {	
	let ff = freightFactor;
	let ohf = overheadFactor;

	if (!ff) ff = 2
	if (!ohf) ohf = 1

	return {
		$addFields: {
			freight: {
				$cond: {
					if: { $in: [ '$_id.cid', [ "8497" ] ] },
					then: 0,
					else: { $multiply: [ '$quantity', ff ] }
				}
			},
			overhead: {
				$cond: {
					if: { $in: [ '$_id.cid', [ "8497" ] ] },
					then: 0,
					else: { $multiply: [ '$quantity', ohf ] }
				}
			},
			commissions: {
				$cond: {
					if: { $in: [ '$_id.cid', [ "8497" ] ] },
					then: 0,
					else: { $round: [ { $multiply: [ '$sales', .02 ] }, 2 ] },
				}
			},
		}
	}
} 

exports.TRADEFEES = {
    $addFields: {
        tradefees: {
            $cond: {
                if: { $gt: [ '$sales', 0 ] },
                then: { $switch: {
                    branches: [
                        { 
                            case: { $eq: [ "$_id.cid", "1300" ] },
                            then: {
                                $round: [ { $multiply: [ "$sales", 0.075 ] }, 2 ]
                            }
                        },
                        { 
                            case: { $eq: [ "$_id.cid", "1200" ] },
                            then: {
                                $round: [ { $multiply: [ "$sales", 0.020 ] }, 2 ]
                            }
                        },
                        { 
                            case: { $eq: [ "$_id.cid", "2250" ] },
                            then: {
                                $round: [ { $multiply: [ "$sales", 0.020 ] }, 2 ]
                            }
                        },
                        { 
                            case: { $eq: [ "$_id.cid", "2772" ] },
                            then: {
                                $round: [ { $multiply: [ "$sales", 0.020 ] }, 2 ]
                            }
                        },
                        { 
                            case: { $eq: [ "$_id.cid", "8497" ] },
                            then: {
                                $round: [ { $multiply: [ "$sales", 0.020 ] }, 2 ]
                            }
                        },
                        { 
                            case: { $eq: [ "$_id.cid", "2091" ] },
                            then: {
                                $round: [ { $multiply: [ "$sales", 0.030 ] }, 2 ]
                            }
                        },
                        { 
                            case: { $eq: [ "$_id.cid", "1716" ] },
                            then: {
                                $round: [ { $multiply: [ "$sales", 0.050 ] }, 2 ]
                            }
                        },
                        { 
                            case: { $eq: [ "$_id.cid", "1719" ] },
                            then: {
                                $round: [ { $multiply: [ "$sales", 0.020 ] }, 2 ]
                            }
                        },
                        { 
                            case: { $eq: [ "$_id.cid", "9988" ] },
                            then: {
                                $round: [ { $multiply: [ "$sales", 0.100 ] }, 2 ]
                            }
                        },
                        { 
                            case: { $eq: [ "$_id.cid", "1402" ] },
                            then: {
                                $round: [ { $multiply: [ "$sales", 0.070 ] }, 2 ]
                            }
                        },
                        { 
                            case: { $eq: [ "$_id.cid", "1404" ] },
                            then: {
                                $round: [ { $multiply: [ "$sales", 0.070 ] }, 2 ]
                            }
                        },
                        { 
                            case: { $eq: [ "$_id.cid", "2084" ] },
                            then: {
                                $round: [ { $multiply: [ "$sales", 0.04308 ] }, 2 ]
                            }
                        },
                        { 
                            case: { $eq: [ "$_id.cid", "2614" ] },
                            then: {
                                $round: [ { $multiply: [ "$sales", 0.010 ] }, 2 ]
                            }
                        },
                        { 
                            case: { $eq: [ "$_id.cid", "5214" ] },
                            then: {
                                $round: [ { $multiply: [ "$sales", 0.020 ] }, 2 ]
                            }
                        },
                        { 
                            case: { $eq: [ "$_id.cid", "1070" ] },
                            then: {
                                $round: [ { $multiply: [ "$sales", 0.010 ] }, 2 ]
                            }
						},
						{
							case: { $regexMatch: { input: "$_id.customer", regex: "IMCO" } },
							then: {
								$round: [ { $multiply: [ "$sales", 0.010 ] }, 2 ]
							}
						}
                    ],
                    default: 0
                }},
                else: 0
            }
        }
    }
}

exports.GP = {
	$addFields: {
		grossProfit: {
			$cond: {
                if: { $or: [{ $lte: ['$quantity', 0]}, {$lte: ['$sales', { $add: ['$rebates','$tradefees','$commissions','$freight','$overhead']}]}] },
                then: 0,
                else: {
                    $round: [
                        {
                            $subtract: [
                                '$sales',
                                { $add: [ '$costs', '$tradefees', '$freight', '$overhead', '$rebates', '$commissions' ] }
                            ]
                        },
                        2
                    ]
                }
            }
		}
	}
};

exports.GPM = {
	$addFields: {
		grossProfitMargin: {
			$cond: {
				if: { $gt: [ '$sales', 0 ] },
				then: { $round: [ { $multiply: [ { $divide: [ '$grossProfit', '$sales' ] }, 100 ] }, 2 ] },
				else: 0
			}
		}
	}
};

exports.AVG_SALE_PRICE = {
	$addFields: {
		avgSalePrice: {
			$cond: {
				if: { $gt: [ '$sales', 0 ], $gt: [ '$quantity', 0 ] },
				then: {
					$round: [
						{
							$divide: [ '$sales', '$quantity' ]
						},
						2
					]
				},
				else: 0
			}
		}
	}
};

exports.AVG_DISCOUNTED_PRICE = {
	$addFields: {
		avgSalePriceAfterDiscounts: {
			$cond: {
				if: { $gt: [ { $subtract: [ '$sales', { $add: ['$rebates','$tradefees','$commissions','$freight','$overhead']} ] }, 0 ] },
				then: {
					$round: [
						{
							$divide: [
								{ $subtract: [ '$sales', { $add: [ '$tradefees', '$rebates' ] } ] },
								'$quantity'
							]
						},
						2
					]
				},
				else: 0
			}
		}
	}
};

exports.SALES_BY_QUANT_AGGREGATION = (start, end, item) => {    
    return [
        {
            $match: {
                DATE: { $gte: new Date(start), $lte: new Date(end) },
                ITEM: item
            }
        },
        {
            $group: {
                _id: {
                    date: '$DATE',                    
                },
                quantity: { $sum: '$QTY' },                
            }
        }
    ]
}