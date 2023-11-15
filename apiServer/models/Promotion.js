var {
  Schema,
  model,
  Types: { ObjectId },
} = require("mongoose");

var schema;

schema = new Schema({
  name: String,
  price: Number,
  stock: Number,
  discount: Number,
  category: ObjectId,
  supplier: ObjectId,
  createdAt: Date,
  coverPhoto: String,
  photos: { type: [String], default: [] },
});

module.exports = model("Product", schema);
