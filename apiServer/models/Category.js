var {
  Schema,
  model,
  Types: { ObjectId },
} = require("mongoose");

var schema;

schema = new Schema({
  name: String,
  label: String,
  description: String,
  order: Number,
  coverPhoto: String,
});

module.exports = model("Category", schema);
