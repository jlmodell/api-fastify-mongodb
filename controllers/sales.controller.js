const Sales = require("../models/sales.model");
const helper = require("./helpers/processing");
const {
  DEFAULT_AGG,
  TRADEFEES_AGG_FOR_REDUCER,
  CALC_FR_OH_COMM,
  TRADEFEES,
  GP,
  GPM,
  AVG_SALE_PRICE,
  AVG_DISCOUNTED_PRICE,
  SALES_BY_QUANT_AGGREGATION,
} = require("../utilities/mongodb.aggregations");
// const boom = require('boom')

exports.getRawSales_byCust = async (req, reply) => {
  var { start, end, item, cust, state } = req.query;
  const base_query = {};

  base_query.DATE = { $gte: new Date(start), $lte: new Date(end) };

  if (item) {
    base_query.ITEM = { $in: item.split(",") };
  }

  if (state) {
    base_query.SHIP_TO_STATE = { $in: state.split(",") };
    base_query.SHIP_TO_COUNTRY = "USA";
  }

  if (cust && cust.startsWith("^")) {
    let temp = cust.split("^");
    var reg = new RegExp(`${temp[1]}`, "i");

    base_query.CNAME = reg;
  } else if (cust) {
    base_query.CUST = { $in: cust.split(",") };
  }

  const sales = await Sales.find(base_query).lean().exec();

  const processed = helper.process_raw_sales_by_cust(sales);

  reply.code(201).send({ data: processed });
};

exports.getRawSales_byItem = async (req, reply) => {
  var { start, end, item, cust, state } = req.query;
  const base_query = {};

  base_query.DATE = { $gte: new Date(start), $lte: new Date(end) };

  if (item) {
    base_query.ITEM = { $in: item.split(",") };
  }

  if (state) {
    base_query.SHIP_TO_STATE = { $in: state.split(",") };
    base_query.SHIP_TO_COUNTRY = "USA";
  }

  if (cust && cust.startsWith("^")) {
    let temp = cust.split("^");
    var reg = new RegExp(`${temp[1]}`, "i");

    base_query.CNAME = reg;
  } else if (cust) {
    base_query.CUST = { $in: cust.split(",") };
  }

  const sales = await Sales.find(base_query).lean().exec();

  const processed = helper.process_raw_sales_by_item(sales);

  reply.code(201).send({ data: processed });
};

exports.getRawSales_byState = async (req, reply) => {
  var { start, end, item, cust, state } = req.query;
  const base_query = {};

  base_query.DATE = { $gte: new Date(start), $lte: new Date(end) };

  if (item) {
    base_query.ITEM = { $in: item.split(",") };
  }

  if (state) {
    base_query.SHIP_TO_STATE = { $in: state.split(",") };
    base_query.SHIP_TO_COUNTRY = "USA";
  }

  if (cust && cust.startsWith("^")) {
    let temp = cust.split("^");
    var reg = new RegExp(`${temp[1]}`, "i");

    base_query.CNAME = reg;
  } else if (cust) {
    base_query.CUST = { $in: cust.split(",") };
  }

  const sales = await Sales.find(base_query).lean().exec();

  const processed = helper.process_raw_sales_by_state(sales);

  reply.code(201).send({ data: processed });
};

exports.getSales_ = async (req, reply) => {
  var { start, end, ff, ohf, item, cust } = req.query;
  if (!ff) ff = 2;
  if (!ohf) ohf = 1;

  const base_query = {};

  base_query.DATE = { $gte: new Date(start), $lte: new Date(end) };

  if (item) {
    base_query.ITEM = { $in: item.split(",") };
  }

  if (cust && cust.startsWith("^")) {
    let temp = cust.split("^");
    var reg = new RegExp(`${temp[1]}`, "i");

    base_query.CNAME = reg;
  } else if (cust) {
    base_query.CUST = { $in: cust.split(",") };
  }

  const sales = await Sales.find(base_query).lean().exec();

  const data = helper.MAP_PROCESSOR(ff, ohf, sales);

  reply.code(201).send({ data: data });
};

