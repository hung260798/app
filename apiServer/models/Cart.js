var {
  Schema,
  model,
  Types: { ObjectId },
} = require("mongoose");

var md, schema;

schema = new Schema({
  customerId: ObjectId,
  items: [
    {
      id: ObjectId,
      name: String,
      quantity: Number,
      price: Number,
    },
  ],
});

module.exports = model("Cart", schema);
