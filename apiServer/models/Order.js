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
    createdAt: { type: Date, default: new Date() },
    verifiedAt: { type: Date, default: null },
    completedAt: { type: Date, default: null },
    status: {
      type: String,
      default: "VERIFYING",
      uppercase: true,
      enum: ["VERIFYING", "SHIPPING", "COMPLETED", "CANCELLED"],
    },
    payment: { type: String, default: "CASH", uppercase: true },
    shippingAddress: String,
    items: [
      {
        id: ObjectId,
        name: String,
        price: Number,
        quantity: { type: Number, default: 1 },
        discount: { type: Number, default: 0 },
      },
    ],
  },
  {
    virtuals: {
      total: {
        get() {
          let total = 0;
          for (const { price = 0, quantity: qty, discount = 0 } of this.items) {
            total += price * qty * (1 - discount / 100);
          }
          return total;
        },
      },
    },
  }
);

module.exports = model("Order", schema);
