var {
  Schema,
  model,
  Types: { ObjectId },
} = require("mongoose");

var schema;

schema = new Schema({
  name: String,
  description: String,
  price: { type: Number, min: 0 },
  stock: { type: Number, min: 0 },
  discount: { type: Number, min: 0, max: 100, default: 0 },
  sold: { type: Number, min: 0, default: 0 },
  soldThisMonth: { type: Number, min: 0 },
  category: ObjectId,
  supplier: ObjectId,
  createdAt: { type: Date, default: new Date() },
  coverPhoto: String,
  photos: { type: [String], default: [] },
});

module.exports = model("Product", schema);
