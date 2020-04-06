exports.Aggregations = (start, end, item, cust) => {
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
                    freight: { $sum: { $round: [ '$FREIGHT', 2 ] } },
                    overhead: { $sum: { $round: [ '$OVERHEAD', 2 ] } },
                    commissions: { $sum: { $round: [ '$COMMISSIONS', 2 ] } },
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
                    // tradefees: { $sum: { $round: [ '$TRADEFEES', 2 ] } },
                    freight: { $sum: { $round: [ '$FREIGHT', 2 ] } },
                    overhead: { $sum: { $round: [ '$OVERHEAD', 2 ] } },
                    commissions: { $sum: { $round: [ '$COMMISSIONS', 2 ] } },
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
                    freight: { $sum: { $round: [ '$FREIGHT', 2 ] } },
                    overhead: { $sum: { $round: [ '$OVERHEAD', 2 ] } },
                    commissions: { $sum: { $round: [ '$COMMISSIONS', 2 ] } },
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
                    freight: { $sum: { $round: [ '$FREIGHT', 2 ] } },
                    overhead: { $sum: { $round: [ '$OVERHEAD', 2 ] } },
                    commissions: { $sum: { $round: [ '$COMMISSIONS', 2 ] } },
				}
			}
		];
    }

	return aggregation;
};

exports.tradefees = {
    $addFields: {
        tradefees: {
            $cond: {
                if: { $gt: [ '$sales', 0 ] },
                then: { $switch: {
                    branches: [
                        { 
                            case: [ "$_id.cid", 8497 ],
                            then: {
                                $round: [ { $multiply: [ "$sales", 0 ] }, 2 ]
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

exports.grossProfit = {
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

exports.grossProfitMargin = {
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

exports.avgSalePrice = {
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

exports.avgSalePriceAfterDiscounts = {
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