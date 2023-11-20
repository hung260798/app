const mongoose = require("mongoose");

const schema = new mongoose.Schema(
  {
    _id: mongoose.Types.ObjectId,
    name: String,
    categoryId: mongoose.Types.ObjectId,
    totalPrice: Number,
  },
  {
    autoCreate: false,
    autoIndex: false,
  }
);

const ProductTotalPrice = mongoose.model(
  "ProductTotalPriceView",
  schema,
  "productTotalPriceView"
);
const pipeline = [
  {
    $lookup: {
      from: "orders",
      localField: "_id",
      foreignField: "items.id",
      pipeline: [
        {
          $project: {
            items: 1,
          },
        },
      ],
      as: "inOrders",
    },
  },
  {
    $project: {
      name: 1,
      categoryId: "$category.id",
      inOrders: 1,
    },
  },
  {
    $addFields: {
      total: {
        $map: {
          input: "$inOrders",
          as: "order",
          in: {
            $filter: {
              input: "$$order.items",
              as: "items",
              cond: {
                $eq: ["$$items.id", "$_id"],
              },
            },
          },
        },
      },
    },
  },
  {
    $unset: "inOrders",
  },
  {
    $addFields: {
      total: {
        $reduce: {
          input: "$total",
          initialValue: [],
          in: {
            $concatArrays: ["$$value", "$$this"],
          },
        },
      },
    },
  },
  {
    $addFields: {
      total: {
        $reduce: {
          input: "$total",
          initialValue: 0,
          in: {
            $sum: [
              "$$value",
              {
                $multiply: [
                  "$$this.price",
                  "$$this.quantity",
                  {
                    $subtract: [
                      1,
                      {
                        $divide: ["$$this.discount", 100],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        },
      },
    },
  },
];

(async () => {
  await mongoose.connection.dropCollection("productTotalPriceView");
  await ProductTotalPrice.createCollection({
    viewOn: "products",
    pipeline,
  });
})();

module.exports = { ProductTotalPrice };
