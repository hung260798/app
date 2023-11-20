var {
  Schema,
  model,
  Types: { ObjectId },
} = require("mongoose");

var schema;

schema = new Schema({
  name: { type: String, required: true, index: 1 },
  description: { type: String, default: "no description" },
  price: { type: Number, min: 0, required: true },
  stock: { type: Number, min: 0, required: true },
  discount: { type: Number, min: 0, max: 100, default: 0 },
  category: {
    id: ObjectId,
    name: String,
  },
  supplier: {
    id: ObjectId,
    name: String,
  },
  createdAt: { type: Date, default: new Date() },
  coverPhoto: { type: String, required: true },
  photos: { type: [String], default: [] },
  isActive: { type: Boolean, default: true },
});

module.exports = model("Product", schema);
