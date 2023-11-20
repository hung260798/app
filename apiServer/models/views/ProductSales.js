const mongoose = require("mongoose");

const schema = new mongoose.Schema(
  {
    _id: mongoose.Types.ObjectId,
    name: String,
    price: Number,
    sold: Number,
    categoryId: mongoose.Types.ObjectId,
  },
  {
    autoCreate: false,
    autoIndex: false,
  }
);

const ProductSalesView = mongoose.model(
  "ProductSalesView",
  schema,
  "productSalesView"
);
const pipeline = [
  {
    $lookup: {
      from: "orders",
      let: {
        id: "$_id",
      },
      pipeline: [
        {
          $match: {
            $expr: {
              $in: ["$$id", "$items.id"],
            },
          },
        },
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
    $unwind: {
      path: "$inOrders",
    },
  },
  {
    $unwind: {
      path: "$inOrders.items",
    },
  },
  {
    $addFields: {
      orderId: "$inOrders._id",
      itemId: "$inOrders.items.id",
      qty: "$inOrders.items.quantity",
    },
  },
  {
    $match: {
      $expr: {
        $eq: ["$_id", "$itemId"],
      },
    },
  },
  {
    $group: {
      _id: {
        productId: "$_id",
        name: "$name",
        price: "$price",
        discount: "$discount",
        category: "$category",
      },
      sold: {
        $sum: "$qty",
      },
    },
  },
  {
    $addFields: {
      _id: "$_id.productId",
      name: "$_id.name",
      price: "$_id.price",
      category: "$_id.category",
      sold: "$sold",
    },
  },
];

(async () => {
  await mongoose.connection.dropCollection("productSalesView");
  await ProductSalesView.createCollection({
    viewOn: "products",
    pipeline: pipeline,
  });
})();

module.exports = { ProductSalesView };
