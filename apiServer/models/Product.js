var {
  Schema,
  model,
  Types: { ObjectId },
} = require("mongoose");

var md, schema;

schema = new Schema({
  name: String,
  price: Number,
  stock: Number,
  discount: Number,
  sold: Number,
  soldThisMonth: Number,
  category: ObjectId,
  supplier: ObjectId,
  createdAt: Date,
  coverPhoto: String,
  photos: { type: [String], default: [] },
});

module.exports = model("Product", schema);