/**
 * TODO: make optimizations
 */
exports.getQtySoldPerMonth = async (req, reply) => {
  const { start, end, item } = req.query;

  const sales = await Sales.find({
    DATE: { $gte: new Date(start), $lte: new Date(end) },
    ITEM: { $in: item.split(",") },
  });

  const response = helper.process_qty_into_months(sales);

  reply.code(201).send(response);
};

/**
 * TODO: optimize by processing on server instead of via mongodb aggregation
 */
exports.getQtySoldPerDay = async (req, reply) => {
  const start = req.query.start;
  const end = req.query.end;
  const item = req.query.item;

  const [match, group] = SALES_BY_QUANT_AGGREGATION(start, end, item);

  const sales = await Sales.aggregate([
    match,
    group,
    {
      $sort: {
        _id: 1,
      },
    },
  ]);

  reply.code(201).send({ data: sales });
};

/**
 *
 * RETIRED ENDPOINT
 *
 * original implementation is scrapped in favor of reducing db processing to minimal
 * and instead processing data on the rest api instead.
 *
 * gains in speed were tremendous.
 *
 * additional changes were preprocessing various variables that were being acted upon
 * eg) instead of basing freight/overhead on quantity, it is applied directly to mongodb
 */
exports.getSalesByPeriod = async (req, reply) => {
  const start = req.query.start;
  const end = req.query.end;
  const freightFactor = parseFloat(req.query.ff);
  const overheadFactor = parseFloat(req.query.ohf);

  const [tf_match, tf_group] = TRADEFEES_AGG_FOR_REDUCER(start, end);
  const [match, group] = DEFAULT_AGG(start, end, (item = null), (cust = null));
  const frOhCom = CALC_FR_OH_COMM(freightFactor, overheadFactor);

  const tf = await Sales.aggregate([
    tf_match,
    tf_group,
    TRADEFEES,
    { $unwind: "$sales" },
    { $sort: { sales: -1 } },
  ]);

  const tf_final = tf
    .map(function (x, _) {
      return { iid: x._id.iid, tradefees: x.tradefees };
    })
    .reduce((r, { iid, tradefees }) => {
      var temp = r.find((o) => iid === o.iid);

      if (!temp) {
        r.push((temp = { iid, tradefees: 0 }));
      }
      temp.tradefees += tradefees;

      return r;
    }, []);

  const sales = await Sales.aggregate([
    match,
    group,
    frOhCom,
    TRADEFEES,
    GP,
    GPM,
    AVG_SALE_PRICE,
    AVG_DISCOUNTED_PRICE,
    { $unwind: "$sales" },
    { $sort: { sales: -1 } },
  ]);

  const final_sales = sales.map(
    ({
      _id,
      quantity,
      sales,
      costs,
      rebates,
      freight,
      overhead,
      commissions,
      avgSalePrice,
      grossProfit,
      grossProfitMargin,
    }) => ({
      _id,
      quantity,
      sales,
      costs,
      rebates,
      freight,
      overhead,
      commissions,
      avgSalePrice,
      tradefees: tf_final
        .filter((obj) => obj.iid === _id.iid)
        .map((obj) => obj.tradefees)[0],
      grossProfit:
        grossProfit -
        tf_final
          .filter((obj) => obj.iid === _id.iid)
          .map((obj) => obj.tradefees)[0],
      grossProfitMargin:
        ((grossProfit -
          tf_final
            .filter((obj) => obj.iid === _id.iid)
            .map((obj) => obj.tradefees)[0]) /
          sales) *
        100,
    })
  );

  reply.code(201).send({ data: final_sales });
};

/**
 * RETIRED ENDPOINT - maintain for personal growth
 */
