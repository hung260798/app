var {
  Schema,
  model,
  Types: { ObjectId },
} = require("mongoose");

var schema;

schema = new Schema(
  {
    customer: {
      id: ObjectId,
      fullname: String,
    },
    orderedAt: Date,
    verifiedAt: Date,
    completedAt: Date,
    status: String,
    payment: String,
    shippingAddress: String,
    items: [
      {
        id: ObjectId,
        name: String,
        stock: Number,
        price: Number,
        quantity: Number,
        discount: Number,
      },
    ],
  },
  {
    virtuals: {
      total: {
        get() {
          let total = 0;
          for (const { price = 0, quantity: qty = 0, discount = 0 } of this
            .items) {
            total += price * qty * (1 - discount / 100);
          }
          return total;
        },
      },
    },
  }
);

module.exports = model("Order", schema);
