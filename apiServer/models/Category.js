var {
  Schema,
  model,
  Types: { ObjectId },
} = require("mongoose");

var schema;

schema = new Schema({
  name: { type: String, required: true, index: 1 },
  label: String,
  description: String,
  order: { type: Number, default: 1 },
  coverPhoto: { type: String, default: "" },
});

module.exports = model("Category", schema);