exports.getSalesForPeriodByItem = async (req, reply) => {
  const start = req.query.start;
  const end = req.query.end;
  const item = req.query.item;
  const freightFactor = parseFloat(req.query.ff);
  const overheadFactor = parseFloat(req.query.ohf);

  const [match, group] = DEFAULT_AGG(start, end, item, (cust = null));
  const frOhCom = CALC_FR_OH_COMM(freightFactor, overheadFactor);
  const [tf_match, tf_group] = TRADEFEES_AGG_FOR_REDUCER(start, end);

  const tf = await Sales.aggregate([
    tf_match,
    tf_group,
    TRADEFEES,
    { $unwind: "$sales" },
    { $sort: { sales: -1 } },
  ]);

  const tf_final = tf
    .map(function (x, _) {
      return { iid: x._id.iid, tradefees: x.tradefees };
    })
    .reduce((r, { iid, tradefees }) => {
      var temp = r.find((o) => iid === o.iid);

      if (!temp) {
        r.push((temp = { iid, tradefees: 0 }));
      }
      temp.tradefees += tradefees;

      return r;
    }, []);

  const sales = await Sales.aggregate([
    match,
    group,
    frOhCom,
    TRADEFEES,
    GP,
    GPM,
    AVG_SALE_PRICE,
    AVG_DISCOUNTED_PRICE,
    { $unwind: "$sales" },
    { $sort: { sales: -1 } },
  ]);

  const final_sales = sales.map(
    ({
      _id,
      quantity,
      sales,
      costs,
      rebates,
      freight,
      overhead,
      commissions,
      avgSalePrice,
      grossProfit,
    }) => ({
      _id,
      quantity,
      sales,
      costs,
      rebates,
      freight,
      overhead,
      commissions,
      avgSalePrice,
      avgSalePriceAfterDiscounts:
        quantity > 0 &&
        sales -
          rebates -
          tf_final
            .filter((obj) => obj.iid === _id.iid)
            .map((obj) => obj.tradefees)[0] >
          0
          ? (sales -
              rebates -
              tf_final
                .filter((obj) => obj.iid === _id.iid)
                .map((obj) => obj.tradefees)[0]) /
            quantity
          : avgSalePrice,
      tradefees: tf_final
        .filter((obj) => obj.iid === _id.iid)
        .map((obj) => obj.tradefees)[0],
      grossProfit:
        quantity > 0 &&
        sales -
          rebates -
          freight -
          overhead -
          commissions -
          tf_final
            .filter((obj) => obj.iid === _id.iid)
            .map((obj) => obj.tradefees)[0] >
          0
          ? grossProfit -
            tf_final
              .filter((obj) => obj.iid === _id.iid)
              .map((obj) => obj.tradefees)[0]
          : 0,
      grossProfitMargin:
        sales > 0
          ? ((grossProfit -
              tf_final
                .filter((obj) => obj.iid === _id.iid)
                .map((obj) => obj.tradefees)[0]) /
              sales) *
            100
          : 0,
    })
  );

  if (!item) {
    reply.code(201).send({ data: final_sales });
  } else {
    reply.code(201).send({ data: sales });
  }
};

/**
 * RETIRED ENDPOINT - maintain for personal growth
 */
exports.getSalesForPeriodByCust = async (req, reply) => {
  const start = req.query.start;
  const end = req.query.end;
  const cust = req.query.cust;
  const freightFactor = parseFloat(req.query.ff);
  const overheadFactor = parseFloat(req.query.ohf);

  const [match, group] = DEFAULT_AGG(start, end, (item = null), cust);
  const frOhCom = CALC_FR_OH_COMM(freightFactor, overheadFactor);

  const sales = await Sales.aggregate([
    match,
    group,
    frOhCom,
    GP,
    GPM,
    AVG_SALE_PRICE,
    AVG_DISCOUNTED_PRICE,
    { $unwind: "$sales" },
    { $sort: { sales: -1 } },
  ]);

  reply.code(201).send({ data: sales });
};
