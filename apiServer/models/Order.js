var {
  Schema,
  model,
  Types: { ObjectId },
} = require("mongoose");

var schema;

schema = new Schema(
  {
    customer: {
      id: { type: ObjectId, required: true },
      name: String,
    },
    createdAt: { type: Date, default: new Date() },
    verifiedAt: { type: Date },
    completedAt: { type: Date },
    isVerified: { type: Boolean, default: false },
    status: {
      type: String,
      default: "WAITING",
      uppercase: true,
      enum: ["WAITING", "COMPLETED", "CANCELLED"],
    },
    payment: {
      type: String,
      default: "CASH",
      enum: ["CASH", "CREDIT"],
      uppercase: true,
    },
    shippingAddress: String,
    items: [
      {
        id: { type: ObjectId, required: true },
        name: String,
        price: { type: Number },
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
